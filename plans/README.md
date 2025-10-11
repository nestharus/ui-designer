# Plans Directory

This directory contains planning documents and research tied to specific plans.

## Structure

```text
plans/
├── plan 1/
│   ├── UI Design Plan 1.md      # The plan document
│   └── research/                # Research papers and resources tied to this plan
│       └── <paper>.md
├── monorepo-cleanup-plan.md     # Standalone plan documents are also allowed
└── ...
```

## Authoring a New Plan

1. Create a folder: `plans/plan <n>/`
2. Create the plan document (e.g., `UI Design Plan <n>.md`)
3. Add supporting research under `plans/plan <n>/research/`
4. Link research from the plan document
5. Keep the plan self-contained (context, goals, milestones, open questions)

## Research Papers

- Place research papers under the plan’s `research/` folder.
- Tie each research artifact to the parent plan (link both directions when helpful).
- Prefer Markdown summaries for external papers; store PDFs externally and link to them if needed.

## When to Use Plans vs Docs

- Use `plans/` for proposals, roadmaps, migrations, and explorations.
- Use `docs/` for stable, long‑form guidance and reference material.
- When a plan stabilizes into standard practice, port relevant content to `docs/` and link back from the plan for historical context.
