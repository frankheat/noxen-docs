---
title: "Monitor"
---

Monitor observes selected Java method calls without stopping them. It has its own
event list: Intent History and Intercept remain separate and unchanged.

## Profiles

The built-in **WebView** profile observes `loadUrl` (both overloads), `postUrl`,
`loadData`, `loadDataWithBaseURL`, `evaluateJavascript`, `addJavascriptInterface`
and `removeJavascriptInterface`.

The built-in **Content Provider** profile observes `ContentResolver.query`,
`call`, `openInputStream` and `openFileDescriptor`, including their public
overloads. Details label the URI or authority, command, and mode where applicable.
Known framework URI types display their string values. Bundles, cursors, streams
and descriptors stay opaque. A returned cursor or descriptor says the call
returned an object. Monitor does not read its contents.

Known forwarding calls between overloads on the same resolver and thread appear
once in this profile, with the outer call's arguments and outcome. A custom
profile can still capture the forwarded overload separately. This profile sees
calls made by the hooked process through `ContentResolver`. Provider
implementations, grants and `ContentProviderClient` are outside its scope.

The built-in **URI Grants** profile observes explicit `grantUriPermission` and
`revokeUriPermission` calls through Android's standard Context implementation,
plus `ContentResolver.takePersistableUriPermission` and
`releasePersistableUriPermission`. Details show the URI, target package when
supplied, the original mode bits and their decoded labels, and the call outcome.
A normal return records that the call completed. Monitor does not check the
resulting permissions or infer grants issued during Intent or ClipData delivery.

The built-in **File** profile observes path-based constructors of
`FileInputStream`, `FileOutputStream` and `RandomAccessFile`. Details show the
path supplied by the app, the opening mode, the append option when applicable,
and the outcome. A standard `File` object contributes its stored path without
filesystem lookup or canonicalization. Known constructor delegation on the same
instance and thread is folded into the outer event. Independent calls to the same
path are recorded separately.

This profile observes opening a path. Read and write operations, constructors
that wrap an existing descriptor, and native file access are outside its scope.
A successful non-append opening can truncate an existing file before the
application writes any bytes.

The built-in **SQLite** profile observes both `SQLiteDatabase.execSQL`
overloads and the five-argument `rawQueryWithFactory` used by Android's
standard query methods. The SQL and bound parameters are displayed separately.
Monitor shows up to 16 bindings, with at most 512 characters per value.
Framework scalar values and nulls are represented directly. Blobs and other
objects stay opaque. Monitor never advances a cursor. A returned cursor records
the outcome of opening the query and does not indicate that any rows were read.
Prepared statements executed separately and alternate SQLite drivers are
outside the profile's scope.

The built-in **Android Log** profile observes the public logging calls
`android.util.Log.v/d/i/w/e/wtf` and `println`, including overloads that
accept a throwable. Details show the level or numeric priority, tag, message
and throwable type when supplied. Monitor captures the arguments to the call
and keeps the original return value. Android still decides what reaches
Logcat. Throwable messages and stacks are handled by the original logging call.
The profile adds no calls to extract them. Native logs and logs from other
processes are outside this profile. These events appear in Monitor. The
separate **Log** tab shows noxen's own system and session messages.

The built-in **SharedPreferences** profile observes edits through Android's
standard preferences editor. It records the `put*` calls, `remove`, `clear`,
`apply`, and `commit`. Details show the key and scalar value when supplied.
String sets stay opaque. The edit calls stage changes. `apply` updates the
in-memory preferences and schedules a disk write, while `commit` reports a
boolean for its synchronous disk write. Monitor records each call independently.
It does not group edits into save operations or verify the disk write from
`apply`. Reads and alternate preferences implementations are outside this profile.

The built-in **Java Network** profile observes both `URL.openConnection`
overloads and the two-argument `Socket.connect` used by standard Java sockets.
URL events report preparation of a connection object. For HTTP(S) they show
the scheme, host, explicit port and path, excluding user info, query and
fragment. Other schemes show the scheme only. Socket events show the requested
host and port for standard `InetSocketAddress` endpoints, the timeout in
milliseconds, and the result or exception. A timeout of zero indicates no
timeout. Endpoint capture performs no additional DNS lookup.

This profile observes these Java API calls. HTTP requests, headers, bodies,
TLS handshakes, native network traffic and connections that bypass these APIs
are outside its scope.

The built-in **Crypto** profile observes `javax.crypto.Cipher.getInstance` and
`init`, including their public overloads. Details show the requested
transformation, provider argument when supplied, operation mode and outcome.
The transformation at initialization comes from the Cipher's own
`getAlgorithm()`. Keys, certificates and parameters contribute only their
types or null values. Monitor does not read their contents or query the
selected provider. Known overload forwarding is folded into the outer event.
Encryption and decryption buffers and execution calls such as `doFinal` are
outside this profile's scope.

Built-in profiles start disabled. Other API families can be added as custom profiles.

