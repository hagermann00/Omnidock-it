import React, { useState } from 'react';
import { getAIClient } from '../../services/ai';
import { FloaterFrame } from '../../components/FloaterFrame';
import { CaptureResult } from '../../../types';

export const IntelModule = () => {
    const [captures, setCaptures] = useState<CaptureResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const ai = getAIClient();

    const runSearchIntel = async (query: string) => {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: query,
            config: {
                tools: [{ googleSearch: {} }]
            }
        });
        return {
            text: response.text,
            sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks
        };
    };

    const handleResearch = async (query: string) => {
        setIsLoading(true);
        try {
            const result = await runSearchIntel(query);
            const newCap: CaptureResult = {
                id: Date.now().toString(),
                type: 'intel',
                content: query,
                analysis: result.text,
                timestamp: Date.now(),
                sources: result.sources as any
            };
            setCaptures([newCap, ...captures]);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <FloaterFrame
            id="intel-module"
            title="Global Intel"
            icon={<span style={{ fontSize: '2rem' }}>🌍</span>}
            defaultColor="#10b981" // Emerald
            initialIndex={2}
        >
            <div className="flex flex-col h-full bg-slate-50">
                <div className="p-4 border-b border-slate-200 bg-white">
                    <input
                        className="w-full bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                        placeholder="Global Search Query..."
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                handleResearch(e.currentTarget.value);
                                e.currentTarget.value = '';
                            }
                        }}
                    />
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {isLoading && <div className="text-center text-xs text-slate-400 animate-pulse">Scanning global networks...</div>}
                    {captures.map(c => (
                        <div key={c.id} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                            <div className="font-bold text-xs text-emerald-600 uppercase mb-2">{c.content}</div>
                            <div className="text-sm text-slate-700 leading-relaxed mb-2">{c.analysis}</div>
                            <div className="space-y-1">
                                {c.sources?.map((s, i) => s.web && (
                                    <a key={i} href={s.web.uri} target="_blank" className="block text-xs text-blue-500 hover:underline truncate">
                                        [{i+1}] {s.web.title}
                                    </a>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </FloaterFrame>
    );
};
