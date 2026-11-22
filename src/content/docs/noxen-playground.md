---
title: "noxen playground"
description: A small Android app with predictable flows for trying noxen.
---

noxen playground is a companion Android app (`dev.noxen.playground`) whose buttons
trigger known Activity, broadcast, service, PendingIntent and provider flows. Use it
to try noxen, or to check that hooks, Intercept and History behave as you expect.

![noxen playground app](/noxen-docs/screenshots/noxen-playground-app.png)

## Install

Build the debug APK from the
[noxen-playground](https://github.com/frankheat/noxen-playground) repository and
install it:

```bash
./gradlew assembleDebug
adb install app/build/outputs/apk/debug/app-debug.apk
```

## Connect

In [Home](../home/), choose **Spawn** with the package `dev.noxen.playground`, or
**Attach (app name)** with `noxen playground` if the app is already running.

## Scenarios

| Area | What the buttons do |
| --- | --- |
| Activities | `startActivity`, `startActivityForResult`, `onActivityResult` and `onNewIntent`, with explicit and implicit, exported and non-exported targets |
| Selectors | A selector that routes the Intent, one ignored because the base Intent names another component, and one that names the same component |
| ClipData | Two `content://` URIs with a read grant, and a mixed item with text, HTML and a nested Intent |
| Broadcasts | `sendBroadcast`, ordered broadcasts, broadcasts from several threads, and dynamic receivers reached by an implicit broadcast, open to any app or limited with `setPackage()` |
| Broadcast permissions | A receiver that requires a permission from the sender, a broadcast that requires one from the receiver, and both |
| Services | `startService`, `bindService` and `startForegroundService` |
| PendingIntent | `getActivity`, `getBroadcast` and `getService` |
| Nested Intents | **Forward nested Intent → Activity1** sends an Intent carrying another in its `next` extra |
| Access classes | Components guarded by a `dangerous`, an undefined and a `signature` permission, and a provider with separate read and write permissions, for [Info app](../info-app/) |
| Open provider | `dev.noxen.playground.open`, exported without permissions, passes input to SQLite and to a file open, for [Monitor](../monitor/) |
| Provider requests | Query, file, write, call, concurrent and Cursor response cases for [Intercept](../intercept/#intercept-provider-requests) |

The permission examples are within one app: they show what noxen captures, not
Android rejecting another app.

## Try a null result

1. With Intercept off, press **startActivityForResult()**. It opens `Activity2`.
2. Press **Back**. `Activity2` sets no result.
3. In History, the `onActivityResult()` capture shows
   `Intent: null (no Intent object)`.

With Intercept on, a null Intent can be forwarded or dropped, but not edited.

## Follow a call into a provider

Connect noxen to the playground, then run:

```bash
adb shell content query --uri content://dev.noxen.playground.open/notes --where "1=1"
```

History shows the incoming call. Enable **SQLite** in Monitor to observe SQL operations that follow.

## Try provider requests

Open **Provider requests** in noxen playground. Calls run on worker threads and
the result or exception appears at the top of the screen.

To test a filename traversal:

1. Select **Import file · unsafe metadata filename**.
2. Forward the query request unchanged.
3. At its response, select **Read Cursor**, then **Edit**.
4. Change the `_display_name` string from `report.txt` to
   `../files/provider-proof.txt` and apply the response.
5. Forward the subsequent stream-open request. The app reports the actual
   destination and whether it is outside the cache.
6. Use **Check traversal proof** to verify the file. Repeat with
   **Import file · checked metadata filename** to observe rejection, and use
   **Reset traversal proof** to remove the demo file.

This demonstrates the consumer's behavior under modified metadata. An externally
exploitable issue also requires a reachable entry point and a provider/URI the
attacker can supply; in-process modification alone does not establish that.

Other cases exercise legacy and Bundle queries, empty/null/error results,
cancellation, insert/update/delete, file modes, concurrent calls, typed Cursor
cells, Blob rejection and a result exceeding the snapshot row limit.

The three **getType** buttons exercise an expected MIME type, an unknown type
and a null response. The playground shows how it interprets each value. In
noxen, select the corresponding call in History and read **Response → Value**
to see what Android returned.

For an incoming call from the emulator's shell UID:

```bash
adb shell content query --uri content://dev.noxen.playground.providers/metadata
```

The signature-protected fixture denies the shell caller and may do so before
any provider event is captured:

```bash
adb shell content query --uri content://dev.noxen.playground.providers.protected/notes
```

## See also

- [Quick start](../quick-start/)
