---
title: "Intercepting and modifying"
---

The Intercept tab is where blocking decisions happen. When a hooked intent reaches
Python and is not hidden by Intercept filters, noxen waits for you to forward, modify,
or drop it.

The UI provides the normal workflow through buttons and edit controls. The command bar
is optional and can be hidden when you do not need keyboard-driven shortcuts.

## Forward or drop

Use **Forward** to continue execution with the current intent. Use **Drop** to return
from the hooked method without delivering the intercepted intent.

## Stage modifications

Use the edit form to change fields visually. Modifications do not immediately change
the target intent. They are applied when you forward.

If you drop the intent, staged modifications are discarded with that block.

## What can be changed

| Field | UI action |
|---|---|
| Action | Edit the action value |
| Data URI | Edit the data value |
| Category | Add or remove a category row |
| Flags | Edit the flags value directly |
| Extra | Add, replace, or remove an extra |

Supported extra types are `string`, `int`, `bool`, `float`, `long`, and `double`.
If no type is provided, noxen stores the extra as a string.

Intent flags are displayed with their raw hexadecimal value and decoded Android flag
names when known. Some bits may show multiple names because Android reuses the same
flag value across activity, broadcast, or internal framework contexts.

## Detail layout

Each intercepted event is shown as a set of plain, aligned sections rather than a
severity badge — the facts are presented and the researcher judges them:

- `[HOOK]` — the hooked `Class` and `Method`.
- `[CAPTURED INTENT PAYLOAD]` — the intent's `Type` (sends only), `Target` (sends),
  `Action`, `Data (URI)`, `Flags`, and categories.
- `[PENDING INTENT]` — decoded PendingIntent flags (only for `PendingIntent` captures).
- `[EXTRAS]` — a `KEY / TYPE / VALUE` table of the intent extras.
- `[CHANGES]` — a diff of any staged modifications (History detail, modified forwards).

## Component permissions and exposure

For each event noxen queries Android's PackageManager and attaches the exposed
component's facts as a small tree under the component **whose exposure matters** —
the hooked `Class` for receiving methods, the resolved `Target` for sending methods:

```
Target        : com.example/.Receiver2
                ├─ Exported            : true
                └─ Required Permission : com.example.permission.CUSTOM (normal)
```

- `Exported` — whether the component is reachable from other apps.
- `Required Permission` — the permission a caller must hold to reach it (the component's
  own `android:permission`, falling back to the application-level one), with its
  **protection level** in parentheses (`normal` / `dangerous` / `signature` / …). The
  line is omitted when the component requires no permission.

`Type` is `EXPLICIT` or `IMPLICIT` for sends. The `Target` resolves to the addressed
component, `… (resolved)` for implicit intents, `(resolved) N receivers` for implicit
broadcasts matching several receivers, `(unresolved)` when nothing matches, or
`… (couldn't read — not visible)` when Android package visibility hides a third-party
target. When a broadcast is sent with a `receiverPermission`, that sender-enforced
permission is shown on a separate `Enforced Perm` line.

## Passive capture

Use the Intercept toggle to stop blocking target threads while still observing
captured events. This is useful when you want History data without manually resolving
every intent. Toggle it again to return to blocking mode.

## Stack traces

Stack traces help identify which code path produced an intent. Enable them from the UI
and choose a moderate depth in noisy sessions.

Large stack traces make review slower and can add unnecessary output.

## Command bar

The command bar is an optional shortcut layer for users who prefer keyboard-driven
testing. You can hide or show it independently in the Intercept and History tabs with
`Ctrl+B`.

See [Commands](https://frankheat.github.io/noxen-docs/commands/) for the full syntax.

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+C` | Quit |
| `Ctrl+Q` | Quit |
| `Ctrl+L` | Clear the active output panel |
| `Ctrl+B` | Show or hide the active tab command input/output area |
| `Alt+Up` | Resize the active Intercept or History panel up |
| `Alt+Down` | Resize the active Intercept or History panel down |
| `Left` / `Right` | Move between tabs when the tab bar has focus |

Depending on terminal focus and Textual behavior, arrow tab switching works when the tab
bar has focus rather than while typing in the command input.
