---
title: "Quick start"
---

This guide walks you through connecting to an Android app, inspecting an Intent,
and reviewing the capture in History. You can use noxen playground as a test
target. [noxen playground](../noxen-playground/)

## Before you start

Install noxen and start `frida-server` on your Android device or emulator.
[Installation](../installation/)

## Start a live session

Run `noxen` in your terminal. If the command is unavailable, try `python -m noxen`
in the environment where you installed it.

1. On the Home tab, select your device.
2. Choose **Spawn** to start the app, or an **Attach** mode to connect to a running process.
3. Select the target and press **Connect**.

noxen opens Intercept when the agent is ready. If a connection fails or a hook
warning appears, open Log to see which methods registered and which failed.
[Connection troubleshooting](../troubleshooting/#connection-failed)

## Handle the first intercepted intent

Trigger an action in the target app. When an Intent appears in Intercept, choose
**Forward** to continue or **Drop** to suppress the hooked call or result.
[Forward or drop](../intercepting-and-modifying/#forward-or-drop)

## Modify an intent

Open the editor on a held Intent and change a field, such as the action or data
URI. Choose **Apply & Forward** to apply your changes and let the call continue.
Choose **Cancel edit** to discard the draft and keep the Intent held.
[Intercepting and modifying](../intercepting-and-modifying/)

## Reduce noisy traffic

If framework calls keep interrupting your test, add an Intercept filter. For
example, a focus rule for `method=onReceive` lets you stop matching receiver calls
while other captured events proceed. You can still review those events in History.
[Filter rules and examples](../filters/)

## Review captured intents

Open History and select a capture to inspect its payload and outcome. If you
forwarded an edited Intent, the detail shows the changes the agent observed.

## Use a project file

To give a new project a recognizable name, run:

```bash
noxen --new-project session
```

To review the same project later, run:

```bash
noxen --project session.noxen
```

You can browse saved captures without connecting to the target again.
[History and projects](../history-and-projects/)
