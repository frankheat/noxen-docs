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

## Provider capture limits

A snapshot must be complete: at most 100 rows, 32 uniquely named columns and
64 KiB of serialized UTF-8 JSON. Supported cells are null, string, signed 64-bit
integer and finite floating-point values; strings are limited to 8,192 UTF-16
code units. Integers use decimal strings. Blob cells, duplicate columns,
unsupported values, read failures and oversized tables prevent replacement.
No partial table is presented as an editable complete response.

Reading can load data or run code in a custom Cursor implementation, even when
noxen restores the original position. A replacement carries the table's rows
and types. Features such as notifications, lazy loading and custom Cursor
behavior require the original Cursor.
Bundles, streams and file descriptors remain opaque; noxen does not read their
contents or replace them. Null Cursors and original exceptions are recorded
without an extra response hold.

Outgoing edits happen before the ContentResolver operation. Incoming edits
happen before the Transport method, which still performs its Android checks.
Caller identity is never edited. Incoming events record Binder's calling UID;
internal calls can have the app's own UID. Android can deny access before the
Transport hook is reached, producing no captured call.

Providers and Intents share one hold slot. Other calls continue while that slot
is occupied. Nested provider calls on the same thread are represented by the
outer hooked operation. Holds can still trigger Android timeouts. Capture uses
a bounded queue; under sustained load, non-held provider events can be lost.
Held calls use a separate control queue so they remain releasable.

The former Content Resolver and Incoming Provider built-in Monitor profiles are
replaced by this capture path. Historical Monitor events remain available.
Custom hooks or extra scripts on the same overload can still conflict and
require reconnecting with the overlap removed.

## Input ANR bypass

**Input ANR bypass (experimental)** in [Home](../home/#input-anr-bypass-experimental)
hooks Android's `system_server` on a rooted device, to postpone the input ANR while
noxen holds an Intent in the target. It covers only input ANRs.

The bypass is off by default and lasts at most two minutes per hold. Android may still
report an ANR, at a different time or without a dialog, and support varies between
Android versions and manufacturers. A failing hook in `system_server` can affect the
whole device. Log reports which hooks installed; **Verbose logs** shows each one.
