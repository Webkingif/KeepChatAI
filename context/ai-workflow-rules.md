# AI Workflow Rules: KeepChat

1. **State Isolation**: Separate pure state management and storage from presentation components.
2. **Deterministic Markdown**: Use robust custom component overrides for react-markdown elements (`code`, `table`, `th`, `td`, `pre`, `blockquote`).
3. **Responsive Invariants**: Test and verify both Desktop (>768px) two-pane layout and Mobile (<768px) single-pane view with back button navigation.
