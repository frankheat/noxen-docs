---
title: "Hook configuration"
description: Reference for the JSON file that adds Intent hooks to noxen's defaults.
---

A hook configuration is a JSON file listing Java methods for noxen to hook. Select it
in [Home](../home/#hook-config) with **Hook config**. Its hooks are added to the
default ones; they never replace or disable them.

## Syntax

The file is an array of hook definitions:

```json
[
  {
    "clazz": "com.example.MyReceiver",
    "method": "onReceive",
    "args": ["android.content.Context", "android.content.Intent"],
    "minApi": 26
  }
]
```

| Field | Required | Value |
| --- | --- | --- |
| `clazz` | Yes | Fully qualified class name. Inner classes use `$`, as in `android.content.Context$BindServiceFlags` |
| `method` | Yes | Method name |
| `args` | Yes | The exact argument types of the overload, in order |
| `minApi` | No | Lowest Android API level on which to install the hook |

Unknown fields are ignored with a warning in Log. If the file cannot be read, is not
valid JSON, or has an invalid entry, noxen does not connect: Home shows the error, and
Log shows where it is, such as `hook[3].args[1]`.

## Supported methods

A hook must give noxen an Intent to capture:

- a method with an `android.content.Intent` argument. noxen captures the first one;
- a `getIntent()` method returning an Intent;
- `PendingIntent.getActivity`, `getBroadcast` or `getService`.

Other methods are rejected. To record other calls without holding them, use a
[Monitor](../monitor/#custom-profiles) profile.

## Default hooks

| Class | Methods |
| --- | --- |
| `Activity` | `startActivityForResult`, `setResult`, `onActivityResult`, `onNewIntent`, `getIntent` |
| `ContextWrapper` | `startActivity`, `sendBroadcast`, `sendOrderedBroadcast`, `startService`, `startForegroundService`, `bindService` |
| `PendingIntent` | `getActivity`, `getBroadcast`, `getService` |

## Installation report

After connecting, Log reports how many hooks installed:

```text
Hooks: 27 installed, 2 skipped, 1 failed
```

A hook whose `minApi` is above the device's is skipped. A class or overload that does
not exist fails, without affecting the others. If a hook is defined twice, noxen keeps
the first and reports the duplicate.

An installed hook sees only its own overload in the connected process. A component in
another process, an override that does not call the hooked method, or a different
overload, bypasses it. Check important hooks with a known call.

## See also

- [APK analysis](../apk-analysis/), to generate a hook configuration from an APK
