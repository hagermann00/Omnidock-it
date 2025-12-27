import React, { createContext, useContext, useState, useEffect } from 'react';
import { Task, ChatMessage, CaptureResult } from '../types';

interface SystemContextType {
    // TASKS STATE
    tasks: Task[];
    addTask: (text: string) => void;

    // DEEP STATE
    chatHistory: ChatMessage[];
    addChatMessage: (msg: ChatMessage) => void;
    setChatHistory: (history: ChatMessage[]) => void;

    // INTEL STATE
    captures: CaptureResult[];
    addCapture: (cap: CaptureResult) => void;

    // OBSIDIAN STATE
    vaultName: string;
    setVaultName: (name: string) => void;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // --- TASKS ---
    const [tasks, setTasks] = useState<Task[]>([]);
    const addTask = (text: string) => {
        const newTask: Task = {
            id: Date.now().toString(),
            text,
            completed: false,
            timestamp: Date.now()
        };
        setTasks(prev => [newTask, ...prev]);
    };

    // --- DEEP ---
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const addChatMessage = (msg: ChatMessage) => {
        setChatHistory(prev => [...prev, msg]);
    };

    // --- INTEL ---
    const [captures, setCaptures] = useState<CaptureResult[]>([]);
    const addCapture = (cap: CaptureResult) => {
        setCaptures(prev => [cap, ...prev]);
    };

    // --- OS ---
    const [vaultName, setVaultName] = useState<string>(localStorage.getItem('obsidian_vault') || '');
    useEffect(() => {
        localStorage.setItem('obsidian_vault', vaultName);
    }, [vaultName]);

    return (
        <SystemContext.Provider value={{
            tasks, addTask,
            chatHistory, addChatMessage, setChatHistory,
            captures, addCapture,
            vaultName, setVaultName
        }}>
            {children}
        </SystemContext.Provider>
    );
};

export const useSystem = () => {
    const context = useContext(SystemContext);
    if (!context) throw new Error("useSystem must be used within a SystemProvider");
    return context;
};
