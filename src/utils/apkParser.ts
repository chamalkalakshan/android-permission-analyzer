import JSZip from 'jszip';
import { XMLParser } from 'fast-xml-parser';

export interface ParsedManifest {
  packageName: string;
  appName: string;
  versionName: string;
  versionCode: string;
  minSdkVersion: string;
  targetSdkVersion: string;
  permissions: string[];
  activities: string[];
  services: string[];
  receivers: string[];
  providers: string[];
}

// Binary AXML magic: file type 0x0003, header size 0x0008
const AXML_MAGIC = 0x00080003;

export async function parseApk(file: File): Promise<ParsedManifest> {
  const buffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(buffer);
  const manifestFile = zip.file('AndroidManifest.xml');
  if (!manifestFile) throw new Error('AndroidManifest.xml not found in APK.');

  const manifestData = await manifestFile.async('arraybuffer');
  const view = new DataView(manifestData);

  if (view.byteLength >= 4 && view.getUint32(0, true) === AXML_MAGIC) {
    return parseBinaryManifest(manifestData);
  }

  const text = new TextDecoder().decode(manifestData);
  return parseXmlManifest(text);
}

export function parseXmlText(text: string): ParsedManifest {
  return parseXmlManifest(text);
}

function parseXmlManifest(xml: string): ParsedManifest {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    isArray: (name) => ['uses-permission', 'activity', 'service', 'receiver', 'provider'].includes(name),
  });

  const result = parser.parse(xml);
  const manifest = result?.manifest || result?.['?xml']?.manifest || Object.values(result)[0] || {};

  const permissions: string[] = [];
  const upList = manifest['uses-permission'] || [];
  (Array.isArray(upList) ? upList : [upList]).forEach((p: Record<string, string>) => {
    const name = p?.['@_android:name'] || p?.['@_name'] || '';
    if (name) permissions.push(name);
  });

  const app = manifest?.application || {};
  const extractNames = (items: unknown): string[] => {
    if (!items) return [];
    return (Array.isArray(items) ? items : [items])
      .map((i: Record<string, string>) => i?.['@_android:name'] || i?.['@_name'] || '')
      .filter(Boolean);
  };

  return {
    packageName: manifest?.['@_package'] || 'Unknown',
    appName: app?.['@_android:label'] || manifest?.['@_package'] || 'Unknown',
    versionName: manifest?.['@_android:versionName'] || manifest?.['@_versionName'] || '?',
    versionCode: manifest?.['@_android:versionCode'] || manifest?.['@_versionCode'] || '?',
    minSdkVersion: manifest?.['uses-sdk']?.['@_android:minSdkVersion'] || '?',
    targetSdkVersion: manifest?.['uses-sdk']?.['@_android:targetSdkVersion'] || '?',
    permissions,
    activities: extractNames(app?.activity),
    services: extractNames(app?.service),
    receivers: extractNames(app?.receiver),
    providers: extractNames(app?.provider),
  };
}

/**
 * Parses Android binary XML (AXML) format from APK's AndroidManifest.xml.
 *
 * AXML chunk layout:
 *   File header:       type(2) + headerSize(2) + fileSize(4)   = 8 bytes
 *   String pool:       ResChunk_header(8) + ResStringPool_header(20) + offsets + data
 *   Resource map:      optional, type 0x0180
 *   XML events:        namespace start/end (0x0100/0x0101), element start/end (0x0102/0x0103)
 *
 * Start-element chunk (type 0x0102):
 *   ResChunk_header(8) + lineNumber(4) + comment(4)   = 16 bytes  (ResXMLTree_node)
 *   ns(4) + name(4) + attrStart(2) + attrSize(2) + attrCount(2) + idIdx(2) + classIdx(2) + styleIdx(2)  (ResXMLTree_attrExt)
 *   → ns at offset+16, name at offset+20, attrCount at offset+28, attrs at offset+36
 *
 * Each attribute (ResXMLTree_attribute, 20 bytes):
 *   ns(4) + name(4) + rawValue(4) + typedValue{ size(2)+res0(1)+dataType(1)+data(4) }
 *   → dataType at attrBase+15, data at attrBase+16
 */
