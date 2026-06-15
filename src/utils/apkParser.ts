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

const BINARY_XML_MAGIC = 0x00080003;

export async function parseApk(file: File): Promise<ParsedManifest> {
  const buffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(buffer);
  const manifestFile = zip.file('AndroidManifest.xml');
  if (!manifestFile) throw new Error('AndroidManifest.xml not found in APK.');

  const manifestData = await manifestFile.async('arraybuffer');
  const view = new DataView(manifestData);

  // Check if binary XML (APK) or plain XML
  if (view.byteLength >= 4 && view.getUint32(0, true) === BINARY_XML_MAGIC) {
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
    const arr = Array.isArray(items) ? items : [items];
    return arr.map((i: Record<string, string>) => i?.['@_android:name'] || i?.['@_name'] || '').filter(Boolean);
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

// Binary AndroidManifest.xml parser (AXML format)
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
    let offset = 8; // skip file header

    // String pool chunk
    const stringPoolType = view.getUint16(offset, true);
    if (stringPoolType !== 0x0001) throw new Error('Expected string pool');
    const stringPoolSize = view.getUint32(offset + 4, true);
    const stringCount = view.getUint32(offset + 8, true);
    const stringsStart = view.getUint32(offset + 20, true);
    const offsets: number[] = [];
    for (let i = 0; i < stringCount; i++) {
      offsets.push(view.getUint32(offset + 28 + i * 4, true));
    }
    const strBase = offset + stringsStart;
    const strings: string[] = offsets.map(o => {
      const strOffset = strBase + o;
      if (strOffset + 2 > buffer.byteLength) return '';
      const len = view.getUint16(strOffset, true);
      let s = '';
      for (let c = 0; c < len && strOffset + 2 + c * 2 + 1 < buffer.byteLength; c++) {
        const ch = view.getUint16(strOffset + 2 + c * 2, true);
        if (ch === 0) break;
        s += String.fromCharCode(ch);
      }
      return s;
    });

    offset += stringPoolSize;

    // Resource map chunk (optional)
    if (offset + 2 <= buffer.byteLength) {
      const chunkType = view.getUint16(offset, true);
      if (chunkType === 0x0180) {
        const chunkSize = view.getUint32(offset + 4, true);
        offset += chunkSize;
      }
    }

    let currentElement = '';

    while (offset + 8 <= buffer.byteLength) {
      const chunkType = view.getUint16(offset, true);
      const chunkSize = view.getUint32(offset + 4, true);
      if (chunkSize === 0) break;

      if (chunkType === 0x0102) {
        // Start element
        const attrCount = view.getUint16(offset + 20, true);
        const nameIdx = view.getUint32(offset + 16, true);
        currentElement = strings[nameIdx] || '';

        for (let a = 0; a < attrCount; a++) {
          const attrBase = offset + 28 + a * 20;
          if (attrBase + 20 > buffer.byteLength) break;
          const nsIdx = view.getInt32(attrBase, true);
          const nameAttrIdx = view.getInt32(attrBase + 4, true);
          const valueType = view.getUint8(attrBase + 15);
          const valueData = view.getInt32(attrBase + 16, true);
          const valueStrIdx = view.getInt32(attrBase + 8, true);

          const ns = nsIdx >= 0 ? strings[nsIdx] : '';
          const attrName = nameAttrIdx >= 0 ? strings[nameAttrIdx] : '';
          const isAndroidNs = ns?.includes('android');

          let strValue = '';
          if (valueType === 0x03 && valueStrIdx >= 0) {
            strValue = strings[valueStrIdx] || '';
          } else if (valueType === 0x10 || valueType === 0x11) {
            strValue = String(valueData);
          }

          if (currentElement === 'manifest') {
            if (attrName === 'package') packageName = strValue;
            if (attrName === 'versionName' && isAndroidNs) versionName = strValue;
            if (attrName === 'versionCode' && isAndroidNs) versionCode = strValue;
          }
          if (currentElement === 'uses-sdk') {
            if (attrName === 'minSdkVersion') minSdkVersion = strValue;
            if (attrName === 'targetSdkVersion') targetSdkVersion = strValue;
          }
          if (currentElement === 'uses-permission' && attrName === 'name') {
            if (strValue) permissions.push(strValue);
          }
          if (currentElement === 'activity' && attrName === 'name') {
            if (strValue) activities.push(strValue);
          }
          if (currentElement === 'service' && attrName === 'name') {
            if (strValue) services.push(strValue);
          }
          if (currentElement === 'receiver' && attrName === 'name') {
            if (strValue) receivers.push(strValue);
          }
          if (currentElement === 'provider' && attrName === 'name') {
            if (strValue) providers.push(strValue);
          }
        }
      }

      offset += chunkSize;
    }
  } catch {
    // Best-effort parsing
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
