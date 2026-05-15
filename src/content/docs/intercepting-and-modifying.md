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

## Attack surface labels

For each intercepted event, noxen queries Android's PackageManager to classify the
event in terms of attack-surface relevance. Receiving-component labels are shown
next to **Class**. Intent-resolution labels are shown next to **INTENT**.

For methods where the component **receives** an intent (`getIntent`, `onNewIntent`,
`onActivityResult`, `setResult`, `onReceive`, `onStartCommand`, `onBind`):

| Label | Meaning |
|---|---|
| `Exported` | The component is accessible from other apps — a direct attack surface |
| `Not exported` | The component is only reachable within the app |

For methods where the component **sends** an intent (`startActivity`,
`sendBroadcast`, `startService`, `bindService`, `PendingIntent` variants):

| Label | Meaning |
|---|---|
| `Implicit` | No target component is set — Android resolves the receiver, which could be a third-party app |
| `Explicit` | A specific component is targeted |

If the information cannot be determined (dynamic receivers, inner classes not
registered in the manifest), the label is not shown.

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