function parseBinaryManifest(buffer: ArrayBuffer): ParsedManifest {
  const permissions: string[] = [];
  const activities: string[] = [];
  const services: string[] = [];
  const receivers: string[] = [];
  const providers: string[] = [];
  let packageName = 'Unknown';
  let versionName = '?';
  let versionCode = '?';
  let minSdkVersion = '?';
  let targetSdkVersion = '?';

  try {
    const view = new DataView(buffer);

    // ── String pool chunk (starts at offset 8, right after file header) ────
    const poolStart = 8;
    if (view.getUint16(poolStart, true) !== 0x0001) {
      throw new Error('No string pool at expected offset');
    }
    const poolSize     = view.getUint32(poolStart + 4, true);
    const stringCount  = view.getUint32(poolStart + 8, true);
    const flags        = view.getUint32(poolStart + 16, true);
    const stringsStart = view.getUint32(poolStart + 20, true);
    const isUtf8       = (flags & 0x100) !== 0;

    // String offset array at poolStart + 28 (after 28-byte header)
    const strDataBase = poolStart + stringsStart;
    const strings: string[] = [];

    for (let i = 0; i < stringCount; i++) {
      const off = view.getUint32(poolStart + 28 + i * 4, true);
      strings.push(readPoolString(view, buffer, strDataBase + off, isUtf8));
    }

    let offset = poolStart + poolSize;

    // ── Skip optional resource map (type 0x0180) ───────────────────────────
    if (offset + 8 <= buffer.byteLength && view.getUint16(offset, true) === 0x0180) {
      offset += view.getUint32(offset + 4, true);
    }

    // ── Walk XML event chunks ──────────────────────────────────────────────
    let currentElement = '';

    while (offset + 8 <= buffer.byteLength) {
      const chunkType = view.getUint16(offset, true);
      const chunkSize = view.getUint32(offset + 4, true);
      if (chunkSize < 8) break;

      if (chunkType === 0x0102) {
        // Start element
        // name index at offset+20, attrCount at offset+28, attrs at offset+36
        const nameIdx  = view.getInt32(offset + 20, true);
        const attrCount = view.getUint16(offset + 28, true);
        currentElement = getString(strings, nameIdx);

        for (let a = 0; a < attrCount && a < 500; a++) {
          const base = offset + 36 + a * 20;
          if (base + 20 > buffer.byteLength) break;

          const nsIdx       = view.getInt32(base + 0, true);
          const nameAttrIdx = view.getInt32(base + 4, true);
          const rawValIdx   = view.getInt32(base + 8, true);
          const dataType    = view.getUint8(base + 15);
          const dataVal     = view.getInt32(base + 16, true);

          const ns       = getString(strings, nsIdx);
          const attrName = getString(strings, nameAttrIdx);

          let strValue = '';
          if (dataType === 0x03) {
            // TYPE_STRING — value is a string pool index
            strValue = getString(strings, rawValIdx);
          } else if (dataType === 0x10 || dataType === 0x11 || dataType === 0x12) {
            // TYPE_INT_DEC / TYPE_INT_HEX / TYPE_INT_BOOLEAN
            strValue = String(dataVal >>> 0);
          }

          const isAndroid = ns.includes('android');

          switch (currentElement) {
            case 'manifest':
              if (attrName === 'package')     packageName = strValue || packageName;
              if (attrName === 'versionName') versionName = strValue;
              if (attrName === 'versionCode' && isAndroid) versionCode = strValue;
              break;
            case 'uses-sdk':
              if (attrName === 'minSdkVersion')    minSdkVersion = strValue;
              if (attrName === 'targetSdkVersion') targetSdkVersion = strValue;
              break;
            case 'uses-permission':
              if (attrName === 'name' && strValue) permissions.push(strValue);
              break;
            case 'activity':
              if (attrName === 'name' && strValue) activities.push(strValue);
              break;
            case 'service':
              if (attrName === 'name' && strValue) services.push(strValue);
              break;
            case 'receiver':
              if (attrName === 'name' && strValue) receivers.push(strValue);
              break;
            case 'provider':
              if (attrName === 'name' && strValue) providers.push(strValue);
              break;
          }
        }
      }

      offset += chunkSize;
    }
  } catch (e) {
    console.warn('[apkParser] binary parse error:', e);
  }

  return {
    packageName,
    appName: packageName,
    versionName,
    versionCode,
    minSdkVersion,
    targetSdkVersion,
    permissions: [...new Set(permissions)],
    activities,
    services,
    receivers,
    providers,
  };
}

function getString(strings: string[], idx: number): string {
  return (idx >= 0 && idx < strings.length) ? strings[idx] : '';
}

function readPoolString(view: DataView, buffer: ArrayBuffer, base: number, isUtf8: boolean): string {
  if (base < 0 || base >= buffer.byteLength) return '';
  try {
    if (isUtf8) {
      // charLen prefix (1 or 2 bytes), then byteLen prefix (1 or 2 bytes), then UTF-8 bytes
      let pos = base;
      const c0 = view.getUint8(pos++);
      if (c0 & 0x80) pos++; // 2-byte char length encoding
      const b0 = view.getUint8(pos++);
      const byteLen = (b0 & 0x80)
        ? ((b0 & 0x7f) << 8 | view.getUint8(pos++))
        : b0;
      if (byteLen === 0) return '';
      const end = Math.min(pos + byteLen, buffer.byteLength);
      return new TextDecoder('utf-8').decode(new Uint8Array(buffer, pos, end - pos));
    } else {
      // UTF-16LE: uint16 length, then length × uint16 chars
      const len = view.getUint16(base, true);
      if (len === 0 || base + 2 + len * 2 > buffer.byteLength) return '';
      const chars: string[] = [];
      for (let c = 0; c < len; c++) {
        const ch = view.getUint16(base + 2 + c * 2, true);
        if (ch === 0) break;
        chars.push(String.fromCharCode(ch));
      }
      return chars.join('');
    }
  } catch {
    return '';
  }
}
