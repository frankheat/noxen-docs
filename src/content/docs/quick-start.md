---
title: "Quick start"
description: Connect to an app, hold an Intent, change it and review the result.
---

This guide takes you through a first session: connect to an app, hold an Intent,
change it, and review the capture. [noxen playground](../noxen-playground/) is a
good first target.

## Before you start

Install noxen and start `frida-server` on the device. See
[Installation](../installation/).

## Connect

1. Run `noxen`.
2. In **Home**, select the device. If it is the only one, it is already selected.
3. Choose **Spawn** to start the app, or an **Attach** mode for a running process.
4. Select the target and choose **Connect**.

noxen opens **Intercept** when the agent is ready. If the connection fails, open
**Log** to see why. See [Home](../home/).

## Hold an Intent

Use the target app. When it sends or receives an Intent through a hooked method,
noxen holds the call and shows the Intent in Intercept.

- **Forward** (`Ctrl+F`) lets the call continue.
- **Drop** (`Ctrl+D`) suppresses the call or its result.

## Change it

Press **✎** to edit the held Intent as JSON. Change a field, such as `action`, and
choose **Apply & Forward** (`Ctrl+F`). **Cancel edit** (`Esc`) discards the change
and keeps the Intent held. See [Intercept](../intercept/).

## Hold fewer Intents

If framework calls keep interrupting you, add an Intercept filter. For example, a
`focus` rule with `method=onReceive` holds only receiver calls; the rest are
forwarded automatically and still recorded in History. See [Filters](../filters/).

## Review the result

Open **History** and select the capture. For an edited Intent, the detail shows what
changed. See [History](../history/).

## See also

- [Projects](../projects/), to name a session and reopen it later
- [Android behavior and limits](../android-behavior-and-limits/), before you hold an
  Intent for long
