# Issue tracker: GitHub

Issues and specs for this repository live as GitHub issues. Use the `gh` CLI for all operations.

## Conventions

- Create an issue with `gh issue create --title "..." --body "..."`.
- Read an issue with `gh issue view <number> --comments`.
- List issues with `gh issue list`, including the required state and label filters.
- Comment with `gh issue comment <number> --body "..."`.
- Apply or remove labels with `gh issue edit`.
- Close an issue with `gh issue close <number> --comment "..."`.

Infer the repository from `git remote -v`. The `gh` CLI does this automatically when run inside the repository.

## Pull requests as a triage surface

PRs as a request surface: no.

## When a skill says "publish to the issue tracker"

Create a GitHub issue.

## When a skill says "fetch the relevant ticket"

Run `gh issue view <number> --comments`.

## Wayfinding operations

The `wayfinder` skill uses one issue labelled `wayfinder:map` as the map, with linked sub-issues as tickets.

Use native GitHub sub-issues and issue dependencies when available. If unavailable, link children through the map's task list and use `Blocked by: #<number>` lines to record dependencies.

Claim a ticket with `gh issue edit <number> --add-assignee @me`. Resolve it by commenting with the answer, closing the issue, and recording the decision in the map.
