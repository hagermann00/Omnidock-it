import React, { useState, useEffect, useRef } from 'react';
import { useSystem } from '../context/SystemContext';
import { useDock } from '../context/DockContext';
import { getAIClient } from '../services/ai';

export const CommandDispatcher = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const { addTask, addChatMessage, addCapture } = useSystem();
    const { issueCommand } = useDock();
    const ai = getAIClient();

    // Hotkey Listener (Ctrl + Space)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.code === 'Space') {
                e.preventDefault();
                setIsVisible(prev => !prev);
            }
            if (e.key === 'Escape') {
                setIsVisible(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Auto-focus input
    useEffect(() => {
        if (isVisible && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isVisible]);

    // Intent Classification Logic
    const handleCommand = async () => {
        if (!input.trim()) return;
        setIsProcessing(true);

        try {
            // Quick local checks first
            const lower = input.toLowerCase();
            if (lower.startsWith('task:')) {
                addTask(input.substring(5).trim());
                closeAndReset();
                return;
            }

            // AI Routing
            const prompt = `
                You are the OmniDock Router. Classify the following user input into a specific target action.
                Input: "${input}"

                Targets:
                - TASKS: If it is a todo, objective, or reminder.
                - DEEP: If it is a chat, question, or reasoning request.
                - INTEL: If it is a request to search the web or find information.
                - SYSTEM: If it is a system command (e.g. "dock everything", "minimize").

                Return strictly JSON: { "target": "TASKS" | "DEEP" | "INTEL" | "SYSTEM", "payload": string, "systemCmd"?: "dock" | "undock" | "minimize" }
            `;

            const result = await ai.models.generateContent({
                model: 'gemini-2.5-flash-lite-latest',
                contents: prompt
            });

            const text = result.text || '';
            // Simple JSON cleanup if md block is returned
            const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const cmd = JSON.parse(jsonStr);

            switch (cmd.target) {
                case 'TASKS':
                    addTask(cmd.payload);
                    break;
                case 'DEEP':
                    addChatMessage({ role: 'user', text: cmd.payload });
                    // Ideally we also trigger the bot response here, but DeepModule listens to history changes?
                    // No, DeepModule currently only responds to *local* handleChat calls.
                    // Ideally we need a way to trigger the "Generate" function in DeepModule.
                    // For now, we'll just push the user message. (Refinement needed later)
                    break;
                case 'INTEL':
                    // Similar issue, IntelModule needs to "react" to new captures?
                    // Or we just add a "pending" capture?
                    addCapture({
                        id: Date.now().toString(),
                        type: 'intel',
                        content: cmd.payload,
                        analysis: "Pending analysis via Router...", // Placeholder
                        timestamp: Date.now()
                    });
                    break;
                case 'SYSTEM':
                    if (cmd.systemCmd) issueCommand(cmd.systemCmd);
                    break;
            }

        } catch (e) {
            console.error("Routing failed", e);
            // Fallback: Default to Deep Chat
            addChatMessage({ role: 'user', text: input });
        } finally {
            closeAndReset();
        }
    };

    const closeAndReset = () => {
        setIsProcessing(false);
        setInput('');
        setIsVisible(false);
    };

    // Voice Input (Web Speech API)
    const startListening = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Voice not supported in this environment.");
            return;
        }
        // @ts-ignore
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setInput("Listening...");
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            // Auto-submit on voice end?
            // setTimeout(() => handleCommand(), 500);
        };

        recognition.start();
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setIsVisible(false)}>
            <div className="w-[600px] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex items-center p-4 gap-4">
                    <span className="text-2xl">⌘</span>
                    <input
                        ref={inputRef}
                        className="flex-1 bg-transparent border-none outline-none text-xl text-white placeholder-slate-500 font-light"
                        placeholder="Type a command or ask..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleCommand()}
                    />
                    <button
                        className={`p-2 rounded-full hover:bg-slate-800 ${input === 'Listening...' ? 'text-red-500 animate-pulse' : 'text-slate-400'}`}
                        onClick={startListening}
                    >
                        🎤
                    </button>
                </div>
                {isProcessing && (
                    <div className="h-1 w-full bg-slate-800 overflow-hidden">
                        <div className="h-full bg-indigo-500 animate-progress origin-left" style={{ width: '100%' }}></div>
                    </div>
                )}
            </div>
        </div>
    );
};
