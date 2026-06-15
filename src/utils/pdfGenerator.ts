import jsPDF from 'jspdf';
import type { ParsedManifest } from './apkParser';
import type { SuspiciousPattern } from '../data/suspiciousPatterns';
import { getPermissionInfo, RISK_LABELS } from '../data/permissions';

const COLORS = {
  primary: [30, 41, 59] as [number, number, number],
  accent: [99, 102, 241] as [number, number, number],
  danger: [239, 68, 68] as [number, number, number],
  warning: [249, 115, 22] as [number, number, number],
  success: [34, 197, 94] as [number, number, number],
  gray: [100, 116, 139] as [number, number, number],
  lightGray: [241, 245, 249] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

function getSeverityColor(severity: string): [number, number, number] {
  if (severity === 'critical') return COLORS.danger;
  if (severity === 'high') return COLORS.warning;
  return [234, 179, 8];
}

function getRiskColor(risk: string): [number, number, number] {
  if (risk === 'dangerous') return COLORS.danger;
  if (risk === 'signature') return COLORS.warning;
  return COLORS.success;
}

export function generatePdfReport(
  manifest: ParsedManifest,
  suspiciousPatterns: SuspiciousPattern[],
  fileName: string,
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = 210;
  const margin = 15;
  const contentW = pageW - margin * 2;
  let y = 0;

  const addPage = () => {
    doc.addPage();
    y = 20;
  };

  const checkY = (needed = 20) => {
    if (y + needed > 270) addPage();
  };

  // ── Cover page ──────────────────────────────────────────────────────────────
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageW, 297, 'F');

  doc.setFillColor(...COLORS.accent);
  doc.rect(0, 70, pageW, 3, 'F');

  doc.setTextColor(...COLORS.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.text('Android Permission', margin, 50);
  doc.text('Security Report', margin, 62);

  doc.setFontSize(13);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(manifest.packageName, margin, 85);
  doc.text(`File: ${fileName}`, margin, 93);
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 101);

  // Stats box
  const dangerous = manifest.permissions.filter(p => getPermissionInfo(p).risk === 'dangerous').length;
  const total = manifest.permissions.length;
  const riskScore = suspiciousPatterns.filter(p => p.severity === 'critical').length * 30
    + suspiciousPatterns.filter(p => p.severity === 'high').length * 15
    + suspiciousPatterns.filter(p => p.severity === 'medium').length * 5;
  const clamped = Math.min(riskScore, 100);

  const statsY = 125;
  const gap = 4;
  const boxW = (contentW - gap * 3) / 4;
  const stats = [
    { label: 'Total Permissions', value: String(total), color: COLORS.accent },
    { label: 'Dangerous', value: String(dangerous), color: COLORS.danger },
    { label: 'Suspicious Patterns', value: String(suspiciousPatterns.length), color: COLORS.warning },
    { label: 'Risk Score', value: `${clamped}/100`, color: clamped > 50 ? COLORS.danger : COLORS.success },
  ];
  stats.forEach((s, i) => {
    const x = margin + i * (boxW + gap);
    doc.setFillColor(30, 41, 59);
    doc.setDrawColor(...s.color);
    doc.roundedRect(x, statsY, boxW, 28, 2, 2, 'FD');
    doc.setTextColor(...s.color);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(s.value, x + boxW / 2, statsY + 13, { align: 'center' });
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(s.label, x + boxW / 2, statsY + 22, { align: 'center' });
  });

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.text('Visual Android Permission Analyzer', margin, 285);
  doc.text('Page 1', pageW - margin, 285, { align: 'right' });

  // ── Page 2: App Info + Suspicious Patterns ────────────────────────────────
  addPage();

  const sectionTitle = (title: string, color = COLORS.accent) => {
    doc.setFillColor(...color);
    doc.rect(margin, y, 3, 8, 'F');
    doc.setTextColor(...COLORS.primary);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(title, margin + 6, y + 6);
    y += 14;
  };

  sectionTitle('App Information');

  const infoRows = [
    ['Package', manifest.packageName],
    ['Version', `${manifest.versionName} (code: ${manifest.versionCode})`],
    ['Min SDK', manifest.minSdkVersion],
    ['Target SDK', manifest.targetSdkVersion],
    ['Activities', String(manifest.activities.length)],
    ['Services', String(manifest.services.length)],
    ['Receivers', String(manifest.receivers.length)],
  ];

  infoRows.forEach(([label, value], i) => {
    if (i % 2 === 0) {
      doc.setFillColor(...COLORS.lightGray);
      doc.rect(margin, y - 1, contentW, 8, 'F');
    }
    doc.setTextColor(...COLORS.gray);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(label, margin + 2, y + 5);
    doc.setTextColor(...COLORS.primary);
    doc.setFont('helvetica', 'normal');
    doc.text(value, margin + 55, y + 5);
    y += 8;
  });
  y += 6;

  if (suspiciousPatterns.length > 0) {
    sectionTitle('Suspicious Permission Combinations', COLORS.danger);

    suspiciousPatterns.forEach(pattern => {
      checkY(35);
      const severityColor = getSeverityColor(pattern.severity);
      doc.setFillColor(...severityColor);
      doc.setTextColor(...COLORS.white);
      doc.roundedRect(margin, y, 22, 7, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.text(pattern.severity.toUpperCase(), margin + 11, y + 5, { align: 'center' });

      doc.setTextColor(...COLORS.primary);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(pattern.title, margin + 25, y + 5);
      y += 10;

      doc.setTextColor(...COLORS.gray);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      const descLines = doc.splitTextToSize(pattern.description, contentW - 5);
      doc.text(descLines, margin + 2, y);
      y += descLines.length * 4.5 + 2;

      doc.setFillColor(254, 243, 199);
      doc.setTextColor(146, 64, 14);
      doc.setFontSize(8);
      const recLines = doc.splitTextToSize(`Recommendation: ${pattern.recommendation}`, contentW - 8);
      doc.rect(margin, y, contentW, recLines.length * 4 + 4, 'F');
      doc.text(recLines, margin + 3, y + 4);
      y += recLines.length * 4 + 8;
    });
  }

  // ── Page(s): Permissions ──────────────────────────────────────────────────
  checkY(30);
  sectionTitle('All Permissions');

  manifest.permissions.forEach(perm => {
    checkY(30);
    const info = getPermissionInfo(perm);
    const riskColor = getRiskColor(info.risk);

    doc.setFillColor(...COLORS.lightGray);
    doc.roundedRect(margin, y, contentW, 26, 2, 2, 'F');
    doc.setFillColor(...riskColor);
    doc.roundedRect(margin, y, 3, 26, 1, 1, 'F');

    doc.setTextColor(...COLORS.primary);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(info.shortName, margin + 7, y + 6);

    doc.setFillColor(...riskColor);
    doc.roundedRect(margin + contentW - 32, y + 2, 30, 6, 1, 1, 'F');
    doc.setTextColor(...COLORS.white);
    doc.setFontSize(7);
    doc.text(RISK_LABELS[info.risk], margin + contentW - 17, y + 6.5, { align: 'center' });

    doc.setTextColor(...COLORS.gray);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    const catLine = `[${info.category}]  ${info.description}`;
    doc.text(catLine, margin + 7, y + 12);

    const accessLines = doc.splitTextToSize(`Data access: ${info.dataAccess}`, contentW - 40);
    doc.setFontSize(7);
    doc.text(accessLines, margin + 7, y + 17);

    y += 29;
  });

  // ── Footer on all pages ────────────────────────────────────────────────────
  const pageCount = (doc as jsPDF & { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages();
  for (let i = 2; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, 285, pageW - margin, 285);
    doc.setTextColor(...COLORS.gray);
    doc.setFontSize(8);
    doc.text('Visual Android Permission Analyzer', margin, 290);
    doc.text(`Page ${i} of ${pageCount}`, pageW - margin, 290, { align: 'right' });
  }

  doc.save(`permission-report-${manifest.packageName.replace(/\./g, '-')}.pdf`);
}
