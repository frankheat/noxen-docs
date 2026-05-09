---
title: "History and projects"
---

History is the audit trail for a noxen session. It records captured intents even when
they are auto-forwarded by filters or observed while interception is off.

You can open a project without attaching to an app. This is useful when you only want
to review a previous session, inspect captured component communication, or export data.

## What History shows

Each row represents one captured event and includes the hooked class/method, intent
fields, outcome, and optional stack trace.

Common outcomes:

| Outcome | Meaning |
|---|---|
| `forwarded` | Delivered unchanged |
| `modified_forwarded` | Modified and then delivered |
| `dropped` | Blocked |
| empty/pending | No final decision was recorded |

## Search

Type in the search field to filter visible rows in real time. The search matches
against class, method, action, component, data, flags, categories, and extra keys
and values.

## Sorting

Click any column header to sort by that column. Click again to reverse the order.
The default sort is newest first by ID.

## Column selection

Use the **⊟** button to show or hide individual columns. The selection is stored in
the project file and restored on next launch.

## Modified intents

When an intent is changed before forwarding, History stores both views:

- the final values that were delivered;
- the original values captured before modification.

This lets you review what changed without losing the original evidence.

## Project files

noxen stores session data and UI state in a `.noxen` project file (SQLite).

Create a new project:

```bash
noxen --new-project session
```

Open an existing project:

```bash
noxen --project session.noxen
```

If no project option is used, a temporary project is created for the running session.

## Stored state

Project files include:

- captured intents;
- final outcome;
- modified and original intent values;
- Intercept filters.
- History filters.
- History column preferences.

## Clearing history

Use the History clear action when you want to remove the current session rows.

This clears both the in-memory history and the stored intent rows in the current project.

## Export

Use the export action to write History entries to JSON. You can export the full
history or only the currently filtered History view.

The export is JSON and is suitable for later review, reporting, or external analysis.
