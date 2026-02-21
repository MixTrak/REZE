import { NextRequest, NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';
import { GoogleResult, YouTubeResult, ResearchContext, TranscriptResult } from '@/lib/types';

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const CSE_ID = process.env.CSE_ID;
const NUM_RESULTS = parseInt(process.env.NUM_RESULTS || '5', 10);

// Google Custom Search
async function googleSearch(query: string, apiKey: string, cseId: string, num: number = NUM_RESULTS): Promise<GoogleResult[]> {
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cseId}&q=${encodeURIComponent(query)}&num=${num}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            console.error('Google Search Error:', data);
            return [];
        }

        const items = data.items || [];
        return items.map((item: any) => ({
            title: item.title || '',
            link: item.link || '',
            snippet: item.snippet || '',
            display_link: item.displayLink || '',
        }));
    } catch (error) {
        console.error('Google Search Fetch Error:', error, url);
        return [];
    }
}

// YouTube Search
async function youtubeSearch(query: string, apiKey: string, num: number = NUM_RESULTS): Promise<YouTubeResult[]> {
    const url = `https://www.youtube.com/watch?v=q6fV8Y3fB30&source_ve_path=MjM4NTE&key=${apiKey}&part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=${num}`;
    // Correction: the above URL seems to have a hardcoded video ID prefix in a weird way in some implementations, but let's stick to standard v3 search
    const standardUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&part=snippet&type=video&q=${encodeURIComponent(query)}&maxResults=${num}`;

    try {
        const response = await fetch(standardUrl);
        const data = await response.json();

        if (!response.ok) {
            console.error('YouTube Search Error:', data);
            return [];
        }

        const items = data.items || [];
        return items.map((item: any) => {
            const videoId = item.id?.videoId || '';
            const snippet = item.snippet || {};
            return {
                video_id: videoId,
                title: snippet.title || '',
                description: snippet.description || '',
                channel_title: snippet.channelTitle || '',
                published_at: snippet.publishedAt || '',
                url: `https://www.youtube.com/watch?v=${videoId}`,
            };
        });
    } catch (error) {
        console.error('YouTube Search Fetch Error:', error);
        return [];
    }
}

// Get YouTube Transcript
async function getYouTubeTranscript(videoId: string): Promise<TranscriptResult> {
    try {
        const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);
        const fullText = transcriptData.map(chunk => chunk.text).join(' ');

        return {
            success: true,
            chunks: transcriptData,
            text: fullText,
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to fetch transcript',
        };
    }
}

// Run the research pipeline
async function runResearch(query: string, apiKey: string, cseId: string): Promise<ResearchContext> {
    console.log(`[research] Google search for: "${query}"`);
    const googleResults = await googleSearch(query, apiKey, cseId);

    console.log(`[research] YouTube search for: "${query}"`);
    const youtubeResults = await youtubeSearch(query, apiKey);

    console.log('[research] Fetching YouTube transcripts...');
    for (const vid of youtubeResults) {
        if (!vid.video_id) {
            vid.transcript = { success: false, error: 'Missing video_id' };
            continue;
        }
        console.log(`  - ${vid.video_id} | ${vid.title}`);
        vid.transcript = await getYouTubeTranscript(vid.video_id);
    }

    return {
        query,
        google_results: googleResults,
        youtube_results: youtubeResults,
    };
}

export async function POST(request: NextRequest) {
    try {
        const { query, googleApiKey, cseId } = await request.json();

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 });
        }

        const apiKey = googleApiKey || GOOGLE_API_KEY;
        const cxId = cseId || CSE_ID;

        if (!apiKey || !cxId) {
            return NextResponse.json(
                { error: 'Google API Key and CSE ID must be configured in settings or environment' },
                { status: 500 }
            );
        }

        const context = await runResearch(query, apiKey, cxId);
        return NextResponse.json(context);
    } catch (error) {
        console.error('Research error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Research failed' },
            { status: 500 }
        );
    }
}
