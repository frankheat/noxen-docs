---
title: Sender
description: Send Android requests from a selected application and keep a record of each execution.
---

Sender executes requests using an application already running on the device.
You can send Intents and call content providers while observing the target
through Intercept, History and Monitor. No additional APK is required.

## Choose a sender

Discover the device in Home, then open **Sender** and select the device and a
running application. Open the application on Android first if it is not listed.
Sender attaches to its process without restarting it. The observer and sender
must use the same device. When both use the same process, noxen shares the
existing agent; disconnecting Sender leaves the observer attached.
Monitor excludes the Sender's internal Intent and Bundle preparation. The actual
sending and provider calls remain available to configured hooks.

The selected application supplies the UID, permissions and application context
for each call. An app installed with system privileges, a shared UID, existing
URI grants or a trusted signature may reach endpoints that an ordinary third-party
app cannot. A successful call from the target's own process is an internal test,
not evidence of external access. Android's [component access controls](https://developer.android.com/privacy-and-security/risks/access-control-to-exported-components)
still apply to calls made from another application.

Each run records the sender's package, PID, UID, Android and target SDK versions,
system-app flag, packages sharing its UID, and declared permissions with their
grant state. Permissions are read again before each operation. This snapshot does
not enumerate AppOps, temporary URI grants, signature trust or every policy that
can affect a call.

## Prepare and send a request

**Requests** contains reusable definitions. Create a request, give it a name,
choose an operation and enter its arguments. **Save** stores the definition;
**Send** executes the selected revision once. Editing a definition preserves the
snapshots in its earlier runs.

The request editor uses dedicated fields and expandable sections. Add categories
as list entries, and extras as **Key / Type / Value** rows. A Bundle, Intent or
array expands within its owning entry. Selector and ClipData have their own
sections; ClipData items can contain text, a URI or an Intent. Provider operations
show their own fields, lists and typed values. No JSON is required in the editor.

Inline text is literal: entering `\n` there sends a backslash followed by `n`.
Use a field's **Edit** button to choose an explicit empty string, null or an unset
field where supported. In that dialog, enter text without surrounding quotes;
`\n`, `\r`, `\t` and `\u0000` represent special characters, and `\\` represents
a literal backslash. Saved special characters appear as escaped previews in the
form. Opening and saving a request preserves them.

**Apply** updates the field draft. **Save** validates and stores the request;
neither action sends it. Duplicate extra keys, incompatible fields and unsupported
values are rejected rather than silently discarded. Each operation keeps its own
draft while the request editor is open.

**From capture** prepares a copy of the selected History entry or held Intent.
You choose the sending operation explicitly. Preparing a request neither forwards
the original hold nor sends the copy. In Info app, **Prepare** creates a request
for the selected component; provider preparation supplies its authority, not a
valid resource path or query inferred from the manifest.

A capture is reusable only when its fields are complete and supported. Opaque
objects, omitted data, ambiguous truncated values and object references cannot be
reconstructed reliably. Enter such requests explicitly. Sender constructs new
objects; it does not preserve the identity of captured Java objects.

## Supported operations

| Operation | Arguments and result |
| --- | --- |
| `startActivity` | Intent. Requires an explicit `FLAG_ACTIVITY_NEW_TASK` (`0x10000000`) because the caller uses an application context. |
| `sendBroadcast` | Intent and optional receiver permission. Returns when the sending API returns. |
| `sendOrderedBroadcast` | Intent and optional receiver permission. Waits for the final receiver and records its result code, data and captured extras. |
| `startService`, `startForegroundService` | Intent. Records the returned component or exception. |
| `stopService` | Intent. Records the returned boolean. |
| `query` | Content URI, projection, selection, selection arguments and sort order. Records bounded cursor rows. |
| `getType` | Content URI. Records the MIME type or null. |
| `insert`, `update`, `delete` | Content URI and operation-specific values or selection. Records the returned URI or affected-row count. |
| `call` | Content URI, method, optional argument and Bundle extras. Captures supported fields of the returned Bundle. |
| `openFileDescriptor` | Content URI. Opens read-only and records a bounded Base64 result. |

Intent arguments support component, package, action, data URI, MIME type, flags,
categories, extras, selector and ClipData, including nested Intents. Extras support
strings, booleans, Java numeric primitives, chars, URIs, Bundles, Intents and arrays
of supported primitives, strings and Intents. A `long` uses a decimal string to
preserve all 64 bits. Custom Parcelable and Serializable objects are not supported.
Provider ContentValues accept scalar types except char, plus byte arrays.
Omitted or null `extras` create no Bundle; an explicit `{}` creates an empty Bundle.

