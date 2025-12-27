# Contributing to OmniDock Tactical

Welcome to the OmniDock Tactical project. This repository follows strict modular architecture principles to allow multiple agents (human or AI) to work in parallel without conflict.

## 1. Architectural Principles
*   **Module Independence**: Code inside `src/modules/<ModuleName>` belongs *only* to that module.
*   **Core Stability**: The `src/context`, `src/hooks`, and `src/components/FloaterFrame.tsx` are **Core Infrastructure**. Do not modify these unless your specific task is to upgrade the Platform itself.
*   **State Separation**: Modules should store local state internally. Global state must be routed through `SystemContext`.

## 2. Branching Strategy
We follow a simplified Git Flow.
*   `main`: The stable production code.
*   **Feature Branches**: Must follow the pattern: `feature/<module>-<description>`
    *   Example: `feature/live-audio-processing`
    *   Example: `feature/intel-search-ui`
*   **Core Updates**: Use `core/` prefix.
    *   Example: `core/upgrade-dock-logic`

## 3. Commit Guidelines
We utilize **Conventional Commits**. All commit messages must follow this format:
`type(scope): description`

*   **feat**: A new feature (e.g., `feat(live): add mute toggle`)
*   **fix**: A bug fix (e.g., `fix(dock): resolve overlapping windows`)
*   **docs**: Documentation only changes
*   **style**: Changes that do not affect the meaning of the code (white-space, formatting, etc)
*   **refactor**: A code change that neither fixes a bug nor adds a feature
*   **chore**: Maintenance tasks (e.g., `chore: update dependencies`)

## 4. Versioning
This project adheres to [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`.
*   **MAJOR**: Incompatible API changes (breaking the FloaterFrame contract).
*   **MINOR**: functionality in a backwards compatible manner (adding a new Module).
*   **PATCH**: Backwards compatible bug fixes.

## 5. Definition of Done
*   Typescript compiles with no errors.
*   The module opens/closes correctly in the Dock.
*   The module respects the "Clean Slate" visual theme.
