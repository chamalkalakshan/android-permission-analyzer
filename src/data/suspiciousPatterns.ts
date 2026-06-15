export interface SuspiciousPattern {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium';
  description: string;
  permissions: string[];
  recommendation: string;
}

const PATTERNS: Array<Omit<SuspiciousPattern, 'id'> & { requires: string[]; any?: string[] }> = [
  {
    title: 'Silent Surveillance Capability',
    severity: 'critical',
    requires: ['android.permission.RECORD_AUDIO', 'android.permission.CAMERA'],
    description: 'App can record both audio and video, enabling covert surveillance of the user and surroundings.',
    permissions: ['android.permission.RECORD_AUDIO', 'android.permission.CAMERA'],
    recommendation: 'Only grant if this app is a legitimate video calling or media application.',
  },
  {
    title: 'OTP / 2FA Interception',
    severity: 'critical',
    requires: ['android.permission.READ_SMS', 'android.permission.RECEIVE_SMS'],
    description: 'Can read AND intercept incoming SMS messages, allowing theft of one-time passwords and 2FA codes.',
    permissions: ['android.permission.READ_SMS', 'android.permission.RECEIVE_SMS'],
    recommendation: 'Extremely dangerous. Only default SMS apps require both permissions.',
  },
  {
    title: 'Location + Microphone (Covert Listening)',
    severity: 'critical',
    requires: ['android.permission.ACCESS_FINE_LOCATION', 'android.permission.RECORD_AUDIO'],
    description: 'Combining precise location with microphone access enables pinpoint audio surveillance — recording what you say and exactly where you are.',
    permissions: ['android.permission.ACCESS_FINE_LOCATION', 'android.permission.RECORD_AUDIO'],
    recommendation: 'Legitimate apps rarely need both. Review with extreme caution.',
  },
  {
    title: 'Background Location Tracking',
    severity: 'critical',
    requires: ['android.permission.ACCESS_FINE_LOCATION', 'android.permission.ACCESS_BACKGROUND_LOCATION'],
    description: 'App tracks your precise GPS location 24/7, even when you are not using it.',
    permissions: ['android.permission.ACCESS_FINE_LOCATION', 'android.permission.ACCESS_BACKGROUND_LOCATION'],
    recommendation: 'Only navigation and fitness apps have a legitimate need for this combination.',
  },
  {
    title: 'Credential Harvesting Screen Overlay',
    severity: 'critical',
    requires: ['android.permission.SYSTEM_ALERT_WINDOW'],
    any: ['android.permission.INTERNET', 'android.permission.ACCESS_NETWORK_STATE'],
    description: 'App can draw overlays on top of any app (including banking apps) and transmit data over the internet — classic clickjacking attack setup.',
    permissions: ['android.permission.SYSTEM_ALERT_WINDOW', 'android.permission.INTERNET'],
    recommendation: 'Very suspicious combination. Only legitimate use cases include screen readers and assistive apps.',
  },
  {
    title: 'Malware Dropper',
    severity: 'critical',
    requires: ['android.permission.REQUEST_INSTALL_PACKAGES', 'android.permission.INTERNET'],
    description: 'App can download files from the internet and install additional APK packages — a common malware dropper pattern.',
    permissions: ['android.permission.REQUEST_INSTALL_PACKAGES', 'android.permission.INTERNET'],
    recommendation: 'Only app stores and enterprise MDM apps have a legitimate need for this.',
  },
  {
    title: 'SMS Fraud',
    severity: 'high',
    requires: ['android.permission.SEND_SMS', 'android.permission.RECEIVE_SMS'],
    description: 'App can silently send and receive SMS messages — enabling premium number fraud and SMS phishing.',
    permissions: ['android.permission.SEND_SMS', 'android.permission.RECEIVE_SMS'],
    recommendation: 'Only SMS messenger apps need both. Revoke if app is not your default SMS app.',
  },
  {
    title: 'Phone Identity + Internet (Tracking)',
    severity: 'high',
    requires: ['android.permission.READ_PHONE_STATE', 'android.permission.INTERNET'],
    description: 'App can read your device IMEI and phone number, then send this to remote servers for cross-app tracking.',
    permissions: ['android.permission.READ_PHONE_STATE', 'android.permission.INTERNET'],
    recommendation: 'Device identifiers are permanent. This combination enables tracking that persists across app reinstallations.',
  },
  {
    title: 'Contact + SMS Exfiltration',
    severity: 'high',
    requires: ['android.permission.READ_CONTACTS', 'android.permission.READ_SMS'],
    description: 'App can access your full contact list and SMS history — your entire social and communication graph.',
    permissions: ['android.permission.READ_CONTACTS', 'android.permission.READ_SMS'],
    recommendation: 'Social network apps may need contacts but rarely SMS. Review carefully.',
  },
  {
    title: 'Persistence on Reboot',
    severity: 'medium',
    requires: ['android.permission.RECEIVE_BOOT_COMPLETED', 'android.permission.FOREGROUND_SERVICE'],
    description: 'App will automatically start on device boot and run as a persistent background service — a common spyware persistence mechanism.',
    permissions: ['android.permission.RECEIVE_BOOT_COMPLETED', 'android.permission.FOREGROUND_SERVICE'],
    recommendation: 'Legitimate for music players and messaging apps. Suspicious for simple utility apps.',
  },
  {
    title: 'Photo Metadata Location Leak',
    severity: 'medium',
    requires: ['android.permission.READ_MEDIA_IMAGES', 'android.permission.INTERNET'],
    description: 'App can access all your photos (which contain GPS coordinates in EXIF data) and send them online — bypassing location permission.',
    permissions: ['android.permission.READ_MEDIA_IMAGES', 'android.permission.INTERNET'],
    recommendation: 'Photo editing apps are legitimate. Be wary of apps that have no clear photo-related purpose.',
  },
  {
    title: 'Crypto Mining (Battery Drain)',
    severity: 'medium',
    requires: ['android.permission.WAKE_LOCK', 'android.permission.INTERNET'],
    description: 'App prevents the device from sleeping and maintains internet connectivity — a known pattern for cryptocurrency mining malware.',
    permissions: ['android.permission.WAKE_LOCK', 'android.permission.INTERNET'],
    recommendation: 'Legitimate for music streaming and navigation apps. Watch for unexpected battery drain.',
  },
  {
    title: 'Calendar + Contacts Intelligence',
    severity: 'medium',
    requires: ['android.permission.READ_CALENDAR', 'android.permission.READ_CONTACTS'],
    description: 'Together these permissions reveal your full social network — who you meet, when, where, and how you know them.',
    permissions: ['android.permission.READ_CALENDAR', 'android.permission.READ_CONTACTS'],
    recommendation: 'Productivity and CRM apps have legitimate uses. Unnecessary for games or utility apps.',
  },
];

export function detectSuspiciousPatterns(grantedPermissions: string[]): SuspiciousPattern[] {
  const permSet = new Set(grantedPermissions);
  const found: SuspiciousPattern[] = [];

  PATTERNS.forEach((pattern, idx) => {
    const allRequired = pattern.requires.every(p => permSet.has(p));
    const anyMatch = !pattern.any || pattern.any.some(p => permSet.has(p));
    if (allRequired && anyMatch) {
      found.push({ ...pattern, id: `pattern-${idx}` });
    }
  });

  return found.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2 };
    return order[a.severity] - order[b.severity];
  });
}
