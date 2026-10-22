# Domain docs

## Before exploring

Read these files when they exist:

- `CONTEXT.md` at the repository root.
- Relevant decisions under `docs/adr/`.

If they do not exist, continue without flagging their absence. The domain-modeling skills create them when the project resolves relevant terms or decisions.

## File structure

This repository uses a single-context layout:

```
/
├── CONTEXT.md
├── docs/
│   └── adr/
└── src/
```

## Use the glossary vocabulary

Use terms as defined in `CONTEXT.md` when naming domain concepts in issues, proposals, tests, and code.

If a required concept is missing, reconsider whether the project uses a different term or record the gap for domain modeling.

## Flag conflicts with decisions

Call out work that contradicts an existing architecture decision record instead of silently overriding it.
