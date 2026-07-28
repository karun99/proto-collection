# AppIdea - Privacy-First Product Workspace

AppIdea is a secure, browser-based tool for turning product concepts into professional documentation and managing product workflows. It uses AES-256 encryption to keep all your data in your local browser storage.

## Key Features

- **🚀 Ideation Workspace**: Manually draft your product ideas and instantly generate professional documentation (Charter, PRD, TDD, Roadmap, Pitch Deck) entirely on the client side.
- **📄 Export to PDF & PPTX**: Generate professional, multi-page PDF and PowerPoint presentations directly from your browser.
- **🔐 Privacy First**: All data is encrypted with AES-256 and stored locally in your browser. Your data never leaves your device.
- **📂 Data Portability**: Import and export your data in both JSON and CSV formats for easy backups and sharing.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19
- **Styling**: Tailwind CSS 4
- **Security**: CryptoJS for local AES-256 encryption
- **Exports**: pptxgenjs (PowerPoint), jspdf (PDF)
- **Deployment**: Optimized for Netlify static hosting

## Getting Started

1. Install dependencies: `npm install`
2. Run development server: `npm run dev`
3. Build for production: `npm run build`

## Deployment

This app is designed to be deployed as a static site. The `next.config.ts` is configured with `output: 'export'`. For Netlify, the build command is `npm run build` and the publish directory is `out`.
