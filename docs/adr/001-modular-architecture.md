# 1. Modular Floater Architecture

Date: 2025-05-20
Status: Accepted

## Context
The initial "OmniDock" prototype was a monolithic React application where all widget logic (Chat, Voice, Search) resided in a single `App.tsx` file.
*   **Problem**: This made it impossible to scale development. Adding a feature to "Chat" risked breaking "Voice". It was not suitable for a "Multi-Agent" workflow where different developers work on different parts simultaneously.
*   **Requirement**: The system needed to evolve into a "Brownfield" refactor that supports independent "Floaters" (windowed apps) while maintaining a cohesive "Dock" experience.

## Decision
We have decided to refactor the application into a **Modular Floater Architecture**.

1.  **Module Isolation**: Each feature (Live, Deep, Intel, Tasks, OS) is extracted into its own directory (`src/modules/X`).
2.  **Shared "Shell"**: A generic `FloaterFrame` component wraps every module, handling standard behaviors like:
    *   Docking/Undocking
    *   Dragging (Window movement)
    *   Expansion/Collapse
    *   Global "Snap" compliance
3.  **Global Context**: A `SystemContext` was introduced to allow the central `CommandDispatcher` (the "Router") to inject data into modules without knowing their internal implementation details.

## Consequences

### Positive
*   **Parallel Development**: Agent A can rewrite `src/modules/Live` while Agent B works on `src/modules/Deep` with zero merge conflicts.
*   **Resilience**: A crash in the "Intel" UI logic does not crash the "Live" voice connection (in theory, though they share the same JS thread, React error boundaries can now be applied per module).
*   **Scalability**: New modules can be added simply by creating a folder and importing it in `App.tsx`.

### Negative
*   **Complexity**: There is more boilerplate (Contexts, Wrappers) than a simple single-file app.
*   **State Management**: Modules are no longer "siblings" sharing local state; they must communicate via the `SystemContext` or remain isolated.

## Compliance
All future modules MUST be wrapped in `<FloaterFrame>` to ensure they adhere to the docking physics and visual consistency of the platform.
