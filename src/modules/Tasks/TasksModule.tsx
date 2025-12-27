import React, { useState } from 'react';
import { FloaterFrame } from '../../components/FloaterFrame';
import { Task } from '../../../types';

export const TasksModule = () => {
    const [tasks, setTasks] = useState<Task[]>([]);

    const addTask = (text: string) => {
        if (!text.trim()) return;
        setTasks([{
            id: Date.now().toString(),
            text,
            completed: false,
            timestamp: Date.now()
        }, ...tasks]);
    };

    return (
        <FloaterFrame
            id="tasks-module"
            title="Objectives"
            icon={<span style={{ fontSize: '2rem' }}>⚡</span>}
            defaultColor="#8b5cf6" // Violet
            initialIndex={3}
        >
             <div className="flex flex-col h-full bg-slate-50">
                <div className="p-4 border-b border-slate-200 bg-white">
                    <input
                        className="w-full bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
                        placeholder="New objective..."
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                addTask(e.currentTarget.value);
                                e.currentTarget.value = '';
                            }
                        }}
                    />
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                    {tasks.map(t => (
                        <div key={t.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-100 mb-2 shadow-sm">
                            <input type="checkbox" className="w-4 h-4 text-violet-600 rounded" />
                            <span className="text-sm text-slate-700">{t.text}</span>
                        </div>
                    ))}
                </div>
             </div>
        </FloaterFrame>
    );
};
