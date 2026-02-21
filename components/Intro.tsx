"use client";

import { useState } from "react";
import { IoPerson } from "react-icons/io5";

const slides = [
    {
        title: "REZE, The AI Browser",
        highlight: "AI Browser",
        description: "Built In Ai For Quick Answers And Responses",
    },
    {
        title: "Own It",
        highlight: "Own It",
        description: "Use Your Own Api Keys With Quick Tutorials To Get You Started",
    },
    {
        title: "Future",
        highlight: "Future",
        description: "Open Source And Constantly Improving and Adapting ",
    },
];


export default function Intro({ onEnter }: { onEnter: () => void }) {
    const [index, setIndex] = useState(0);

    const next = () => {
        if (index < slides.length - 1) setIndex(index + 1);
    };

    const prev = () => {
        if (index > 0) setIndex(index - 1);
    };

    const slide = slides[index];

    return (
        <div className="min-h-screen min-w-screen flex items-center justify-center bg-black text-white">
            <div className="w-full max-w-xl px-6 py-10 border border-zinc-800 rounded-3xl bg-zinc-900/60 backdrop-blur">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 text-3xl">
                        <IoPerson />
                    </div>
                </div>

                <h1 className="text-3xl font-semibold mb-3">
                    REZE{" "}
                    <span className="text-blue-400">
                        {slide.highlight}
                    </span>
                </h1>

                <p className="text-zinc-400 mb-8">
                    {slide.description}
                </p>

                <div className="flex items-center justify-between">
                    <button
                        onClick={prev}
                        disabled={index === 0}
                        className="px-4 py-2 rounded-xl border border-zinc-700 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-800 transition"
                    >
                        &lt;
                    </button>

                    <div className="flex gap-2">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setIndex(i)}
                                className={`h-2 w-2 rounded-full transition ${i === index ? "bg-blue-400 w-4" : "bg-zinc-600"
                                    }`}
                            />
                        ))}
                    </div>

                    {index === slides.length - 1 ? (
                        <button
                            onClick={onEnter}
                            className="px-6 py-2 rounded-xl bg-blue-500 text-sm font-semibold hover:bg-blue-400 transition shadow-lg shadow-blue-500/20"
                        >
                            Enter
                        </button>
                    ) : (
                        <button
                            onClick={next}
                            className="px-4 py-2 rounded-xl bg-blue-500 text-sm font-medium hover:bg-blue-400 transition"
                        >
                            &gt;
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
