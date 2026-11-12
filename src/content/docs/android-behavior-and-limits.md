---
title: "Android behavior and limits"
---

## Why ANR can happen

A held Intent pauses the hooked thread. Android can report an Application Not Responding (ANR) if that thread delays input dispatch, a broadcast receiver, a service callback, or another timed operation.

A foreground service that misses its deadline to call `startForeground()` can fail startup and terminate the process. The input ANR bypass does not cover this deadline. [Android foreground-service troubleshooting](https://developer.android.com/develop/background-work/services/fgs/troubleshooting)

## Keeping sessions responsive

Resolve held Intents promptly, especially on the main thread. Use [Intercept filters](../filters/) to auto-forward events you do not need to stop. With interception off, noxen still captures events without holding the target thread.

Filters reduce blocking. They do not remove hooks or their overhead. Custom hook files add to the bundled framework hooks. An app-specific hook can still run on a thread subject to an Android deadline.

## System ANR bypass

**Input ANR bypass (experimental)** in Home attaches to Android's `system_server` on a rooted research device. It attempts to postpone matching input-dispatch ANRs for the target while an Intent is held. Other Android deadlines still apply.

The bypass is off by default. Its two-minute window limits how long noxen applies it. Android may report an ANR at a different time or never show a dialog. Support varies with Android and OEM changes, and a failing system hook can affect the whole device. Check **Log** for installation warnings and **Verbose logs** for individual hook results.
