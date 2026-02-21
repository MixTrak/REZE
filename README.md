# Reze - AI Enhanced Browser Assistant

Reze is a web application built with [Next.js](https://nextjs.org) that serves as an intelligent, AI-driven browsing assistant. It combines the power of large language models (via OpenRouter) with real-time web search capabilities (via Google Custom Search) and YouTube video transcript analysis to provide comprehensive and context-aware responses.

## Features

- **User Authentication**: Secure signup and login system backed by MongoDB.
- **AI Chat Interface**: Interactive chat powered by models from OpenRouter.
- **Real-time Web Search**: Integrated Google Custom Search API to fetch up-to-date information.
- **YouTube Transcript Analysis**: Ability to extract and analyze YouTube video transcripts using `youtube-transcript`.
- **Customizable Settings**: Users can configure their own Google API keys, Search Engine IDs, and OpenRouter API keys directly from the settings menu.
- **Markdown Rendering**: Beautifully formatted AI responses using custom markdown components (`MarkdownRenderer`).
- **Responsive Design**: Built with Tailwind CSS for a seamless experience across devices.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Frontend**: React 19, Tailwind CSS v4
- **Backend & Database**: Next.js API Routes, MongoDB
- **APIs & Integrations**: 
  - OpenRouter (LLM routing for chat and analysis)
  - Google Custom Search API (CSE)
  - YouTube Transcript API
- **Icons**: `react-icons`

## Getting Started

### Prerequisites

- Node.js (v20 or higher recommended)
- A MongoDB cluster
- OpenRouter API Key
- Google Cloud API Key and Custom Search Engine (CSE) ID

### Installation

1. Clone the repository and install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Create a `.env.local` file in the root directory and add the following environment variables:

```env
MONGODB_URI=your_mongodb_connection_string
```
*(Note: API keys for OpenRouter and Google Search are configured per-user within the app's Settings menu.)*

3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1. **Sign Up / Login**: Create a new account or log in to your existing one.
2. **Setup API Keys**: Navigate to the Settings modal to input your OpenRouter API Key, Google Search API Key, and CSE ID.
3. **Start Searching**: Enter queries in the chat interface. Reze will analyze the query, search the web or YouTube if necessary, and synthesize a comprehensive response using the selected AI model.

## Folder Structure

- `/app`: Next.js App Router containing pages and API routes (`/api/auth`, `/api/chat`, `/api/research`, `/api/user/settings`).
- `/components`: Reusable React components (`Browser`, `Sidebar`, `SettingsModal`, `MarkdownRenderer`, etc.).
- `/lib`: Utility functions, database connection logic (`db.ts`), and TypeScript types (`types.ts`).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
