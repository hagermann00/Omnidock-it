
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import ReactDOM from 'react-dom/client';
import { DockProvider } from './src/context/DockContext';
import { LiveModule } from './src/modules/Live/LiveModule';
import { DeepModule } from './src/modules/Deep/DeepModule';
import { IntelModule } from './src/modules/Intel/IntelModule';
import { TasksModule } from './src/modules/Tasks/TasksModule';
import { OSModule } from './src/modules/OS/OSModule';
import './index.css';

function App() {
    return (
        <DockProvider>
            <div className="w-screen h-screen overflow-hidden bg-transparent pointer-events-none">
                {/*
                   Pointer events are none for the container so clicks pass through to whatever is "behind"
                   (simulating overlay), but children (floaters) must re-enable pointer-events.
                */}
                <div className="pointer-events-auto">
                    <LiveModule />
                    <DeepModule />
                    <IntelModule />
                    <TasksModule />
                    <OSModule />
                </div>

                {/* Background Grid (Optional, can be removed for cleaner look) */}
                <div className="bg-grid fixed inset-0 -z-10 opacity-30 pointer-events-none" />
            </div>
        </DockProvider>
    );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
