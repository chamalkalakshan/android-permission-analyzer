export type RiskLevel = 'dangerous' | 'normal' | 'signature' | 'unknown';
export type PermissionCategory =
  | 'Location'
  | 'Camera'
  | 'Microphone'
  | 'Contacts'
  | 'Storage'
  | 'Phone'
  | 'SMS'
  | 'Calendar'
  | 'Sensors'
  | 'Network'
  | 'Bluetooth'
  | 'NFC'
  | 'Notifications'
  | 'System'
  | 'Other';

export interface PermissionInfo {
  name: string;
  shortName: string;
  risk: RiskLevel;
  category: PermissionCategory;
  description: string;
  dataAccess: string;
  realWorldAbuse?: string;
}

export const PERMISSION_DB: Record<string, PermissionInfo> = {
  'android.permission.ACCESS_FINE_LOCATION': {
    name: 'android.permission.ACCESS_FINE_LOCATION',
    shortName: 'ACCESS_FINE_LOCATION',
    risk: 'dangerous',
    category: 'Location',
    description: 'Access precise GPS location',
    dataAccess: 'GPS coordinates accurate to within a few meters, allowing real-time tracking of physical location',
    realWorldAbuse: 'Stalkerware apps use this to track victims without consent. Data brokers sell location history to advertisers.',
  },
  'android.permission.ACCESS_COARSE_LOCATION': {
    name: 'android.permission.ACCESS_COARSE_LOCATION',
    shortName: 'ACCESS_COARSE_LOCATION',
    risk: 'dangerous',
    category: 'Location',
    description: 'Access approximate location via Wi-Fi/cell towers',
    dataAccess: 'Location accurate to ~1km radius using network-based positioning',
    realWorldAbuse: 'Used to infer home/work locations and daily routines.',
  },
  'android.permission.ACCESS_BACKGROUND_LOCATION': {
    name: 'android.permission.ACCESS_BACKGROUND_LOCATION',
    shortName: 'ACCESS_BACKGROUND_LOCATION',
    risk: 'dangerous',
    category: 'Location',
    description: 'Access location even when app is not in use',
    dataAccess: 'Continuous location tracking 24/7 even when the screen is off',
    realWorldAbuse: 'Allows apps to build a complete movement history without user interaction.',
  },
  'android.permission.CAMERA': {
    name: 'android.permission.CAMERA',
    shortName: 'CAMERA',
    risk: 'dangerous',
    category: 'Camera',
    description: 'Access device camera',
    dataAccess: 'Full access to front and rear cameras; can take photos and record video',
    realWorldAbuse: 'Malicious apps can silently take photos and upload them to remote servers.',
  },
  'android.permission.RECORD_AUDIO': {
    name: 'android.permission.RECORD_AUDIO',
    shortName: 'RECORD_AUDIO',
    risk: 'dangerous',
    category: 'Microphone',
    description: 'Record audio via microphone',
    dataAccess: 'Access to all microphone input; can record conversations, ambient sounds',
    realWorldAbuse: 'Used in spyware to record private conversations without the user knowing.',
  },
  'android.permission.READ_CONTACTS': {
    name: 'android.permission.READ_CONTACTS',
    shortName: 'READ_CONTACTS',
    risk: 'dangerous',
    category: 'Contacts',
    description: 'Read contacts list',
    dataAccess: 'Names, phone numbers, email addresses, and profile photos of all contacts',
    realWorldAbuse: 'Social engineering — spammers harvest contact lists to send targeted phishing SMS.',
  },
  'android.permission.WRITE_CONTACTS': {
    name: 'android.permission.WRITE_CONTACTS',
    shortName: 'WRITE_CONTACTS',
    risk: 'dangerous',
    category: 'Contacts',
    description: 'Modify or delete contacts',
    dataAccess: 'Can add, modify, or delete any contact entry on the device',
    realWorldAbuse: 'Malware can inject malicious entries or delete important contacts.',
  },
  'android.permission.GET_ACCOUNTS': {
    name: 'android.permission.GET_ACCOUNTS',
    shortName: 'GET_ACCOUNTS',
    risk: 'dangerous',
    category: 'Contacts',
    description: 'Access list of accounts on device',
    dataAccess: 'All Google, social media, and app accounts linked to the device',
    realWorldAbuse: 'Reveals what services the user is signed into; used for credential stuffing attacks.',
  },
  'android.permission.READ_EXTERNAL_STORAGE': {
    name: 'android.permission.READ_EXTERNAL_STORAGE',
    shortName: 'READ_EXTERNAL_STORAGE',
    risk: 'dangerous',
    category: 'Storage',
    description: 'Read files from external storage',
    dataAccess: 'All files on SD card including photos, documents, downloads, and app data',
    realWorldAbuse: 'Exfiltration of personal photos, sensitive documents, and private files.',
  },
  'android.permission.WRITE_EXTERNAL_STORAGE': {
    name: 'android.permission.WRITE_EXTERNAL_STORAGE',
    shortName: 'WRITE_EXTERNAL_STORAGE',
    risk: 'dangerous',
    category: 'Storage',
    description: 'Write files to external storage',
    dataAccess: 'Can create, modify, or delete any file on external storage',
    realWorldAbuse: 'Ransomware encrypts all files on the SD card.',
  },
  'android.permission.READ_CALL_LOG': {
    name: 'android.permission.READ_CALL_LOG',
    shortName: 'READ_CALL_LOG',
    risk: 'dangerous',
    category: 'Phone',
    description: 'Read phone call history',
    dataAccess: 'All incoming/outgoing call records including numbers, duration, and timestamps',
    realWorldAbuse: 'Reveals communication patterns and relationships with specific contacts.',
  },
  'android.permission.CALL_PHONE': {
    name: 'android.permission.CALL_PHONE',
    shortName: 'CALL_PHONE',
    risk: 'dangerous',
    category: 'Phone',
    description: 'Make phone calls without user interaction',
    dataAccess: 'Can initiate calls to any number silently',
    realWorldAbuse: 'Premium rate number fraud — apps silently call expensive numbers.',
  },
  'android.permission.READ_PHONE_STATE': {
    name: 'android.permission.READ_PHONE_STATE',
    shortName: 'READ_PHONE_STATE',
    risk: 'dangerous',
    category: 'Phone',
    description: 'Read phone state and identity',
    dataAccess: 'Phone number, IMEI, IMSI, SIM serial number, and network operator',
    realWorldAbuse: 'Device fingerprinting for tracking across apps even after reinstallation.',
  },
  'android.permission.PROCESS_OUTGOING_CALLS': {
    name: 'android.permission.PROCESS_OUTGOING_CALLS',
    shortName: 'PROCESS_OUTGOING_CALLS',
    risk: 'dangerous',
    category: 'Phone',
    description: 'Intercept and redirect outgoing calls',
    dataAccess: 'Can see and modify the phone number being dialed before connection',
    realWorldAbuse: 'Silently redirects calls to attacker-controlled numbers.',
  },
  'android.permission.SEND_SMS': {
    name: 'android.permission.SEND_SMS',
    shortName: 'SEND_SMS',
    risk: 'dangerous',
    category: 'SMS',
    description: 'Send SMS messages',
    dataAccess: 'Can send SMS/MMS to any number without user knowledge',
    realWorldAbuse: 'SMS fraud — apps send texts to premium numbers or spread malware via spam.',
  },
  'android.permission.READ_SMS': {
    name: 'android.permission.READ_SMS',
    shortName: 'READ_SMS',
    risk: 'dangerous',
    category: 'SMS',
    description: 'Read SMS messages',
    dataAccess: 'All SMS/MMS messages including banking OTPs, verification codes',
    realWorldAbuse: 'Intercepting 2FA codes to bypass account security.',
  },
  'android.permission.RECEIVE_SMS': {
    name: 'android.permission.RECEIVE_SMS',
    shortName: 'RECEIVE_SMS',
    risk: 'dangerous',
    category: 'SMS',
    description: 'Receive and process incoming SMS',
    dataAccess: 'All incoming SMS messages in real-time before the user sees them',
    realWorldAbuse: 'Silently intercepts and forwards incoming messages including OTPs.',
  },
  'android.permission.READ_CALENDAR': {
    name: 'android.permission.READ_CALENDAR',
    shortName: 'READ_CALENDAR',
    risk: 'dangerous',
    category: 'Calendar',
    description: 'Read calendar events',
    dataAccess: 'All calendar events including titles, attendees, locations, and notes',
    realWorldAbuse: 'Reveals meeting schedules, travel plans, and social connections.',
  },
  'android.permission.WRITE_CALENDAR': {
    name: 'android.permission.WRITE_CALENDAR',
    shortName: 'WRITE_CALENDAR',
    risk: 'dangerous',
    category: 'Calendar',
    description: 'Add or modify calendar events',
    dataAccess: 'Can create, modify, or delete calendar entries',
    realWorldAbuse: 'Injecting fake appointments or deleting important reminders.',
  },
  'android.permission.BODY_SENSORS': {
    name: 'android.permission.BODY_SENSORS',
    shortName: 'BODY_SENSORS',
    risk: 'dangerous',
    category: 'Sensors',
    description: 'Access body sensor data (heart rate, etc.)',
    dataAccess: 'Health data from wearables: heart rate, step count, sleep patterns',
    realWorldAbuse: 'Health data sold to insurers or used for discriminatory profiling.',
  },
  'android.permission.INTERNET': {
    name: 'android.permission.INTERNET',
    shortName: 'INTERNET',
    risk: 'normal',
    category: 'Network',
    description: 'Full internet access',
    dataAccess: 'Can send and receive data over the internet',
    realWorldAbuse: 'Required by nearly all apps; enables data exfiltration when combined with other permissions.',
  },
  'android.permission.ACCESS_NETWORK_STATE': {
    name: 'android.permission.ACCESS_NETWORK_STATE',
    shortName: 'ACCESS_NETWORK_STATE',
    risk: 'normal',
    category: 'Network',
    description: 'Check network connectivity status',
    dataAccess: 'Whether the device is connected to Wi-Fi or mobile data',
  },
  'android.permission.ACCESS_WIFI_STATE': {
    name: 'android.permission.ACCESS_WIFI_STATE',
    shortName: 'ACCESS_WIFI_STATE',
    risk: 'normal',
    category: 'Network',
    description: 'Access Wi-Fi network information',
    dataAccess: 'Wi-Fi SSID, BSSID, and connection state — can be used for indoor positioning',
  },
  'android.permission.CHANGE_WIFI_STATE': {
    name: 'android.permission.CHANGE_WIFI_STATE',
    shortName: 'CHANGE_WIFI_STATE',
    risk: 'normal',
    category: 'Network',
    description: 'Change Wi-Fi connectivity',
    dataAccess: 'Can connect/disconnect from Wi-Fi networks',
  },
  'android.permission.BLUETOOTH': {
    name: 'android.permission.BLUETOOTH',
    shortName: 'BLUETOOTH',
    risk: 'normal',
    category: 'Bluetooth',
    description: 'Connect to paired Bluetooth devices',
    dataAccess: 'Paired Bluetooth device names and addresses',
  },
  'android.permission.BLUETOOTH_ADMIN': {
    name: 'android.permission.BLUETOOTH_ADMIN',
    shortName: 'BLUETOOTH_ADMIN',
    risk: 'normal',
    category: 'Bluetooth',
    description: 'Initiate Bluetooth device discovery',
    dataAccess: 'Can scan for nearby Bluetooth devices',
    realWorldAbuse: 'Bluetooth scanning can be used for indoor location tracking.',
  },
  'android.permission.BLUETOOTH_SCAN': {
    name: 'android.permission.BLUETOOTH_SCAN',
    shortName: 'BLUETOOTH_SCAN',
    risk: 'dangerous',
    category: 'Bluetooth',
    description: 'Scan for nearby Bluetooth devices (Android 12+)',
    dataAccess: 'Nearby Bluetooth device names, addresses, and signal strengths',
    realWorldAbuse: 'Used to track nearby devices and infer social proximity.',
  },
  'android.permission.NFC': {
    name: 'android.permission.NFC',
    shortName: 'NFC',
    risk: 'normal',
    category: 'NFC',
    description: 'Perform NFC operations',
    dataAccess: 'Data from NFC tags and contactless payment terminals',
    realWorldAbuse: 'Can read contactless payment card data when near the device.',
  },
  'android.permission.VIBRATE': {
    name: 'android.permission.VIBRATE',
    shortName: 'VIBRATE',
    risk: 'normal',
    category: 'System',
    description: 'Control vibration motor',
    dataAccess: 'No sensitive data access',
  },
  'android.permission.WAKE_LOCK': {
    name: 'android.permission.WAKE_LOCK',
    shortName: 'WAKE_LOCK',
    risk: 'normal',
    category: 'System',
    description: 'Prevent phone from sleeping',
    dataAccess: 'Keeps CPU/screen awake; can drain battery',
    realWorldAbuse: 'Mining cryptocurrency in the background.',
  },
  'android.permission.RECEIVE_BOOT_COMPLETED': {
    name: 'android.permission.RECEIVE_BOOT_COMPLETED',
    shortName: 'RECEIVE_BOOT_COMPLETED',
    risk: 'normal',
    category: 'System',
    description: 'Run automatically on device startup',
    dataAccess: 'Allows app to start its service without user interaction after reboot',
    realWorldAbuse: 'Persistence mechanism for spyware and adware.',
  },
  'android.permission.FOREGROUND_SERVICE': {
    name: 'android.permission.FOREGROUND_SERVICE',
    shortName: 'FOREGROUND_SERVICE',
    risk: 'normal',
    category: 'System',
    description: 'Run a foreground service',
    dataAccess: 'Allows long-running background operations',
    realWorldAbuse: 'Used to keep tracking services alive in the background.',
  },
  'android.permission.REQUEST_INSTALL_PACKAGES': {
    name: 'android.permission.REQUEST_INSTALL_PACKAGES',
    shortName: 'REQUEST_INSTALL_PACKAGES',
    risk: 'signature',
    category: 'System',
    description: 'Install other APK packages',
    dataAccess: 'Can prompt users to install additional apps — potentially malicious ones',
    realWorldAbuse: 'Dropper malware installs secondary malicious payloads.',
  },
  'android.permission.SYSTEM_ALERT_WINDOW': {
    name: 'android.permission.SYSTEM_ALERT_WINDOW',
    shortName: 'SYSTEM_ALERT_WINDOW',
    risk: 'signature',
    category: 'System',
    description: 'Draw overlays on top of other apps',
    dataAccess: 'Can overlay any screen including banking and password entry screens',
    realWorldAbuse: 'Clickjacking attacks — fake UI overlaid on real banking apps to steal credentials.',
  },
  'android.permission.WRITE_SETTINGS': {
    name: 'android.permission.WRITE_SETTINGS',
    shortName: 'WRITE_SETTINGS',
    risk: 'signature',
    category: 'System',
    description: 'Modify system settings',
    dataAccess: 'Can change system settings like brightness, ringtone volume, and screen timeout',
  },
  'android.permission.USE_BIOMETRIC': {
    name: 'android.permission.USE_BIOMETRIC',
    shortName: 'USE_BIOMETRIC',
    risk: 'normal',
    category: 'Sensors',
    description: 'Use biometric hardware for authentication',
    dataAccess: 'Triggers biometric prompt; raw fingerprint data is never exposed',
  },
  'android.permission.USE_FINGERPRINT': {
    name: 'android.permission.USE_FINGERPRINT',
    shortName: 'USE_FINGERPRINT',
    risk: 'normal',
    category: 'Sensors',
    description: 'Use fingerprint hardware (deprecated in API 28)',
    dataAccess: 'Triggers fingerprint authentication prompt',
  },
  'android.permission.POST_NOTIFICATIONS': {
    name: 'android.permission.POST_NOTIFICATIONS',
    shortName: 'POST_NOTIFICATIONS',
    risk: 'dangerous',
    category: 'Notifications',
    description: 'Send push notifications (Android 13+)',
    dataAccess: 'Can send any notification content to the user',
    realWorldAbuse: 'Notification spam and phishing through misleading notification content.',
  },
  'android.permission.READ_MEDIA_IMAGES': {
    name: 'android.permission.READ_MEDIA_IMAGES',
    shortName: 'READ_MEDIA_IMAGES',
    risk: 'dangerous',
    category: 'Storage',
    description: 'Read photos and images (Android 13+)',
    dataAccess: 'All photos and images stored on the device including EXIF location metadata',
    realWorldAbuse: 'EXIF data in photos can reveal precise GPS locations even without location permission.',
  },
  'android.permission.READ_MEDIA_VIDEO': {
    name: 'android.permission.READ_MEDIA_VIDEO',
    shortName: 'READ_MEDIA_VIDEO',
    risk: 'dangerous',
    category: 'Storage',
    description: 'Read video files (Android 13+)',
    dataAccess: 'All video files stored on device',
  },
  'android.permission.READ_MEDIA_AUDIO': {
    name: 'android.permission.READ_MEDIA_AUDIO',
    shortName: 'READ_MEDIA_AUDIO',
    risk: 'dangerous',
    category: 'Storage',
    description: 'Read audio files (Android 13+)',
    dataAccess: 'All audio recordings, music, and voice memos',
  },
  'android.permission.MANAGE_EXTERNAL_STORAGE': {
    name: 'android.permission.MANAGE_EXTERNAL_STORAGE',
    shortName: 'MANAGE_EXTERNAL_STORAGE',
    risk: 'dangerous',
    category: 'Storage',
    description: 'Unrestricted access to all files (Android 11+)',
    dataAccess: 'Complete access to all files on the device including other apps\' private data',
    realWorldAbuse: 'Most powerful file access permission — functionally equivalent to root file access.',
  },
};

