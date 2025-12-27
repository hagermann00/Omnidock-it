import React, { createContext, useContext, useState, useEffect } from 'react';

export type DockPosition = 'right' | 'left'; // Default right

export interface DockContextType {
    isGlobalOverride: boolean;
    setGlobalOverride: (val: boolean) => void;
    dockPosition: DockPosition;
    registerFloater: (id: string) => void;
    unregisterFloater: (id: string) => void;
    // Signals
    commandSignal: 'dock' | 'undock' | 'minimize' | null;
    issueCommand: (cmd: 'dock' | 'undock' | 'minimize') => void;
}

const DockContext = createContext<DockContextType | undefined>(undefined);

export const DockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isGlobalOverride, setGlobalOverride] = useState(true);
    const [dockPosition] = useState<DockPosition>('right');
    const [registeredFloaters, setRegisteredFloaters] = useState<Set<string>>(new Set());
    const [commandSignal, setCommandSignal] = useState<'dock' | 'undock' | 'minimize' | null>(null);

    const registerFloater = (id: string) => {
        setRegisteredFloaters(prev => new Set(prev).add(id));
    };

    const unregisterFloater = (id: string) => {
        setRegisteredFloaters(prev => {
            const next = new Set(prev);
            next.delete(id);
            return next;
        });
    };

    const issueCommand = (cmd: 'dock' | 'undock' | 'minimize') => {
        setCommandSignal(cmd);
        // Reset signal after short delay to allow re-triggering
        setTimeout(() => setCommandSignal(null), 100);
    };

    return (
        <DockContext.Provider value={{
            isGlobalOverride,
            setGlobalOverride,
            dockPosition,
            registerFloater,
            unregisterFloater,
            commandSignal,
            issueCommand
        }}>
            {children}
        </DockContext.Provider>
    );
};

export const useDock = () => {
    const context = useContext(DockContext);
    if (!context) throw new Error("useDock must be used within a DockProvider");
    return context;
};
