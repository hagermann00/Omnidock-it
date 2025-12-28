import React, { useState, useEffect, useRef } from 'react';
import { useDock } from '../context/DockContext';
import { useDraggable } from '../hooks/useDraggable';

interface FloaterFrameProps {
    id: string;
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    defaultColor?: string;
    initialIndex: number; // For stacking order in the dock
}

export const FloaterFrame: React.FC<FloaterFrameProps> = ({
    id,
    title,
    icon,
    children,
    defaultColor = '#6366f1', // Indigo-500 default
    initialIndex
}) => {
    const { commandSignal, registerFloater, unregisterFloater } = useDock();

    // States
    const [isDocked, setIsDocked] = useState(true);
    const [isOpen, setIsOpen] = useState(false); // Expanded "Read-It" view
    const [isCompliant, setIsCompliant] = useState(true); // Toggle for "Team Inclusion"

    // Dock Position (Right edge, stacked)
    const DOCK_SIZE = 70;
    const DOCK_GAP = 12;
    const dockY = 100 + (initialIndex * (DOCK_SIZE + DOCK_GAP));
    const dockX = window.innerWidth - DOCK_SIZE - 20; // 20px from right

    const frameRef = useRef<HTMLDivElement>(null);

    // Draggable Logic
    // We only enable dragging if NOT docked (or dragging *from* dock breaks the dock state)
    // Actually, dragging from dock should "undock" it.
    const { position, setPosition, handleMouseDown, isDragging } = useDraggable(
        frameRef as React.RefObject<HTMLElement>,
        { x: dockX, y: dockY },
        true
    );

    useEffect(() => {
        registerFloater(id);
        return () => unregisterFloater(id);
    }, [id]);

    // Handle Resize/Snap
    useEffect(() => {
        const handleResize = () => {
            if (isDocked) {
                setPosition({ x: window.innerWidth - DOCK_SIZE - 20, y: dockY });
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isDocked, dockY, setPosition]);

    // Handle Global Commands
    useEffect(() => {
        if (!isCompliant) return; // Ignore if non-compliant

        if (commandSignal === 'dock') {
            setIsDocked(true);
            setIsOpen(false);
            setPosition({ x: window.innerWidth - DOCK_SIZE - 20, y: dockY });
        }
        if (commandSignal === 'minimize') {
            setIsOpen(false);
        }
    }, [commandSignal, isCompliant, dockY, setPosition]);

    // Auto-Undock on Drag
    useEffect(() => {
        if (isDragging && isDocked) {
            // Threshold to break dock? For now, immediate.
            setIsDocked(false);
        }
    }, [isDragging, isDocked]);

    // Render
    const style: React.CSSProperties = {
        position: 'fixed',
        left: position.x,
        top: position.y,
        width: isOpen ? 400 : DOCK_SIZE, // 400px expanded width like Read-It
        height: isOpen ? 500 : DOCK_SIZE,
        zIndex: isDragging ? 9999 : (isOpen ? 1000 : 100),
        transition: isDragging ? 'none' : 'width 0.3s, height 0.3s, left 0.3s, top 0.3s',
    };

    return (
        <div
            ref={frameRef}
            style={style}
            className={`
                floater-frame rounded-2xl shadow-2xl overflow-hidden flex flex-col
                ${isDocked ? 'bg-opacity-90 backdrop-blur-md' : 'bg-white'}
                border border-slate-700
            `}
            // Apply theme colors via inline style or CSS class
        >
            {/* Header / Handle (Visible when expanded or docked?) */}
            {/* When Docked: It's just a button. */}

            {!isOpen ? (
                // ICON VIEW (Docked or Floating Mini)
                <div
                    className="w-full h-full flex items-center justify-center cursor-pointer relative group bg-slate-900"
                    onMouseDown={handleMouseDown}
                    onClick={(e) => {
                        // Prevent click if dragging
                        if (!isDragging) setIsOpen(true);
                    }}
                >
                    <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity" style={{ backgroundColor: defaultColor }} />
                    <div className="z-10 text-white transform group-hover:scale-110 transition-transform">
                        {icon}
                    </div>
                </div>
            ) : (
                // EXPANDED VIEW
                <div className="w-full h-full flex flex-col bg-slate-50">
                    {/* Header */}
                    <div
                        className="h-10 flex items-center justify-between px-3 bg-slate-900 text-slate-200 cursor-move"
                        onMouseDown={handleMouseDown}
                    >
                        <div className="flex items-center gap-2">
                            <span style={{ color: defaultColor }}>{icon}</span>
                            <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Compliance Toggle */}
                            <button
                                className={`w-3 h-3 rounded-full ${isCompliant ? 'bg-green-500' : 'bg-red-500'}`}
                                onClick={(e) => { e.stopPropagation(); setIsCompliant(!isCompliant); }}
                                title={isCompliant ? "Team Inclusion: ON" : "Independent Mode"}
                            />
                            {/* Close / Minimize */}
                            <button onClick={() => setIsOpen(false)} className="hover:text-white">&times;</button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-hidden relative">
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
};
