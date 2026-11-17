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

Below the connection bar, each saved request is a tab labelled with its name.
**+** creates an empty request named with the next free number, with the
operations already listed under the cursor. Choosing one also writes what it
needs: an empty `intent`, with `FLAG_ACTIVITY_NEW_TASK` for `startActivity`, or a
`content://` URI to complete for provider operations. An empty request cannot be
sent until it has an operation. Right-click a tab to
**Rename**, **Duplicate** or **Close** it, or to close several tabs at once with
**Close other tabs**, **Close tabs to the left** or **Close tabs to the right**.
Closing a tab deletes its request. When several tabs close, noxen lists them and
asks first. There is always at least one tab: closing the last one, or opening
Sender in a new project, leaves an empty request as **+** creates it. Selecting a tab shows the request on
the left, as JSON you edit in place, and its result on the right. `Alt+Left` and
`Alt+Right` move the divider between them.

The JSON is the request itself: an `operation` and its arguments. A field that is
absent is not set; `null` and `""` are explicit values. A typed value names its
type, for example `"count": {"type": "int", "value": 3}`, and a `long` is written
as a decimal string. Control characters use JSON escapes such as `\n` and `\u0000`.

The editor helps while you type:

- An opening brace closes itself on its own indented line; brackets and quotes
  close themselves too.
- Names that fit at the cursor are suggested as you type, and `Ctrl+Space` lists
  them all. Accepting one writes its structure: `intent` adds the whole Intent
  skeleton, and a type chosen inside `extras` adds an entry with that type. A
  comma missing on the line above is added.
- `Ctrl+O` folds the block that opens on the cursor line, or the one around the
  cursor, into a placeholder such as `{⋯₁}`, and unfolds it again. `Ctrl+N`
  unfolds everything. Folding does not change the request.

Edits are saved on their own a moment after you stop typing, whenever the JSON is
a valid request; saving never sends it. Until then the line under the editor says
why it is not saved yet, for example a missing comma or a duplicate extra key.
Incompatible fields and unsupported values are rejected rather than silently
discarded. **Send** executes the request once, with what is on screen. Text that
is not valid yet is kept while you look at another request, but not after noxen
closes. If the request is changed elsewhere, for example through MCP, the editor
shows that version. Editing a request preserves the snapshots in its earlier runs.

**To Sender** (`Ctrl+R`) in History copies the selected Intent into a new request,
and in Monitor's Events view it copies the selected content provider call. In
Monitor it is available only for a provider call captured in full, which Sender
can repeat as it was made; for any other event it stays disabled. A request
sent from History, Monitor or Info app is named with the next free number, like
one created with **+**. The source tab stays open; the new request is selected in
Sender. Nothing is sent, and
a held Intent is not forwarded. The request is built from the capture, not from the
[JSON view](../intercepting-and-modifying/#reading-a-capture): the view's `hook`
and `notCaptured` fields are not part of it.

From History, the sending operation follows the hook that captured the Intent: a
sending hook keeps its own operation, `getIntent` and `onNewIntent` become
`startActivity`, `onReceive` becomes `sendBroadcast`, and PendingIntent creation
maps to the operation it wraps. For other hooks, such as `bindService` or
`setResult`, you choose the operation. No field is changed: a captured Activity
Intent without `FLAG_ACTIVITY_NEW_TASK` arrives as unsaved text, and is saved once
you add the flag.

If some values were not captured in full, such as an opaque object or a truncated
string, noxen lists them and asks before copying. **Send without them** creates the
request with only what was captured; review it before sending, since the app may
behave differently without those values.

From Monitor, queries, deletes, `call` and file reads can be copied when every
argument was captured in full. ContentValues and Bundle extras are not recorded by
Monitor, so inserts, updates and calls with extras must be created in Sender.

In Info app's Components view, **To Sender** creates a request for the selected
component; for a provider it supplies the authority, not a valid resource path or
query inferred from the manifest. It is disabled when no request can be made, for
example for a provider that declares several authorities. `Ctrl+R` works there
too, as in History and Monitor. MCP clients can also prepare a request from a captured Intent
with `prepare_sender_request`.

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

Each execution is stored independently of its request definition. The result
panel shows the latest run of the selected request: state, returned value, timing
and the sender identity used. **‹** and **›** step through its earlier runs; an
earlier run is shown with the request exactly as it was sent. If the request was
edited after its latest run, the result panel also lists the arguments that were
actually sent. Comparison and the complete record remain available
through [MCP](#mcp-access).

| State | Meaning |
| --- | --- |
| `preparing` | The request snapshot was saved; Android has not reported the start. |
| `running` | The sender agent reported that execution started. |
| `returned` | The sending API or final ordered-broadcast callback returned. |
| `error` | Execution reported an exception. |
| `cancelled` | Android reported cancellation. |
| `unknown` | noxen lost the ability to confirm the result. The operation may have completed. |

`startActivity` can return without an exception when Android blocks a background
launch. The result shows **Call returned · Activity launch unverified** whenever the
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
automatically. If saving a result fails, it remains in memory and the error appears
in the Sender status line; quitting retries the save and asks how to handle results
that still cannot be saved. An unfinished run is
marked `unknown` when the project reopens and is never automatically resent.

One request can run at a time per sender. Disconnecting does not undo a call that
has already reached Android. **Cancel** is available for a running query or file
read, using Android's [cancellation signal](https://developer.android.com/reference/android/content/ContentResolver).
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
