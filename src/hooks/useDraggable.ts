import { useState, useEffect, useCallback, RefObject } from 'react';

interface Position {
    x: number;
    y: number;
}

export const useDraggable = (
    ref: RefObject<HTMLElement>,
    initialPosition: Position = { x: 0, y: 0 },
    enabled: boolean = true
) => {
    const [position, setPosition] = useState<Position>(initialPosition);
    const [isDragging, setIsDragging] = useState(false);
    const [offset, setOffset] = useState<Position>({ x: 0, y: 0 });

    const handleMouseDown = useCallback((e: React.MouseEvent | MouseEvent) => {
        if (!enabled || !ref.current) return;
        // Only trigger if clicking the header or specific handle
        // (For now, we assume the caller attaches this to the handle)

        setIsDragging(true);
        setOffset({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    }, [enabled, position, ref]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging) return;

        const newX = e.clientX - offset.x;
        const newY = e.clientY - offset.y;

        // Simple boundary check (optional, can be refined)
        setPosition({ x: newX, y: newY });
    }, [isDragging, offset]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return {
        position,
        setPosition, // Allow manual overrides (e.g. for docking)
        handleMouseDown,
        isDragging
    };
};
