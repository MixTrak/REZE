'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LuSave, LuShieldCheck, LuChevronLeft, LuLogOut } from 'react-icons/lu';
import { User } from '@/lib/types';

export default function AccountPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [config, setConfig] = useState({
        GOOGLE_API_KEY: '',
        CSE_ID: '',
        OPENROUTER_API_KEY: '',
        OPENROUTER_MODEL: 'stepfun/step-3.5-flash:free',
    });

    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('reze_user');
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);
            setConfig({
                GOOGLE_API_KEY: parsedUser.googleApiKey || '',
                CSE_ID: parsedUser.cseId || '',
                OPENROUTER_API_KEY: parsedUser.openRouterApiKey || '',
                OPENROUTER_MODEL: parsedUser.openRouterModel || 'stepfun/step-3.5-flash:free',
            });
            setIsLoading(false);
        } else {
            router.push('/');
        }
    }, [router]);

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        setMessage('');

        try {
            const response = await fetch('/api/user/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user._id,
                    googleApiKey: config.GOOGLE_API_KEY,
                    cseId: config.CSE_ID,
                    openRouterApiKey: config.OPENROUTER_API_KEY,
                    openRouterModel: config.OPENROUTER_MODEL,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save settings');
            }

            const updatedUser = {
                ...user,
                googleApiKey: config.GOOGLE_API_KEY,
                cseId: config.CSE_ID,
                openRouterApiKey: config.OPENROUTER_API_KEY,
                openRouterModel: config.OPENROUTER_MODEL,
            };

            setUser(updatedUser);
            localStorage.setItem('reze_user', JSON.stringify(updatedUser));

            setMessage('Settings saved successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Error saving settings.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('reze_user');
        router.push('/');
    };

    if (isLoading) {
        return (
            <div className="h-screen bg-black flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-white/10 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#171615] text-white p-4 sm:p-8">
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group cursor-pointer"
                    >
                        <LuChevronLeft className="text-xl group-hover:-translate-x-1 transition-transform" />
                        Back to Browser
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                    >
                        <LuLogOut />
                        Logout
                    </button>
                </div>

                <div className="flex items-center gap-4 border-b border-white/10 pb-6">
                    <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                        <LuShieldCheck className="text-3xl text-blue-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
                        <p className="text-gray-500">Manage your API configurations and preferences</p>
                    </div>
                </div>

                <div className="grid gap-6">
                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-400">Google API Key</label>
                        <input
                            type="password"
                            value={config.GOOGLE_API_KEY}
                            onChange={(e) => setConfig({ ...config, GOOGLE_API_KEY: e.target.value })}
                            placeholder="Enter Google API Key"
                            className="w-full bg-[#201f1e] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50 transition-colors"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-400">CSE ID (Search Engine ID)</label>
                        <input
                            type="text"
                            value={config.CSE_ID}
                            onChange={(e) => setConfig({ ...config, CSE_ID: e.target.value })}
                            placeholder="Enter Custom Search Engine ID"
                            className="w-full bg-[#201f1e] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50 transition-colors"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-400">OpenRouter API Key</label>
                        <input
                            type="password"
                            value={config.OPENROUTER_API_KEY}
                            onChange={(e) => setConfig({ ...config, OPENROUTER_API_KEY: e.target.value })}
                            placeholder="Enter OpenRouter API Key"
                            className="w-full bg-[#201f1e] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50 transition-colors"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-400">OpenRouter Model</label>
                        <input
                            type="text"
                            value={config.OPENROUTER_MODEL}
                            onChange={(e) => setConfig({ ...config, OPENROUTER_MODEL: e.target.value })}
                            placeholder="e.g. stepfun/step-3.5-flash:free"
                            className="w-full bg-[#201f1e] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50 transition-colors"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    {message && (
                        <div className={`p-4 rounded-xl text-center text-sm animate-in fade-in slide-in-from-top-2 ${message.includes('Error') ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-400'
                            }`}>
                            {message}
                        </div>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full py-4 rounded-xl bg-white text-black font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                        {isSaving ? (
                            <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        ) : (
                            <>
                                <LuSave />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>

                <div className="bg-[#201f1e] p-6 rounded-2xl border border-white/10">
                    <p className="text-sm text-gray-400 leading-relaxed">
                        <span className="text-white font-medium">Security Note:</span> Your API keys are used to power the research and chat features.
                        They are stored in your user profile in the database and cached locally in your session.
                        Always use restricted API keys where possible.
                    </p>
                </div>
            </div>
        </div>
    );
}
