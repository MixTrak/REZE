'use client';

import React from 'react';

// Markdown parser components
const parseInlineMarkdown = (text: string, startKey: number): { nodes: React.ReactNode[], nextKey: number } => {
    const parts: React.ReactNode[] = [];
    let keyIndex = startKey;
    const segments = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

    for (const segment of segments) {
        if (!segment) continue;
        if (segment.startsWith('**') && segment.endsWith('**')) {
            const content = segment.slice(2, -2);
            parts.push(<strong key={keyIndex++} className="font-semibold text-white">{content}</strong>);
        } else if (segment.startsWith('`') && segment.endsWith('`')) {
            const content = segment.slice(1, -1);
            parts.push(
                <code key={keyIndex++} className="bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono text-white">
                    {content}
                </code>
            );
        } else {
            parts.push(segment);
        }
    }
    return { nodes: parts, nextKey: keyIndex };
};

const parseMarkdown = (text: string): React.ReactNode => {
    if (!text) return null;
    const elements: React.ReactNode[] = [];
    let keyIndex = 0;
    const lines = text.split('\n');
    let currentParagraph: React.ReactNode[] = [];
    let inList = false;
    let listItems: React.ReactNode[] = [];

    const flushParagraph = () => {
        if (currentParagraph.length > 0) {
            elements.push(<p key={keyIndex++} className="mb-3 leading-relaxed">{currentParagraph}</p>);
            currentParagraph = [];
        }
    };

    const flushList = () => {
        if (listItems.length > 0) {
            elements.push(<ul key={keyIndex++} className="mb-4 pl-6 list-disc">{listItems}</ul>);
            listItems = [];
            inList = false;
        }
    };

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) { flushList(); flushParagraph(); continue; }

        if (trimmed.startsWith('### ')) {
            flushList(); flushParagraph();
            const { nodes, nextKey } = parseInlineMarkdown(trimmed.slice(4), keyIndex);
            keyIndex = nextKey;
            elements.push(<h3 key={keyIndex++} className="text-lg font-semibold text-white mt-5 mb-2 border-b border-white/10 pb-1">{nodes}</h3>);
            continue;
        }

        if (trimmed.startsWith('## ')) {
            flushList(); flushParagraph();
            const { nodes, nextKey } = parseInlineMarkdown(trimmed.slice(3), keyIndex);
            keyIndex = nextKey;
            elements.push(<h2 key={keyIndex++} className="text-xl font-semibold text-white mt-6 mb-3 border-b border-white/10 pb-2">{nodes}</h2>);
            continue;
        }

        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            flushParagraph();
            inList = true;
            const { nodes, nextKey } = parseInlineMarkdown(trimmed.slice(2), keyIndex);
            keyIndex = nextKey;
            listItems.push(<li key={keyIndex++} className="mb-1.5 leading-relaxed">{nodes}</li>);
            continue;
        }

        flushList();
        const { nodes, nextKey = keyIndex } = parseInlineMarkdown(trimmed, keyIndex);
        keyIndex = nextKey;
        if (currentParagraph.length > 0) currentParagraph.push(' ');
        currentParagraph.push(...(Array.isArray(nodes) ? nodes : [nodes]));
    }

    flushList();
    flushParagraph();
    return elements;
};

interface MarkdownRendererProps {
    content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
    return (
        <div className="text-[1.05rem] text-gray-300 leading-relaxed font-sans">
            {parseMarkdown(content)}
        </div>
    );
}
