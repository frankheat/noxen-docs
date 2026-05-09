---
title: "Quick start"
---

This page shows a short path to a live interception session.

## Before you start

Make sure the host dependencies are installed and `frida-server` is running on the
Android device or emulator. See [Installation](https://frankheat.github.io/noxen-docs/installation/) if this is not ready.

## Start a live session

Launch noxen:

```bash
noxen
```

If the shell cannot find the installed command, run:

```bash
python -m noxen
```

The Home tab opens. Select your device, choose a mode (Spawn, Attach by name, or
Attach by PID), pick the target app from the dropdown, and press **Connect**.

If you want a controlled target while learning or testing changes, use the companion
[noxen playground](https://frankheat.github.io/noxen-docs/noxen-playground/) app.

## Handle the first intercepted intent

When noxen intercepts an intent, the Intercept tab becomes the decision point.

Use **Forward** to let the app continue, or **Drop** to suppress the intercepted
event. The buttons are the normal workflow; the command bar is only an optional
shortcut.

## Modify an intent

Use the edit controls in the Intercept tab to change action, data, categories, flags,
or extras. Changes are staged and take effect only when you forward the current
intent.

## Reduce noisy traffic

Add Intercept filters from the filter UI when framework traffic produces too many
blocks. Filters have their own rule syntax, so they are documented separately with
examples:

[Filters](https://frankheat.github.io/noxen-docs/filters/)

Intercept filters decide whether a captured intent is stopped in the Intercept tab.
History still records captured intents before Intercept filtering.

## Review captured intents

Open the History tab to inspect everything captured by the Python side, including
intents auto-forwarded by filters or observed while interception was off.

## Use a project file

Use a project file when you want the session history and UI state to survive restart.
Pass `--project` or `--new-project` when launching:

```bash
noxen --new-project session
noxen --project session.noxen
```

Continue with [Intercepting and modifying](https://frankheat.github.io/noxen-docs/intercepting-and-modifying/), [Filters](https://frankheat.github.io/noxen-docs/filters/),
or [History and projects](https://frankheat.github.io/noxen-docs/history-and-projects/) depending on what you need next.
