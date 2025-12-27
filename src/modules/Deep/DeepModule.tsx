import React, { useState } from 'react';
import { getAIClient } from '../../services/ai';
import { FloaterFrame } from '../../components/FloaterFrame';
import { ChatMessage } from '../../../types';

export const DeepModule = () => {
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const ai = getAIClient();

    const runDeepIntel = async (message: string) => {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: message,
            config: {
                thinkingConfig: { thinkingBudget: 32768 }
            }
        });
        return response.text;
    };

    const handleChat = async (msg: string) => {
        const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', text: msg }];
        setChatHistory(newHistory);
        setIsLoading(true);
        try {
            const reply = await runDeepIntel(msg);
            setChatHistory([...newHistory, { role: 'model', text: reply || '' }]);
        } catch (e) {
            console.error(e);
            setChatHistory([...newHistory, { role: 'model', text: 'Error: Connection interrupted.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <FloaterFrame
            id="deep-module"
            title="Deep Intel"
            icon={<span style={{ fontSize: '2rem' }}>🧠</span>}
            defaultColor="#f59e0b" // Amber
            initialIndex={1}
        >
            <div className="flex flex-col h-full bg-slate-50">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatHistory.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-3 rounded-lg text-sm ${m.role === 'user' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-800'}`}>
                                {m.role === 'model' && <div className="text-xs text-slate-500 mb-1 font-mono">Deep-Intel Reasoning...</div>}
                                {m.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && <div className="text-center text-xs text-slate-400 animate-pulse">Analyzing vector space...</div>}
                </div>
                <div className="p-4 border-t border-slate-200">
                    <input
                        className="w-full bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                        placeholder="Query Deep-Intel..."
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                handleChat(e.currentTarget.value);
                                e.currentTarget.value = '';
                            }
                        }}
                    />
                </div>
            </div>
        </FloaterFrame>
    );
};
