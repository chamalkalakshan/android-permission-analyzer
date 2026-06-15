# Android Permission Analyzer

A browser-based tool to visually analyze Android APK permissions, detect suspicious patterns, and generate professional security reports - all without uploading your APK to any server.

## Features

- **Drag & Drop APK** - drop any `.apk` file or paste an `AndroidManifest.xml` directly
- **Permission Database** - 40+ permissions explained with risk level, category, data access details, and real-world abuse cases
- **Visual Charts** - risk distribution donut, category bar chart, and danger radar chart
- **Risk Meter** - segmented risk score based on permission combination analysis
- **Suspicious Pattern Detection** - 13 patterns covering surveillance, OTP interception, malware droppers, credential harvesting, and more
- **Permission Timeline** - category-grouped timeline view of all permissions
- **Component Explorer** - activities, services, broadcast receivers, and content providers
- **PDF Report** - export a full security report with all findings
- **100% client-side** - your APK never leaves your browser

## Tech Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS
- Recharts (charts)
- JSZip (APK parsing)
- fast-xml-parser (manifest parsing)
- jsPDF (report generation)
- react-dropzone

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build

```bash
npm run build
```

## Deployment

Deploy the `dist/` folder to any static host:
- [Vercel](https://vercel.com) - connect your GitHub repo for automatic deploys
- [Netlify](https://netlify.com)
- [Cloudflare Pages](https://pages.cloudflare.com)

## How It Works

Android APKs are ZIP files containing a binary-encoded `AndroidManifest.xml`. This tool:
1. Unzips the APK using JSZip in the browser
2. Parses the binary AXML format to extract permissions and component names
3. Looks up each permission in the built-in database
4. Runs pattern matching against known suspicious permission combinations
5. Renders everything as interactive charts and cards

## Privacy

All analysis runs entirely in your browser. No files, permission data, or APK content are ever sent to a server.
