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
| `dropped` | The hook suppressed the call or the getter result; not proof that earlier delivery was undone |
| empty/pending | No final decision was recorded |

A `!` beside the outcome marks a modification warning. The detail explains whether
the agent reported a partial failure or the resulting Intent could not be verified.
In these cases, do not infer that every requested change reached the app.

## Search

Type in the search field to filter visible rows in real time. The search matches
against class, method, action, component, data, MIME type, flags, and categories. Selector fields
are included recursively. Extra keys, types, and values are searchable throughout
structured Bundles, arrays, lists, and nested Intents, including nested intent fields
such as action, data, component,
package, flags, and categories. Opaque, unreadable, referenced, and truncated values
can also be found by their displayed type or status.

ClipData labels, declared MIME types, item text, HTML, URIs, and nested Intents are
also included. An explicitly recorded absent Intent matches `null` and
`no Intent object`. Search uses a bounded local index of captured data; it never
opens a URI, re-reads a Java object, or recovers content omitted at capture time.
Index limits can also exclude part of a very large capture, so a search miss is
not proof that a value is absent. This is substring search, not a regular expression
or a query language; stack traces and component permission metadata are not indexed.

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

- the resulting values observed by the agent after applying modifications;
- the original values captured before modification.

This lets you review what changed without losing the original evidence.
It does not prove that the original method completed successfully or that Android
delivered the Intent to another component. If the result could not be captured,
the modification warning identifies that uncertainty.

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

If no project option is used, noxen creates a persistent
`project_YYYYMMDD_HHMMSS.noxen` file in the current working directory. It is not
deleted on exit and can be reopened with `--project`. Creating a project at an
existing path is refused; opening a missing project does not silently create one.

## Stored state

Project files include:

- captured intents;
- final outcome;
- modified and original intent values;
- capture completeness metadata, including omitted extra counts and read errors;
- Intercept filters;
- History filters;
- History column visibility and width preferences;
- the selected Hook config and Extra script paths (not their file contents).

Info app snapshots, Log messages, the current search query, and unforwarded editor
drafts are not restored from a project. A pending History outcome after reopening
is a historical record, not a blocked thread that can still be resumed.

The outer Intent's `Package` restriction is preserved when a project is reopened,
including for modified intents. A captured absent package is kept distinct from
a field that was never recorded. Existing projects are migrated automatically,
but package values missing from older captures are not reconstructed from routing
metadata: that metadata may describe a selector instead of the outer Intent.

Newly saved captures also retain the total/captured extra counts, omission and
read-error markers, and category truncation/read-error markers. These remain
available after reopening and in JSON exports. A post-edit completeness warning
is saved even when no field change could be confirmed. Older projects are
migrated automatically, but completeness metadata already lost by an older
version cannot be recovered; absence of a warning is not proof of a complete capture.

### Storage errors

If a capture cannot be saved, noxen keeps it in memory with a temporary negative
ID and shows a notification and a **Storage warning** in its detail. Intercept
actions and editing still refer to that capture, not to a previous History row.
Temporary IDs are never used to update database rows, even if saving later recovers.

If a later update fails, the in-memory capture keeps its latest values and outcome,
but the project may still contain earlier values. The detail identifies this too.
Export History before closing noxen to retain these in-memory records; unsaved
captures are not automatically retried or restored when reopening the project.

## Clearing history

Use the History clear action when you want to remove the current session rows.

This clears both the in-memory history and the stored intent rows in the current project.

The project deletion must succeed before the in-memory History and its pending
table updates are cleared. If deletion fails, noxen reports the error and keeps
the History unchanged. Concurrent captures are registered either before or after
the clear operation, consistently in memory and in the project.

Clearing History does not forward or drop an Intent currently blocked in Intercept,
nor discard its editor draft. Resolve that Intent separately in Intercept.

## Export

Use the export action to write History entries to JSON. You can export the full
history or only the currently filtered History view.

The export is JSON and is suitable for later review, reporting, or external analysis.
Exports and project databases can contain credentials, tokens, personal data, and
other captured secrets. Noxen does not redact them automatically; review files before
sharing them.
