import React, { useState, useRef } from 'react';
import { getAIClient } from '../../services/ai';
import { FloaterFrame } from '../../components/FloaterFrame';
import { Modality, LiveServerMessage } from '@google/genai';

// --- Audio Utilities (Copied for isolation) ---
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

export const LiveModule = () => {
    const [isLiveActive, setIsLiveActive] = useState(false);

    // Refs
    const liveSessionRef = useRef<any>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef(0);
    const sourcesRef = useRef(new Set<AudioBufferSourceNode>());

    const ai = getAIClient();

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

    return (
        <FloaterFrame
            id="live-module"
            title="Live Comm"
            icon={<span style={{ fontSize: '2rem' }}>📡</span>}
            defaultColor="#ef4444" // Red
            initialIndex={0}
        >
            <div className="p-4 flex flex-col h-full justify-center items-center bg-slate-50">
                <div className="live-visualizer mb-4 w-full h-32 bg-black rounded-xl relative overflow-hidden flex items-center justify-center">
                    {isLiveActive && <div className="neural-pulse absolute inset-0 bg-red-500 opacity-20 animate-pulse" />}
                    <div className="relative z-10 text-white font-mono text-xs tracking-widest">
                        {isLiveActive ? "VOICE LINK ACTIVE" : "VOICE LINK STANDBY"}
                    </div>
                </div>
                <button
                    className={`w-full py-3 rounded-lg font-bold text-white transition-all ${isLiveActive ? 'bg-red-600 animate-pulse' : 'bg-slate-800 hover:bg-slate-700'}`}
                    onClick={isLiveActive ? stopLiveComm : startLiveComm}
                >
                    {isLiveActive ? "TERMINATE LINK" : "ESTABLISH LINK"}
                </button>
            </div>
        </FloaterFrame>
    );
};
