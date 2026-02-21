'use client';

import { useState, useEffect } from 'react';
import { LuX, LuSave, LuShieldCheck } from 'react-icons/lu';
import { User } from '@/lib/types';
import { Dispatch, SetStateAction } from 'react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    setUser: Dispatch<SetStateAction<User | null>>;
}

export default function SettingsModal({ isOpen, onClose, user, setUser }: SettingsModalProps) {
    const [config, setConfig] = useState({
        GOOGLE_API_KEY: user.googleApiKey || '',
        CSE_ID: user.cseId || '',
        OPENROUTER_API_KEY: user.openRouterApiKey || '',
        OPENROUTER_MODEL: user.openRouterModel || 'stepfun/step-3.5-flash:free',
    });

    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (isOpen) {
            setConfig({
                GOOGLE_API_KEY: user.googleApiKey || '',
                CSE_ID: user.cseId || '',
                OPENROUTER_API_KEY: user.openRouterApiKey || '',
                OPENROUTER_MODEL: user.openRouterModel || 'stepfun/step-3.5-flash:free',
            });
            setMessage('');
        }
    }, [isOpen, user]);

    const handleSave = async () => {
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

            // Update local user state
            setUser({
                ...user,
                googleApiKey: config.GOOGLE_API_KEY,
                cseId: config.CSE_ID,
                openRouterApiKey: config.OPENROUTER_API_KEY,
                openRouterModel: config.OPENROUTER_MODEL,
            });

            setMessage('Settings saved to database!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Error saving settings.');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-[#1d1c1b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                        <LuShieldCheck className="text-blue-400" />
                        Settings
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-white/10 text-gray-400 transition-colors"
                    >
                        <LuX className="text-xl" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-400">Google API Key</label>
                            <input
                                type="password"
                                value={config.GOOGLE_API_KEY}
                                onChange={(e) => setConfig({ ...config, GOOGLE_API_KEY: e.target.value })}
                                placeholder="Enter Google API Key"
                                className="w-full bg-[#11100f] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500/50 transition-colors"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-400">CSE ID (Search Engine ID)</label>
                            <input
                                type="text"
                                value={config.CSE_ID}
                                onChange={(e) => setConfig({ ...config, CSE_ID: e.target.value })}
                                placeholder="Enter Custom Search Engine ID"
                                className="w-full bg-[#11100f] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500/50 transition-colors"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-400">OpenRouter API Key</label>
                            <input
                                type="password"
                                value={config.OPENROUTER_API_KEY}
                                onChange={(e) => setConfig({ ...config, OPENROUTER_API_KEY: e.target.value })}
                                placeholder="Enter OpenRouter API Key"
                                className="w-full bg-[#11100f] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500/50 transition-colors"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-400">OpenRouter Model</label>
                            <input
                                type="text"
                                value={config.OPENROUTER_MODEL}
                                onChange={(e) => setConfig({ ...config, OPENROUTER_MODEL: e.target.value })}
                                placeholder="e.g. anthropic/claude-3-opus"
                                className="w-full bg-[#11100f] border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:border-blue-500/50 transition-colors"
                            />
                        </div>
                    </div>

                    {message && (
                        <p className="text-sm text-green-400 text-center animate-in fade-in slide-in-from-top-1">
                            {message}
                        </p>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1 px-4 py-2.5 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSaving ? (
                                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                            ) : (
                                <>
                                    <LuSave className="text-lg" />
                                    Save
                                </>
                            )}
                        </button>
                    </div>
                </div>

                <div className="bg-[#11100f] p-4 border-t border-white/10">
                    <p className="text-xs text-gray-500 leading-relaxed">
                        Your keys are stored locally in your browser and never leave your device except to make requests to the respective APIs.
                    </p>
                </div>
            </div>
        </div>
    );
}