Android background-launch rules still apply. A foreground-service request also
requires a compatible target service; noxen does not promote it to the foreground
or bypass its startup requirements. Bound-service/AIDL transactions, arbitrary
method invocation, automatic fuzzing and automatic respawn are outside Sender's
current operation set.

Before sending a `startActivity` request, noxen checks the sender process's
importance on Android 10 and later. If the process appears to be in the
background, you can send anyway or cancel and bring the sender app to the front.
The process state is a hint. Android decides whether the launch is allowed.

## Read the result

**Runs** stores each execution independently of its request definition. Select a
run to inspect its saved arguments, sender identity, result and timing. Comparison
shows differences between two runs; export writes the full saved record as JSON.

| State | Meaning |
| --- | --- |
| `preparing` | The request snapshot was saved; Android has not reported the start. |
| `running` | The sender agent reported that execution started. |
| `returned` | The sending API or final ordered-broadcast callback returned. |
| `error` | Execution reported an exception. |
| `cancelled` | Android reported cancellation. |
| `unknown` | noxen lost the ability to confirm the result. The operation may have completed. |

`startActivity` can return without an exception when Android blocks a background
launch. Runs shows **Call returned · Activity launch unverified** whenever the
call returns normally. Check the receiving side or Android's system log for the
outcome. A recorded crash during a run establishes that the sender crashed
during that run. The cause requires separate evidence.
If Intercept or another hook changes a call, the run still describes the submitted
arguments. Inspect History for edits or a dropped Intent before drawing conclusions
about delivery.

The host records when the run was created and when its result arrived. Start and
finish times come from the sender device; elapsed duration uses Android's monotonic
clock. Host and device clocks may differ. Sender runs have their own IDs and do not
share History/Monitor capture order. Timing and matching payloads help investigate
related events but do not prove causality.

## Persistence and limits

A request snapshot is written to the project before dispatch. Results are saved
automatically. If saving a result fails, it remains in memory with an error and a
retry action; quitting asks how to handle unsaved results. An unfinished run is
marked `unknown` when the project reopens and is never automatically resent.

One request can run at a time per sender. Disconnecting does not undo a call that
has already reached Android. Cancellation is available for queries and file reads
through Android's [cancellation signal](https://developer.android.com/reference/android/content/ContentResolver).
It is cooperative: a provider or blocked file read may not stop immediately.
Requesting cancellation is not the same as receiving a cancelled result.

Requests are limited to 256 KiB of serialized JSON and eight levels of typed
nesting. Queries default to 100 rows and a 256 KiB capture budget, with a maximum of
1,000 rows and 256 columns. The byte budget includes conservative allowance for
encoding and can stop capture before that many bytes of values are returned.
Blobs remain opaque. File reads default to 64 KiB and allow up to 256 KiB.
These are capture limits, not limits on work the provider performs.

Returned Bundles have a shared 32,768-character capture budget, at most 100 entries per
Bundle, four nested levels and 4,096 characters per scalar value. Unsupported
objects remain opaque. A final serialized result above 384 KiB is replaced with
an explicit capture-limit marker. Truncation and unavailable values remain visible
in the saved result.

## MCP access

MCP clients use the same requests, runs and sender connection as the interface.
Control operations require **Allow control**, the current connection token, and
where relevant the sender token and request revision. They do not switch tabs.

Call `get_sender`, connect with `connect_sender`, save a request with
`save_sender_request`, then call `execute_sender_request`. Supply a unique
`execution_key` for each intentional execution. Reusing that key with the same
request revision retrieves its existing run instead of sending again; using it
with a different request revision is rejected. Read the latest tokens after a
connection change.

Use `wait_for_sender_run` to wait up to 30 seconds. A wait timeout does not cancel
or resend the operation. `get_sender_run` returns the complete record; if it
exceeds the MCP response limit, retrieve its `request`, `result` and `sender`
sections separately. The [MCP reference](/noxen-docs/mcp/) lists the remaining
request, comparison and cancellation operations.

Use `check_sender_activity_context` with the current sender token to check for a
background process before executing a `startActivity` request. The resulting run
can include a fresh `activityContext` sample taken before the call. A returned
activity call reports `result.activityLaunch: "unverified"`.
