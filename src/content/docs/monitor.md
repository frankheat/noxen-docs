---
title: "Monitor"
---

Monitor records selected Java calls without stopping them. If an Intent contains
a value you want to follow, use Monitor to look for related calls in the target
process before or after the capture.

## Profiles

Open **Monitor → Profiles** and enable the profiles you need. Built-in profiles
start disabled. Select a profile to see the exact Java signatures it covers.
If a hook fails to install, select the hook and open **Details**.

| Profile | What to look for |
|---|---|
| WebView | Page loads, JavaScript evaluation and bridges, and changes to WebView settings. Load events show settings previously observed for that WebView. Settings applied before observation remain unknown. |
| Content Provider | `ContentResolver` queries, calls, edits, and opens. Inspect URIs, modes, returned insert URIs, and update or delete counts. Streams and cursors stay opaque. |
| URI Grants | Explicit grant, revoke, and persistable permission calls. A return records the call's outcome. It does not verify the resulting grant or cover grants made during Intent delivery. |
| File | Path-based stream and random-access opens, deletion, rename, copy, and move. A successful non-append open may truncate a file. Stream I/O and native file access are outside this profile. |
| SQLite | SQL and bindings from `execSQL` and standard queries through `rawQueryWithFactory`. Monitor does not read cursor rows or cover alternate drivers. |
| Android Log | Tag, message, priority, and throwable type from calls to `android.util.Log` in the target. Android controls which messages reach Logcat. |
| SharedPreferences | Staged edits, `apply`, and `commit` in the standard editor. `commit` reports a synchronous result. The disk write scheduled by `apply` is not verified. |
| Java Network | Endpoints from `URL.openConnection` and Java socket connects. HTTP(S) URLs exclude credentials, query, and fragment. Traffic, request bodies, and TLS handshakes are outside this profile. |
| Crypto | Cipher selection and initialization. Keys and parameters are represented by type. Cryptographic payloads are outside this profile. |
| Process Execution | Commands and working directories passed to `Runtime.exec` or `ProcessBuilder.start()`. A returned process indicates launch, with exit status and I/O outside this profile. |
| Dynamic Code Loading | DEX paths, buffer sizes, and package context requests. Creating a loader does not establish that code ran. |
| Intent | Selected URI and extra reads and edits to component, package, or flags. Reads through `Bundle` are outside this profile. Monitor excludes noxen's own Intent inspection and edits. |

### Custom profiles

Create a profile and add hooks using the fully qualified Java class, method name, and argument types in signature order. Use `$init` for a constructor and leave arguments empty for a no-argument method. For example, use `java.lang.String, boolean` for a two-argument overload. Select whether to capture arguments, return values, or a stack.

Profile changes are saved in the project. Use **Restore missing hooks** to add default hooks missing from a built-in profile. Use **Restore profiles** in the profile menu to recover deleted built-in profiles.

## Coverage states

| State | Meaning |
|---|---|
| Active | The overload was installed. Verify important hooks with a known call. |
| Not found | The class or overload was unavailable in the default app class loader. Retry after the code loads. |
| Error | Installation failed or noxen detected a hook conflict. See **Details**. |

Pending hooks can wait for the app class loader or, for WebView settings, a call to `getSettings()`. Attach cannot recover earlier calls. Monitor sees the hooked process and overload, so an override that skips the base method or runs in another process can be missed.

Profiles that share an overload produce one event with the combined capture options. noxen reports detectable conflicts with existing Intercept or extra-script hooks. Conflicts with hooks installed by another Frida script can go undetected.

## Events and limits

Monitor records **Time** when a call starts and shows the event when the method
returns or throws. If the method never completes, you may see no event. For
example, when a method schedules background work, the event shows the result
of scheduling it. Check the later work separately.

Arguments and results can be truncated or unavailable. General string capture is limited to 2,048 UTF-16 code units, and some profiles have smaller limits for individual fields, such as SQLite bindings. Unsupported objects remain opaque. Monitor preserves the original method result or exception. Use only relevant profiles to reduce overhead, especially with stack capture.

## Correlating History and Monitor events

Use **Capture order** to compare when History and Monitor observed two events.
In `Session 4 · #281`, the session identifies the connection and `#281` identifies
the observation. This number keeps its place in the sequence even if the device
clock changes or a slow call is saved later. History and Monitor assign their
row IDs independently. If a capture number is marked **session only**, compare
it with observations from the same connection.

For example, find a distinctive `report_id` in a History Intent, then search for it in Monitor and inspect the matching argument. If Intercept held the Intent, compare its **Released at** with the call's **Time** to exclude the pause. Both use device time in UTC for new captures. Older History rows may use host receipt time.

A matching value and time are leads to investigate. Repeated values, asynchronous work, unavailable hooks, and lost captures can leave ambiguity.

## Project history

Monitor saves events in the current project. Search covers all saved events, including rows outside the current view. Use **⊟** to show columns such as **Class** or **Capture order**. Clearing Events deletes the project's Monitor events.

If calls arrive faster than noxen can save them, the capture queue can fill and
drop events. Check the loss counter or an incomplete-recording notice for known
gaps. A target that exits abruptly can lose its last batch before reporting it.
When you quit normally, noxen tries to save buffered events and offers a retry
if saving fails.
