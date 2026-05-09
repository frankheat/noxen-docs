---
title: "noxen playground"
---

`noxen playground` is the companion Android app used to validate noxen against known
runtime flows. It is not required to use noxen on real targets, but it is useful when
you want a controlled app that produces predictable Activity, BroadcastReceiver,
Service, PendingIntent, and attack-surface events.

![noxen playground app](/noxen-docs/screenshots/noxen-playground-app.png)

## App identity

| Field | Value |
|---|---|
| App label | `noxen playground` |
| Package | `com.frankheat.noxen.playground` |
| Repository | `noxen-playground/` |

Open `noxen-playground/` directly in Android Studio. Do not open the workspace parent
directory as an Android project, because the workspace contains multiple independent
git repositories.

## Build

From the playground repository:

```bash
./gradlew assembleDebug
```

Install and launch it from Android Studio, or use the generated debug APK.

## What it covers

The main screen contains buttons for representative Android communication paths:

- `startActivity`, `startActivityForResult`, `onActivityResult`, and `onNewIntent`
- `sendBroadcast` and ordered broadcasts
- dynamically registered receivers
- `startService`, `startForegroundService`, and `bindService`
- `PendingIntent.getActivity`, `getBroadcast`, and `getService`
- concurrent broadcasts from multiple worker threads
- explicit and implicit examples for exported and non-exported Activity behavior

These scenarios are intentionally small. Their purpose is to make it easy to verify
that hooks, History, Intercept, filtering, stack traces, and modification handling work
as expected.

## Running with noxen

Launch noxen and select the playground from the Home tab. Use **Spawn** mode with
package `com.frankheat.noxen.playground`, or **Attach** mode with name
`noxen playground` if the app is already running.
