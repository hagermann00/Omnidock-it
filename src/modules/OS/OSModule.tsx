import React, { useState } from 'react';
import { FloaterFrame } from '../../components/FloaterFrame';

export const OSModule = () => {
    const [vaultName] = useState<string>(localStorage.getItem('obsidian_vault') || '');

    return (
        <FloaterFrame
            id="os-module"
            title="System Core"
            icon={<span style={{ fontSize: '2rem' }}>⚙️</span>}
            defaultColor="#64748b" // Slate
            initialIndex={4}
        >
             <div className="flex flex-col h-full bg-slate-50 p-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">System Configuration</h3>

                <div className="bg-white p-4 rounded-lg border border-slate-200 mb-4">
                    <label className="block text-xs font-bold text-slate-700 mb-2">Obsidian Vault Name</label>
                    <input
                        className="w-full bg-slate-100 border border-slate-300 rounded px-3 py-2 text-sm"
                        defaultValue={vaultName}
                        placeholder="e.g. MyVault"
                        onChange={(e) => localStorage.setItem('obsidian_vault', e.target.value)}
                    />
                </div>

                <div className="text-xs text-slate-500 mt-auto text-center">
                    OmniDock Tactical OS v0.2.0<br/>
                    Platform Architecture Active
                </div>
             </div>
        </FloaterFrame>
    );
};
