'use client';

import { useState, useRef, useEffect } from "react";
import { LuPlus, LuActivity, LuUser, LuSparkles } from "react-icons/lu";
import { ChatMessage, ResearchContext, User } from "@/lib/types";
import ToggleSwitch from "./ToggleSwitch";
import MarkdownRenderer from "./MarkdownRenderer";



export default function Browser({ user }: { user: User }) {
    const [isEnabled, setIsEnabled] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const hasMessages = messages.length > 0;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            let context: ResearchContext = { query: userMessage, google_results: [], youtube_results: [] };

            if (isEnabled) {
                setStatus('Searching...');
                const researchResponse = await fetch('/api/research', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        query: userMessage,
                        googleApiKey: user.googleApiKey,
                        cseId: user.cseId
                    }),
                });

                if (!researchResponse.ok) throw new Error('Research failed');
                context = await researchResponse.json();
            }

            setStatus('Generating answer...');
            const chatResponse = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    context,
                    openRouterApiKey: user.openRouterApiKey,
                    openRouterModel: user.openRouterModel
                }),
            });

            if (!chatResponse.ok) throw new Error('Chat failed');

            const reader = chatResponse.body?.getReader();
            const decoder = new TextDecoder();
            let assistantMessage = '';

            setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
            setStatus('');

            while (reader) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                assistantMessage += chunk;

                setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1] = { role: 'assistant', content: assistantMessage };
                    return updated;
                });
            }
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
        } finally {
            setIsLoading(false);
            setStatus('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className="h-full bg-[#171615] flex flex-col text-gray-300">
            {!hasMessages ? (
                <div className="flex-1 flex flex-col items-center justify-center px-4">
                    <h1 className="text-white text-6xl font-medium tracking-tight mb-12 font-sans">
                        REZE
                    </h1>
                    <div className="w-full max-w-3xl bg-[#201f1e] rounded-2xl border border-white/10 p-4 transition-all focus-within:border-white/20 shadow-2xl">
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask anything. Type @ for sources and / for shortcuts."
                            className="w-full bg-transparent text-white text-lg outline-none resize-none placeholder:text-gray-500 min-h-[60px]"
                        />
                        <div className="flex items-center justify-between mt-4">
                            <button className="p-2 rounded-full hover:bg-white/5 text-gray-400 transition-colors border border-white/10 cursor-pointer">
                                <LuPlus className="text-lg" />
                            </button>
                            <ToggleSwitch
                                label="Reasoning"
                                checked={isEnabled}
                                onChange={setIsEnabled}
                            />

                            <button
                                onClick={() => handleSubmit()}
                                disabled={!input.trim() || isLoading}
                                className={`p-2.5 rounded-full transition-all shadow-lg hover:scale-105 cursor-pointer ${input.trim() ? 'bg-white text-black hover:bg-white/90' : 'bg-white/10 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                <LuActivity className="text-lg rotate-90" />
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-y-auto px-4 py-8">
                        <div className="max-w-3xl mx-auto space-y-12">
                            {messages.map((msg, i) => (
                                <div key={i} className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                            {msg.role === 'user' ? <LuUser className="text-sm" /> : <LuSparkles className="text-sm text-white" />}
                                        </div>
                                        <span className="text-sm font-medium text-white uppercase tracking-wider">
                                            {msg.role === 'user' ? 'You' : 'Reze'}
                                        </span>
                                    </div>
                                    <div className="pl-11">
                                        {msg.role === 'user' ? (
                                            <div className="text-[1.05rem] text-gray-300 leading-relaxed font-sans">{msg.content}</div>
                                        ) : (
                                            <MarkdownRenderer content={msg.content} />
                                        )}
                                    </div>
                                </div>
                            ))}
                            {status && (
                                <div className="flex items-center gap-3 pl-11">
                                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                    <span className="text-sm text-gray-500 animate-pulse">{status}</span>
                                </div>
                            )}
                            <div ref={messagesEndRef} className="h-24" />
                        </div>
                    </div>

                    <div className="p-4 bg-gradient-to-t from-[#171615] via-[#171615] to-transparent">
                        <div className="max-w-3xl mx-auto w-full bg-[#201f1e] rounded-2xl border border-white/10 p-4 transition-all focus-within:border-white/20 shadow-2xl">
                            <textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask a follow-up question..."
                                className="w-full bg-transparent text-white text-lg outline-none resize-none placeholder:text-gray-500 min-h-[44px]"
                            />
                            <div className="flex items-center justify-between mt-2">
                                <button className="p-2 rounded-full hover:bg-white/5 text-gray-400 transition-colors border border-white/10 cursor-pointer text-sm">
                                    <LuPlus className="text-base" />
                                </button>
                                <button
                                    onClick={() => handleSubmit()}
                                    disabled={!input.trim() || isLoading}
                                    className={`p-2 rounded-full transition-all shadow-lg hover:scale-105 cursor-pointer ${input.trim() ? 'bg-white text-black hover:bg-white/90' : 'bg-white/10 text-gray-500'
                                        }`}
                                >
                                    <LuActivity className="text-base rotate-90" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}