export const CATEGORY_COLORS: Record<PermissionCategory, string> = {
  Location: '#ef4444',
  Camera: '#f97316',
  Microphone: '#eab308',
  Contacts: '#84cc16',
  Storage: '#06b6d4',
  Phone: '#8b5cf6',
  SMS: '#ec4899',
  Calendar: '#14b8a6',
  Sensors: '#f59e0b',
  Network: '#3b82f6',
  Bluetooth: '#6366f1',
  NFC: '#10b981',
  Notifications: '#fb923c',
  System: '#94a3b8',
  Other: '#6b7280',
};

export const RISK_COLORS: Record<RiskLevel, string> = {
  dangerous: '#ef4444',
  normal: '#22c55e',
  signature: '#f97316',
  unknown: '#94a3b8',
};

export const RISK_LABELS: Record<RiskLevel, string> = {
  dangerous: 'Dangerous',
  normal: 'Normal',
  signature: 'Signature / Privileged',
  unknown: 'Unknown',
};

export function getPermissionInfo(permissionName: string): PermissionInfo {
  if (PERMISSION_DB[permissionName]) return PERMISSION_DB[permissionName];
  const short = permissionName.split('.').pop() || permissionName;
  let risk: RiskLevel = 'unknown';
  let category: PermissionCategory = 'Other';
  if (short.includes('LOCATION')) { risk = 'dangerous'; category = 'Location'; }
  else if (short.includes('CAMERA')) { risk = 'dangerous'; category = 'Camera'; }
  else if (short.includes('AUDIO') || short.includes('RECORD')) { risk = 'dangerous'; category = 'Microphone'; }
  else if (short.includes('CONTACT')) { risk = 'dangerous'; category = 'Contacts'; }
  else if (short.includes('STORAGE') || short.includes('MEDIA')) { risk = 'dangerous'; category = 'Storage'; }
  else if (short.includes('PHONE') || short.includes('CALL')) { risk = 'dangerous'; category = 'Phone'; }
  else if (short.includes('SMS') || short.includes('MMS')) { risk = 'dangerous'; category = 'SMS'; }
  else if (short.includes('CALENDAR')) { risk = 'dangerous'; category = 'Calendar'; }
  else if (short.includes('BLUETOOTH')) { risk = 'normal'; category = 'Bluetooth'; }
  else if (short.includes('INTERNET') || short.includes('NETWORK') || short.includes('WIFI')) { risk = 'normal'; category = 'Network'; }
  return {
    name: permissionName,
    shortName: short,
    risk,
    category,
    description: `Permission: ${short.replace(/_/g, ' ').toLowerCase()}`,
    dataAccess: 'No detailed information available for this permission.',
  };
}
