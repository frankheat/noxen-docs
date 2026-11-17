---
title: "APK analysis"
description: Generate hooks for an app's receivers and services from its APK with noxen-analyze.
---

`noxen-analyze` scans an APK and writes a [hook configuration](../hook-configuration/)
for the receivers and services the app implements. Load it in Home to capture the
Intents those components receive, in addition to the default hooks.

## Install

`noxen-analyze` needs the analysis extra:

```bash
pip install ".[analyze]"
```

## Syntax

```bash
noxen-analyze <apk> [-o <file>]
```

| Argument | Value |
| --- | --- |
| `<apk>` | The APK to analyze |
| `-o <file>` | Output file. Defaults to `customHooks.json` |

## Example

```bash
noxen-analyze app.apk -o hooks.json
```

Then, in [Home](../home/#hook-config), select `hooks.json` with **Hook config** and
connect.

## What it generates

| Component | Hooks |
| --- | --- |
| Broadcast receivers | `onReceive(Context, Intent)` |
| Services | `onStartCommand(Intent, int, int)`, `onBind(Intent)` |

A class counts as a receiver or service if it inherits from one, following superclasses
within the APK.

## Limits

The analysis is static. It does not cover activities, code loaded at runtime, native
code, or classes whose inheritance obfuscation hides. A generated hook means the class
could receive that call, not that the app calls it or that it is exploitable. Check the
installation report in Log, and exercise the components you want to observe.
