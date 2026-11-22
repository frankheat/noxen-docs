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
| Provider requests | Query, file, write, call, concurrent and Cursor response cases for [provider interception](../providers/), including a contained filename traversal demonstration |

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

## See also

- [Quick start](../quick-start/)
