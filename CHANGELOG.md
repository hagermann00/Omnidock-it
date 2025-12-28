# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-05-20

### Added
- **Command Dispatcher**: A Spotlight-style global input (Ctrl+Space) with Voice and Text support.
- **AI Intent Routing**: The dispatcher uses Gemini Flash Lite to intelligently route commands to Tasks, Deep, or Intel modules.
- **SystemContext**: A global state store allowing the Router to manipulate module data (Tasks, Chat History, Captures) externally.
- **Module Architecture**: Split the monolithic App into independent `Live`, `Deep`, `Intel`, `Tasks`, and `OS` modules.
- **FloaterFrame**: A standardized window wrapper supporting Docking, Floating, and Expansion states.
- **DockManager**: Logic for "Snap to Right" and global compliance overrides.
- **Visuals**: Adopted "Clean Slate" aesthetic (70x70px icons) with unique module color identities.

### Changed
- Refactored `App.tsx` to act as a lightweight shell composition root.
- Moved all API logic to `src/services/ai.ts`.
