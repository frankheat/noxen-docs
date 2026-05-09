---
title: "Android behavior and limits"
---

noxen can intentionally pause the target app while the researcher decides what
to do with an intercepted intent. That behavior is powerful, but it interacts directly
with Android's timeout model.

## Why ANR can happen

Android reports Application Not Responding when an app blocks a timeout-sensitive path
for too long. Common cases include:

- Main thread blocked too long.
- Broadcast receiver work exceeding the allowed time.
- Service startup or foreground service paths taking too long.
- Input dispatch waiting while the UI thread is blocked.
- Binder calls waiting on a blocked app thread.

If noxen hooks a method running on one of those paths and interception is enabled,
the JavaScript agent can hold that thread until the user forwards or drops the intent.

## What noxen can control

noxen can control:

- Which Java methods are hooked.
- Whether interception is blocking or passthrough.
- Whether matching intents are auto-forwarded by filters.
- Whether broad framework hooks or narrower app-specific hooks are used.
- Whether to enable the optional `system_server` input ANR bypass from the Home tab.

## What noxen cannot make universal

noxen cannot universally disable Android's ANR system from inside the target app
process.

Android framework and system_server enforce timeouts in different places depending on:

- Android version.
- Component type.
- Foreground/background state.
- Broadcast type.
- Service type.
- Target SDK behavior.
- OEM modifications.

Any attempt to bypass timeouts globally is fragile and device-specific.

## Practical strategy for stable sessions

For stable sessions:

1. Start broad only during exploration.
2. Identify noisy or timeout-sensitive methods.
3. Add Intercept filters to auto-forward uninteresting intents.
4. Move to narrower app-specific hooks where possible.
5. Turn interception off when you only need passive capture.
6. Use spawn mode only when startup interception is required.
7. Avoid leaving a main-thread intent blocked while analyzing unrelated data.

## Intercept off is not the same as no hooks

When interception is off, the agent still observes and reports intents, but it does not
wait for a manual decision. This reduces ANR risk significantly, but the hook overhead
still exists.

For the lowest runtime impact, remove unnecessary hooks from the hook configuration.

## Hook selection and timeout risk

Framework-level hooks provide broad visibility, but they can run in sensitive paths.

App-specific hooks can be safer because they may run after Android has already completed
some timeout-sensitive framework work. They also produce less noise.

Prefer app-specific hooks when you know the target code path.

## System ANR bypass

noxen includes an optional Home-tab switch named `Input ANR bypass (experimental)`. When enabled, noxen
opens a second Frida session against `system_server` and injects a small agent focused
on input-dispatch ANRs.

The target-app agent sends `hold_start` before it waits for a manual Forward or Drop
decision, and `hold_end` when the event resumes. The `system_server` agent keeps that
hold state by PID and tries to extend or suppress matching input ANR paths such as
`InputManagerCallback`, `AnrController`, `ActivityRecord`, and
`ActivityManagerService`.

This is intended for rooted research devices only. It is useful for methods such as
`getIntent()`, `onNewIntent()`, `setResult()`, and `startActivity()` when they are
called on the main thread and Android would otherwise report an input-dispatch ANR.

The bypass uses a fixed internal hold window of two minutes. That value limits how
long noxen keeps the `system_server` hold active, but it is not a promise that Android
will show an ANR dialog exactly after two minutes. Some Android or OEM paths may
continue without showing a dialog after a suppressed ANR stage.

It is still not a reliable default strategy.

Major drawbacks:

- It is highly Android-version-specific.
- It can destabilize the whole device, not only the target app.
- A failed hook can break activity, broadcast, or service management globally.
- OEM framework changes can invalidate assumptions.
- It increases the risk of hiding real bugs in the target app.

The switch is disabled by default. noxen reports a summary of the installed
`system_server` hooks and any relevant warnings in the Log tab. Enable `Verbose logs`
when you need hook-by-hook diagnostics, skipped paths, or active hold lifecycle
details. If no supported hook can be installed, noxen warns the user and continues
without relying on the bypass.

## Recommended default

For Android 11 and newer, the portable default is:

- Keep blocking interception focused.
- Use filters aggressively.
- Use passthrough mode for passive observation.
- Generate app-specific hooks.
- Resolve intercepted intents quickly.
