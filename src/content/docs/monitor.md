---
title: "Monitor"
description: Record selected Java calls in the target without stopping them.
---

The **Monitor** tab records Java calls in the target, such as SQL queries, file opens
and WebView loads, without stopping them. Use it to follow a value from an Intent into
what the app does with it.

Monitor has two views: **Events**, the recorded calls, and **Profiles**, the groups of
hooks that produce them.

## Profiles

Open **Profiles** and enable the ones you need; they all start disabled. Select a
profile to see the exact methods it hooks.

| Profile | Records |
| --- | --- |
| WebView | Page loads, JavaScript evaluation, JavaScript bridges and changes to WebView settings |
| URI Grants | Explicit grant, revoke and persistable permission calls |
| File | Path-based opens, deletes, renames, copies and moves |
| SQLite | SQL and bindings from `execSQL` and standard queries |
| Android Log | Calls to `android.util.Log`: tag, message, priority and throwable type |
| SharedPreferences | Edits, `apply` and `commit` |
| Java Network | Endpoints from `URL.openConnection` and socket connects |
| Crypto | Cipher selection and initialization; keys are shown by type only |
| Process Execution | Commands passed to `Runtime.exec` and `ProcessBuilder.start()` |
| Dynamic Code Loading | DEX paths, buffers and package context requests |
| Intent | URI and extra reads, and changes to component, package or flags |

Each profile records calls, not their effects. Monitor does not read
stream contents or network traffic, and a `commit` or a grant records
the call's result, not what was written to disk.

### Custom profiles

Create a profile and add hooks with the fully qualified class, the method name and the
argument types in order, such as `java.lang.String, boolean`. Use `$init` for a
constructor and leave the arguments empty for a method without any. Choose whether to
capture arguments, the return value and a stack.

Profiles are saved in the project. **Restore missing hooks** adds back default hooks
removed from a built-in profile; **Restore profiles** in the profile menu brings back
deleted built-in profiles.

### Hook states

| State | Meaning |
| --- | --- |
| Active | The hook is installed |
| Not found | The class or overload was not found in the app's class loader. Retry once the code that defines it has loaded |
| Error | The hook could not be installed, or it conflicts with another. Select it and open **Details** |

An installed hook can still miss calls: an override that does not call the hooked
method, or code in another process, bypasses it. Check important hooks with a known
call.

## Events

Each event shows the call when it returns or throws; **Time** is when it started. A
call that never returns produces no event. A method that schedules background work
records only the scheduling.

Values longer than 2,048 UTF-16 code units are truncated, and objects Monitor cannot
read are shown as opaque. Monitor never changes the method's result.

Search covers every saved event, including those outside the current view. **⊟** shows
columns such as **Class** or **Capture order**. `Ctrl+L` clears the events from the
project.

Provider operations are captured in [History](../history/#provider-calls-and-cursor-previews) and [Intercept](../intercept/#intercept-provider-requests).

If calls arrive faster than noxen can save them, some are dropped. A loss counter or
an incomplete-recording notice reports it.

## Correlating History and Monitor events

**Capture order**, such as `Session 4 · #281`, numbers observations within a
connection, in the order the agent saw them, across History and Monitor. A number
marked **session only** can be compared only within the same connection.

For example, find a distinctive value in a History Intent, search for it in Monitor,
and compare the calls around it. If the Intent was held, compare its **Released at**
with the call's **Time**, so that the pause does not count.

A matching value and time are leads, not proof: repeated values, background work and
missed calls can all mislead.

### Following a call into a provider

Connect to the app containing the provider and call it, for example with
`adb shell content`. The call appears in History; SQL or file events in
Monitor can show what followed.

An incoming event shows that the call reached the provider's transport. Android or the transport can reject it. For `call()`, Android checks
only that the caller may access the provider; the provider must check the method
itself. See
[`ContentProvider.call`](https://developer.android.com/reference/android/content/ContentProvider#call(java.lang.String,%20java.lang.String,%20android.os.Bundle)).

## See also

- [History](../history/)
- [noxen playground](../noxen-playground/#follow-a-call-into-a-provider)
