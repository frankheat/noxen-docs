---
title: "Overview"
---

noxen is an Android runtime interception tool for security research. Its main goal is
to help you map how an app's components communicate at runtime and how that
communication can become an attack surface.

It uses Frida to hook selected Java methods such as `getIntent()` and related
intent-handling APIs, allowing you to observe how intent fields are read, propagated,
and used during execution.

## Attack-surface mapping

Android apps often expose behavior through component boundaries: activities, services,
receivers, pending intents, and internal routing code. noxen helps you observe those
boundaries while the app is running.

For example, if an exported component reads attacker-controlled data through APIs such
as `getIntent()`, that execution path becomes a candidate attack surface. The
interesting question is not only that `getIntent()` is used, but what the component
reads from the intent and how those values affect the flow. noxen lets you inspect
that interaction, modify intent fields before forwarding, drop intercepted events, and
compare the result with the original runtime behavior.

Used together with manifest review, static analysis, or manual testing, this gives you
a practical map of component communication:

- which components exchange intents;
- which fields are trusted;
- which extras or URIs influence execution;
- which flows are reachable from exported entry points;
- which runtime interactions are framework noise and which deserve deeper testing.

noxen is intended for controlled testing on apps, devices, and environments you are
authorized to inspect.

## Typical workflow

1. Install the host dependencies and run `frida-server` on the device.
2. Run `noxen`. Select device, mode, and target from the Home tab.
3. Inspect captured communication in the Intercept and History tabs.
4. Use filters to reduce framework noise.
5. Modify, forward, or drop events when active testing is needed.

## Important behavior

- Intercept filters decide what stops for manual action.
- History records captured intents before Intercept filters are applied.
- Buttons, forms, and commands are alternative ways to control the same workflow.
- Turning interception off makes capture passive, but hooks are still installed.

Start with [Installation](https://frankheat.github.io/noxen-docs/installation/), then follow [Quick start](https://frankheat.github.io/noxen-docs/quick-start/).

## Operational limit

noxen can block a hooked application thread while waiting for a decision. Android
can report an Application Not Responding condition if a timeout-sensitive path is held
too long. Read [Android behavior and limits](https://frankheat.github.io/noxen-docs/android-behavior-and-limits/) before
long blocking sessions.
