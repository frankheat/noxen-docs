---
title: "Android behavior and limits"
description: Why holding an Intent can make the app not respond, and how to avoid it.
---

Holding an Intent pauses the thread that reached the hook. Android expects many threads
to respond within a deadline, so a long hold can make it report that the app is not
responding (ANR), or stop the app.

## Deadlines that apply

| Thread is handling | Android can |
| --- | --- |
| Input, such as a tap | Report an input ANR |
| A broadcast receiver | Report a broadcast ANR |
| A service callback | Report a service ANR |
| A foreground service start | Stop the app if `startForeground()` is late. See [foreground service troubleshooting](https://developer.android.com/develop/background-work/services/fgs/troubleshooting) |

## Keep the app responsive

- Resolve held Intents quickly, above all on the main thread.
- Hold only what you need: use [Intercept filters](../filters/) to forward the rest
  automatically.
- Turn interception off to record without holding.

Filters reduce holding, not hooking: every hook still runs. Hooks from a
[hook configuration](../hook-configuration/) add to the defaults.

If the connection is lost while an Intent is held, the app may stay blocked. Restart it.

## Input ANR bypass

**Input ANR bypass (experimental)** in [Home](../home/#input-anr-bypass-experimental)
hooks Android's `system_server` on a rooted device, to postpone the input ANR while
noxen holds an Intent in the target. It covers only input ANRs.

The bypass is off by default and lasts at most two minutes per hold. Android may still
report an ANR, at a different time or without a dialog, and support varies between
Android versions and manufacturers. A failing hook in `system_server` can affect the
whole device. Log reports which hooks installed; **Verbose logs** shows each one.
