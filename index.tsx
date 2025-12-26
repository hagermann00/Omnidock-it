
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { WidgetType, Task, CaptureResult, ChatMessage } from './types';

// Audio Encoding/Decoding Utilities
function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
}

function encode(bytes: Uint8Array) {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
    return buffer;
}

function App() {
    const [activeWidget, setActiveWidget] = useState<WidgetType | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [captures, setCaptures] = useState<CaptureResult[]>([]);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLiveActive, setIsLiveActive] = useState(false);
    const [vaultName] = useState<string>(localStorage.getItem('obsidian_vault') || '');

    // Refs for Live API
    const liveSessionRef = useRef<any>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef(0);
    const sourcesRef = useRef(new Set<AudioBufferSourceNode>());

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // --- AI MODULES ---

    // GHOST-LITE: Fast tasks
    const runGhostLite = async (prompt: string, audioBase64?: string) => {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite-latest',
            contents: audioBase64 
                ? { parts: [{ inlineData: { data: audioBase64, mimeType: 'audio/webm' } }, { text: prompt }] }
                : prompt
        });
        return response.text;
    };

    // DEEP-INTEL: Reasoning
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

    // SEARCH-MODULE: Grounding
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

    // LIVE-API: Real-time Comms
    const startLiveComm = async () => {
        if (isLiveActive) return;

        const outCtx = new AudioContext({ sampleRate: 24000 });
        audioContextRef.current = outCtx;

        const session = await ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: () => {
                    setIsLiveActive(true);
                    console.debug("Live link established.");
                },
                onmessage: async (msg: LiveServerMessage) => {
                    const audioBase64 = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    if (audioBase64 && audioContextRef.current) {
                        const ctx = audioContextRef.current;
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                        const buffer = await decodeAudioData(decode(audioBase64), ctx, 24000, 1);
                        const source = ctx.createBufferSource();
                        source.buffer = buffer;
                        source.connect(ctx.destination);
                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += buffer.duration;
                        sourcesRef.current.add(source);
                    }
                },
                onclose: () => setIsLiveActive(false),
                onerror: (e) => console.error(e)
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } },
                systemInstruction: 'You are OmniDock Tactical OS. Short, clear, vocal responses only.'
            }
        });

        // Mic streaming logic
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const inCtx = new AudioContext({ sampleRate: 16000 });
        const source = inCtx.createMediaStreamSource(stream);
        const processor = inCtx.createScriptProcessor(4096, 1, 1);
        
        processor.onaudioprocess = (e) => {
            const input = e.inputBuffer.getChannelData(0);
            const int16 = new Int16Array(input.length);
            for (let i = 0; i < input.length; i++) int16[i] = input[i] * 32768;
            session.sendRealtimeInput({ 
                media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' } 
            });
        };
        source.connect(processor);
        processor.connect(inCtx.destination);
        
        liveSessionRef.current = { session, stream, inCtx };
    };

    const stopLiveComm = () => {
        if (liveSessionRef.current) {
            liveSessionRef.current.stream.getTracks().forEach(t => t.stop());
            liveSessionRef.current.inCtx.close();
        }
        setIsLiveActive(false);
    };

    // --- UI HANDLERS ---

    const handleChat = async (msg: string) => {
        const newHistory: ChatMessage[] = [...chatHistory, { role: 'user', text: msg }];
        setChatHistory(newHistory);
        setIsLoading(true);
        try {
            const reply = await runDeepIntel(msg);
            setChatHistory([...newHistory, { role: 'model', text: reply || '' }]);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
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
                sources: result.sources as any,
                timestamp: Date.now()
            };
            setCaptures([newCap, ...captures]);
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const renderContent = () => {
        switch (activeWidget) {
            case 'chat':
                return (
                    <div className="chat-window">
                        <div className="chat-messages">
                            {chatHistory.map((m, i) => (
                                <div key={i} className={`message ${m.role}`}>
                                    {m.role === 'model' && <div className="thinking-status">Deep-Intel Reasoning Module Active</div>}
                                    {m.text}
                                </div>
                            ))}
                            {isLoading && <div className="message model shimmer">Analyzing complex vector space...</div>}
                        </div>
                        <input 
                            className="task-input" 
                            placeholder="Query Deep-Intel..." 
                            onKeyDown={e => {
                                if (e.key === 'Enter') {
                                    handleChat(e.currentTarget.value);
                                    e.currentTarget.value = '';
                                }
                            }}
                        />
                    </div>
                );
            case 'live':
                return (
                    <div style={{ textAlign: 'center' }}>
                        <div className="live-visualizer">
                            {isLiveActive && <div className="neural-pulse" />}
                            <div style={{ position: 'relative', zIndex: 1 }}>
                                {isLiveActive ? "VOICE LINK ACTIVE" : "VOICE LINK STANDBY"}
                            </div>
                        </div>
                        <button 
                            className={`btn-tactical ${isLiveActive ? 'shimmer' : ''}`}
                            style={{ width: '100%', background: isLiveActive ? 'var(--accent-danger)' : 'var(--accent)' }}
                            onClick={isLiveActive ? stopLiveComm : startLiveComm}
                        >
                            {isLiveActive ? "TERMINATE LINK" : "ESTABLISH LIVE LINK"}
                        </button>
                    </div>
                );
            case 'intel':
                return (
                    <div className="intel-terminal">
                        <input 
                            className="task-input" 
                            placeholder="Global Search Query..." 
                            onKeyDown={e => {
                                if (e.key === 'Enter') {
                                    handleResearch(e.currentTarget.value);
                                    e.currentTarget.value = '';
                                }
                            }}
                        />
                        <div className="task-list" style={{ marginTop: 16 }}>
                            {captures.filter(c => c.type === 'intel').map(c => (
                                <div key={c.id} className="analysis-box">
                                    <div className="obsidian-meta">Search Result: {c.content}</div>
                                    <div style={{ fontSize: '0.85rem' }}>{c.analysis}</div>
                                    <div style={{ marginTop: 8 }}>
                                        {c.sources?.map((s, i) => s.web && (
                                            <a key={i} href={s.web.uri} target="_blank" className="source-link">
                                                [{i+1}] {s.web.title}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'tasks':
                return (
                    <div className="tasks-container">
                        <div className="task-input-wrapper">
                            <input className="task-input" placeholder="Quick objective..." />
                        </div>
                        <div className="task-list">
                            {tasks.map(t => (
                                <div key={t.id} className="task-item">
                                    <div className="task-checkbox" />
                                    <span>{t.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <>
            <div className="bg-grid" />
            <div className="omni-dock">
                <div className={`widget-small ${activeWidget === 'live' ? 'active' : ''}`} onClick={() => setActiveWidget('live')}>
                    <span className="widget-icon">📡</span>
                    <span className="widget-label">Live</span>
                </div>
                <div className={`widget-small ${activeWidget === 'chat' ? 'active' : ''}`} onClick={() => setActiveWidget('chat')}>
                    <span className="widget-icon">🧠</span>
                    <span className="widget-label">Deep</span>
                </div>
                <div className={`widget-small ${activeWidget === 'intel' ? 'active' : ''}`} onClick={() => setActiveWidget('intel')}>
                    <span className="widget-icon">🌍</span>
                    <span className="widget-label">Intel</span>
                </div>
                <div className={`widget-small ${activeWidget === 'tasks' ? 'active' : ''}`} onClick={() => setActiveWidget('tasks')}>
                    <span className="widget-icon">⚡</span>
                    <span className="widget-label">Tasks</span>
                </div>
                <div className={`widget-small ${activeWidget === 'obsidian' ? 'active' : ''}`} onClick={() => setActiveWidget('obsidian')}>
                    <span className="widget-icon">⚙️</span>
                    <span className="widget-label">OS</span>
                </div>
            </div>

            {activeWidget && (
                <div className="expanded-overlay" onClick={() => setActiveWidget(null)}>
                    <div className="expanded-panel" onClick={e => e.stopPropagation()}>
                        <div className="panel-header">
                            <h2>{activeWidget} terminal</h2>
                            <button className="close-panel" onClick={() => setActiveWidget(null)}>&times;</button>
                        </div>
                        <div className="panel-content">{renderContent()}</div>
                    </div>
                </div>
            )}
        </>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
