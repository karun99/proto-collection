# AI Studio — AI Video Generator

> AI Studio is an AI-powered video generation application built with Next.js, React, and TypeScript. It takes a rough idea from the user, refines it into a detailed prompt using an LLM, and generates a video clip via AI video generation APIs.

## Developer

**Sai Karun Nandipati**
Portfolio: [http://karun99.github.io](http://karun99.github.io)

## Company

**Guiding Key**
Website: [http://guidingkey.com](http://guidingkey.com)

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

Copyright (c) 2026 Sai Karun Nandipati, Guiding Key Team

---

## Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x (or yarn / pnpm)
- An **OpenRouter API key** (for prompt refinement via LLM)
- An **NVIDIA API key** (for AI video generation)

## Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-username/ai-studio.git
cd ai-studio
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Set up environment variables**

Create a `.env.local` file in the project root:

```bash
cp .env.local.example .env.local
```

Then fill in your API keys:

```env
OPENROUTER_API_KEY=your_openrouter_api_key
NVIDIA_API_KEY=your_nvidia_api_key
```

> **Note:** Never commit your API keys. `.env.local` is already included in `.gitignore`.

4. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Enter a rough idea for a video clip in the text input (e.g., "A cat jumping over a rainbow at sunset")
2. Click **Generate**
3. The app will refine your idea into a detailed AI prompt, then generate a video
4. The resulting video will be displayed on the page

## Project Structure

```
ai-studio/
├── src/
│   └── app/
│       ├── actions.ts      # Server actions (prompt refinement + video generation)
│       ├── globals.css     # Global styles (Tailwind CSS)
│       ├── layout.tsx      # Root layout
│       └── page.tsx        # Main UI (client component)
├── public/                  # Static assets
├── .env.local              # Environment variables (API keys)
├── eslint.config.mjs       # ESLint flat config
├── next.config.ts          # Next.js configuration
├── package.json            # Dependencies and scripts
├── postcss.config.mjs      # PostCSS config (Tailwind)
├── tsconfig.json           # TypeScript configuration
└── LICENSE                 # MIT License
```

## Available Scripts

| Command         | Description                          |
|-----------------|--------------------------------------|
| `npm run dev`   | Start the development server         |
| `npm run build` | Create a production build            |
| `npm run start` | Start the production server          |
| `npm run lint`  | Run ESLint                           |

## Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (strict mode)
- **UI:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **LLM API:** [OpenRouter](https://openrouter.ai/) (Meta Llama 3.1 8B Instruct)
- **Video API:** [NVIDIA AI](https://build.nvidia.com/)

## Deployment

### Netlify (Recommended)

This project is pre-configured for Netlify deployment. Push to your repository and connect it to Netlify.

### Vercel

```bash
npx vercel
```

### Manual

```bash
npm run build
npm run start
```

## Contributing

Contributions are welcome. Please open an issue or submit a pull request.

## Acknowledgments

- Built by [Sai Karun Nandipati](http://karun99.github.io) at [Guiding Key](http://guidingkey.com)
