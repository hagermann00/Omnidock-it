
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export type WidgetType = 'clock' | 'tasks' | 'capture' | 'voice' | 'obsidian' | 'chat' | 'live' | 'intel';

export interface Task {
    id: string;
    text: string;
    completed: boolean;
    timestamp: number;
}

export interface CaptureResult {
    id: string;
    type: 'image' | 'voice' | 'intel';
    content: string;
    analysis?: string;
    timestamp: number;
    sources?: Array<{ web?: { uri: string; title: string } }>;
}

export interface Artifact {
    id: string;
    html: string;
    styleName: string;
    status: 'streaming' | 'complete';
}

export interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    isThinking?: boolean;
}
