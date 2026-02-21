import { NextRequest } from 'next/server';
import { ResearchContext } from '@/lib/types';

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'stepfun/step-3.5-flash:free';
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function POST(request: NextRequest) {
    try {
        const { message, context, openRouterApiKey, openRouterModel } = await request.json() as {
            message: string;
            context: ResearchContext;
            openRouterApiKey?: string;
            openRouterModel?: string;
        };

        if (!message) {
            return new Response(JSON.stringify({ error: 'Message is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const apiKey = openRouterApiKey || OPENROUTER_API_KEY;
        const model = openRouterModel || OPENROUTER_MODEL;

        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'OpenRouter API Key must be configured in settings or environment' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Serialize context and truncate if huge
        let contextStr = JSON.stringify(context);
        const maxChars = 20000;
        if (contextStr.length > maxChars) {
            contextStr = contextStr.substring(0, maxChars) + '... [truncated]';
        }

        const systemPrompt = `Analyze the given information and answer the user.
                            Don't Start with "Based on the provided research context, here is a synthesized answer to your question about" Or anything similar to that.
                            `;

        const payload = {
            model: model,
            stream: true,
            messages: [
                {
                    role: 'system',
                    content: systemPrompt,
                },
                {
                    role: 'system',
                    content: 'Here is the research context (Google + YouTube + transcripts): ' + contextStr,
                },
                {
                    role: 'user',
                    content: message,
                },
            ],
        };

        const response = await fetch(OPENROUTER_BASE_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[openrouter] HTTP ${response.status}: ${errorText}`);
            return new Response(JSON.stringify({ error: errorText }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Stream the response
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        const stream = new ReadableStream({
            async start(controller) {
                const reader = response.body?.getReader();
                if (!reader) {
                    controller.close();
                    return;
                }

                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        const chunk = decoder.decode(value, { stream: true });
                        const lines = chunk.split('\n');

                        for (const line of lines) {
                            const trimmed = line.trim();
                            if (!trimmed.startsWith('data:')) continue;

                            const dataStr = trimmed.slice(5).trim();
                            if (dataStr === '[DONE]') {
                                controller.close();
                                return;
                            }

                            try {
                                const parsed = JSON.parse(dataStr);
                                const choices = parsed.choices || [];
                                if (choices.length === 0) continue;

                                const delta = choices[0].delta || {};
                                const content = delta.content;
                                if (content) {
                                    controller.enqueue(encoder.encode(content));
                                }
                            } catch {
                                // Skip invalid JSON
                                continue;
                            }
                        }
                    }
                } catch (error) {
                    console.error('Stream error:', error);
                } finally {
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked',
            },
        });
    } catch (error) {
        console.error('Chat error:', error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : 'Chat failed' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
