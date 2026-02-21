export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface GoogleResult {
    title: string;
    link: string;
    snippet: string;
    display_link: string;
}

export interface YouTubeResult {
    video_id: string;
    title: string;
    description: string;
    channel_title: string;
    published_at: string;
    url: string;
    transcript?: TranscriptResult;
}

export interface TranscriptResult {
    success: boolean;
    chunks?: { text: string; offset: number; duration: number }[];
    text?: string;
    error?: string;
}

export interface ResearchContext {
    query: string;
    google_results: GoogleResult[];
    youtube_results: YouTubeResult[];
}

export interface User {
    _id?: string;
    username: string;
    password?: string;
    googleApiKey?: string;
    cseId?: string;
    openRouterApiKey?: string;
    openRouterModel?: string;
}
