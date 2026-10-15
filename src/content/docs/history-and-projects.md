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
| `forwarded` | Forwarded with no confirmed modification |
| `modified_forwarded` | Forwarded with at least one observed modification |
| `dropped` | Blocked |
| empty/pending | No final decision was recorded |

A `!` beside the outcome marks a modification warning. The detail explains whether
the agent reported a partial failure or the resulting Intent could not be verified.
In these cases, do not infer that every requested change reached the app.

## Search

Type in the search field to filter visible rows in real time. The search matches
against class, method, action, component, data, flags, and categories. Selector fields
are included recursively. Extra keys, types, and values are searchable throughout
structured Bundles, arrays, lists, and nested Intents, including nested intent fields
such as action, data, component,
package, flags, and categories. Opaque, unreadable, referenced, and truncated values
can also be found by their displayed type or status.

The History command bar controls the same search field:

```text
/search MainActivity
/search payment token
/search
```

`/search <text>` applies a case-insensitive substring search. `/search` without
text clears it. The command and the visual field always show the same query.
Search is temporary; use structured `/filter` rules when a condition must be
saved with the project.

## Sorting

Click any column header to sort by that column. Click again to reverse the order.
The default sort is newest first by ID.

## Column selection

Use the **⊟** button to show or hide individual columns. The selection is stored in
the project file and restored on next launch.

The same dialog also lets you set optional widths for Time and long text columns:
Method, Class, Component, and Action. Widths can be set from 5 to 150 cells.
Empty width fields use Textual's automatic sizing. Configured widths are stored
in the project file.

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
- History column visibility and width preferences.

The outer Intent's `Package` restriction is preserved when a project is reopened,
including for modified intents. A captured absent package is kept distinct from
a field that was never recorded. Existing projects are migrated automatically,
but package values missing from older captures are not reconstructed from routing
metadata: that metadata may describe a selector instead of the outer Intent.

## Clearing history

Use the History clear action when you want to remove the current session rows.

This clears both the in-memory history and the stored intent rows in the current project.

## Export

Use the export action to write History entries to JSON. You can export the full
history or only the currently filtered History view.

The export is JSON and is suitable for later review, reporting, or external analysis.
