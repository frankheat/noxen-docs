---
title: "Troubleshooting"
description: Fix connection failures, missing captures and an unresponsive app.
---

Find the symptom you see. [Log](../log/) usually says more: enable **Verbose logs** for
every detail.

## Connection failed

Log shows the Frida error. Check that:

- `frida-server` is running on the device;
- its version matches the Frida Python package on your computer;
- for Attach, the process is still running, and you chose the right name or PID.

## A startup call is missing

Attaching cannot capture what the app did before you connected. Connect in **Spawn**
and trigger it again.

## No Intents appear

- The app may not use the hooked methods for this action. Add hooks with a
  [hook configuration](../hook-configuration/) or [APK analysis](../apk-analysis/).
- A hook may have failed to install: Log reports each one.
- An Intercept filter may be forwarding them: check [History](../history/), which
  records them anyway.

## An Intent is in History but was not held

Check whether interception was on, whether an Intercept filter matched it, and whether
another Intent was already held: noxen holds one at a time, and records the rest.

## Too many Intents are held

Add [Intercept filters](../filters/). Hook configurations add hooks; they cannot
remove default ones.

## The app is not responding

Forward or drop the held Intent, or turn interception off. See
[Android behavior and limits](../android-behavior-and-limits/).

If Log reports **Auto-forward failed** and the app stays blocked, turn interception
off to release it. If the connection is lost, restart the app.

## A custom hook does not install

Check the class name, method name and argument types against the overload, and the
device's API level. See [Hook configuration](../hook-configuration/#installation-report).

## Errors about `Java`, `require` or `frida-java-bridge`

Check that the Frida Python package is the version you expect, then reinstall noxen.

## `noxen-analyze` reports that androguard is missing

Install the analysis extra:

```bash
pip install ".[analyze]"
```

## The interface looks wrong

- Use a terminal with true color and Unicode, and make it wider.
- On Windows, use Windows Terminal.
- If a shortcut does nothing, your terminal or desktop may be using it first.
