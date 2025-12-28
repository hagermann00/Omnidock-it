# OmniDock Tactical: System Concept & Capabilities

## Executive Summary
OmniDock Tactical is a **Modular Native Overlay System** designed to provide perpetual, adaptable AI and utility assistance without disrupting the user's primary workflow. Unlike traditional monolithic applications, OmniDock allows its components ("Floaters") to exist as independent entities that can function autonomously or operate as a cohesive "Team" via a unifying docking interface.

This system is architected for **infinite iteration**, allowing new modules to be developed by separate "agents" (human or AI) and plugged into the ecosystem with zero friction.

---

## Core User Experience

### 1. The "Floater" Ideology
The fundamental unit of the system is the **Floater**.
- **Independent Existence**: Each module (Chat, Voice, Search, etc.) runs its own logic. It does not rely on the others to function.
- **Dual State**:
    - **Docked (Default)**: A discreet 70x70px "Tile" resting on the right-hand edge of the screen. It stays out of the way of scrollbars and window controls.
    - **Floating**: When dragged away from the dock, the module becomes a fully independent window. It can be positioned anywhere on the "desktop" surface.
- **Visual Intuition**: No text labels. Each floater is identified by distinct, intuitive imagery/branding (e.g., a neural pulse for Voice, a map/globe for Intel).

### 2. The "Unifying Bar" (The Dock)
While floaters are independent, they respect a **Global Command Structure** by default.
- **Snap-to-Right**: The system defaults to a "Clean Desk" policy, keeping tools organized on the right edge.
- **Global Override**: The Dock can issue global commands (e.g., "Minimize All," "Mute All," "Adjust Opacity").
- **Compliance System**:
    - Every Floater has a **Control Toggle**.
    - **Default**: Compliant (obeys global dock settings).
    - **Adjusted**: Non-Compliant (maintains user-specified custom settings regardless of global state).

### 3. Interaction Flow
1.  **Passive**: The user sees a column of subtle, distinct icons on the right.
2.  **Active**: The user clicks a specific icon (e.g., "Deep Intel"). It expands into a functional card (mimicking the *Read-It* UI).
3.  **Multitasking**: The user drags the "Deep Intel" card to the left to keep it open while researching. They leave "Live Voice" docked but active in the background.

---

## Functional Capabilities

The initial build includes five core modules, with the architecture supporting unlimited future additions.

| Module | Purpose | Visual Identity (Concept) |
| :--- | :--- | :--- |
| **Live** | Real-time Voice Communications | Neural Pulse / Waveform |
| **Deep** | Advanced Reasoning & Chat | Brain / Synaptic Network |
| **Intel** | Global Search & Analysis | Globe / Radar / Map |
| **Tasks** | Objective Management | Lightning / Checkmark |
| **OS** | System Configuration & Vault | Gear / Circuit |

---

## Technical & Architectural Nature

### Modular Compatibility
The system is built to be **"Future-Proof."**
- **Isolation**: Changes to the "Intel" module will never break the "Live" module.
- **Standardized Interfaces**: All modules share a common "Floater Frame" contract. This means any new tool built in the future only needs to wrap itself in this frame to inherit docking, dragging, and global control capabilities immediately.

### "Native App" Feel
- **Non-Browser Behavior**: The system ignores standard web constraints. It feels like a desktop layer.
- **Absolute Positioning**: Elements float *over* content, they do not push content down.

### The "Multi-Agent" Build Method
This project is structured so that different developers (or AI agents) can take ownership of single modules without needing to understand the entire codebase. One agent can perfect the "Voice" latency while another redesigns the "Tasks" UI, with the *DockManager* ensuring they play nicely together.

---

## Limiting Aspects & Considerations
- **Screen Real Estate**: By default, the right edge is reserved. Users with cluttered desktops may need to adjust the "Snap" behavior.
- **Visual Only**: As a visual overlay, it requires screen space. It is not a background service that runs purely in the tray (though minimized states are very small).
- **Native Dependencies**: Some advanced features (clipboard access, global hotkeys) mimic native behavior but run within the provided runtime environment.

---

## Conclusion
OmniDock is not just a sidebar; it is a **dynamic workspace overlay**. It offers the stability of a fixed toolbar with the flexibility of a multi-window desktop manager, all wrapped in a "Tactical" aesthetic that prioritizes speed, intuition, and independence.