**Monitor → Profiles** lists every profile on the left. A check mark in the
**On** column identifies enabled profiles. Select a row to see its hooks on the
right. Use **Enable**, **Disable**, or press **Space** while the list has focus.
Open **Events** to search and inspect captured calls. Select a hook in **Profiles**
and choose **Details** to see its full signature and any installation error. Profiles
can be prepared before connecting. Enabled profiles are requested during session
startup, but installation may wait for the Java runtime and app class loader.
This does not guarantee capture of every early startup call. Attach cannot recover
past calls. Configuration controls are disabled while a connection is starting.

**New profile** creates a named profile. **Add hook** asks for:

- The full Java class name.
- The method name, or `$init` for a constructor.
- Argument types in signature order, separated by commas. Leave empty for a
  no-argument method. For example: `java.lang.String, boolean`. Java array syntax
  such as `int[]` and `java.lang.String[]`, and Frida descriptors, are accepted.
- Whether to capture arguments, return values and a stack of up to 16 frames.

Use **Edit hook**, **Remove hook**, **Rename** and **Delete profile** to maintain
profiles. Changes are saved in the current project, including enabled selections.
When a built-in profile is missing default hooks, **Restore missing hooks**
shows how many it can add and asks for confirmation. It keeps the existing
hooks, their capture options, their order, and the profile's enabled state.
Opening a project does not connect automatically. There is currently no profile
import/export dialog. Limits: 32 profiles and 128 configured hooks.

## Coverage states

- **Active**: the overload was installed, not necessarily called.
- **Not found**: the class or overload could not be resolved in the default app
  class loader. This is not proof it is absent from the APK.
- **Error**: installation failed or a detectable hook conflict exists.
- **Pending**, **Disabled**, **Not connected** describe configuration/session state.

**Retry hooks** retries the enabled configuration, useful after loading another
module. Custom class-loader selection and automatic discovery of subclasses are
not supported. Hooking a base method does not observe overriding implementations
that do not call it. A method in another process is outside this session.

Multiple Monitor profiles share one installed overload and one event listing its
profiles. Capture options are combined: if either profile requests arguments or
a stack, the shared event contains them. Existing detectable Intercept/extra-script
hooks are not overwritten; the row shows a conflict. Hooks installed by other
Frida scripts/runtimes are not always detectable.

Disabling a profile stops new acquisitions for it and keeps existing events.
Already-running calls may still return an event. Disabled wrappers remain passive
until the agent unloads, avoiding unsafe restoration over another hook. A session
can install at most 128 distinct Monitor overloads; reconnect to reset this limit.

## Events and limits

Select an event to inspect its arguments, return or exception type and optional
stack. Strings are limited to 2,048 UTF-16 code units and explicitly marked when
truncated. Primitive values are captured where representable; unsupported objects,
including arrays, maps and application objects, remain opaque. No arbitrary
`toString`, getters, stream reads or recursive object traversal are performed.
Return values and original exceptions are preserved. Exception messages are not
evaluated. A capture failure is shown as unavailable and does not replace the
application's result.

Events are emitted after the call returns or throws. The timestamp records call
entry; completion order can differ under concurrency. An unfinished call or process
termination can therefore leave no event. A normal return does not prove an
asynchronous operation completed. Callbacks and WebView navigation results are
not part of the initial profile.

The live view keeps the latest 2,000 Monitor events in memory while noxen is
open, including across connections. Search covers those events, and the table
shows the latest 200 matches. **Clear events** clears the live view.

The agent queues up to 512 events and sends up to 32 every 100 ms. Events that
exceed the agent or UI queue capacity count as lost. The status counts older
events removed from the 2,000-event collection separately. A disconnected
process can lose its final unflushed batch without a loss report.

## Record in a project

Select **Record to project** in **Monitor → Events** to save newly received events
automatically in the `.noxen` file. Recording is off by default, and the project
remembers your choice. Arguments and return values may contain sensitive data.
The status line indicates when recording is active or paused.

Use the selector next to **Record to project** to open a saved recording.
Search covers the entire recording and displays results in pages of up to 200
events. Choose **Live events** to return to the current feed. A recording can
span several target connections, and details show the target of each event.
Use **Stop recording** to finish the current recording, or **Delete** to
remove a selected recording from the project.

Monitor writes events in batches in the background. On **Quit**, noxen asks the
connected agent for its remaining events and commits the pending batches before
exiting. If a write fails, you can retry or exit with the data already saved.
A crash or forced exit can lose events still in memory. The saved portion of an
interrupted recording is marked **Incomplete**, and known capture losses and
events that could not be saved are shown separately.

Saved Monitor event data is limited to 32 MiB per project. When the limit is
reached, recording pauses and the live view continues. Delete a saved recording
to free capacity, then select **Retry save** in the live view.

Monitoring changes timing and adds overhead, especially with stack capture.
Enable only relevant profiles. Temporal proximity to an Intent is not evidence
that the Intent caused an operation: Monitor does not claim automatic causality
or taint analysis.
