---
title: "Monitor"
---

Monitor observes selected Java method calls without stopping them. It has its own
event list: Intent History and Intercept remain separate and unchanged.

## Profiles

The initial WebView profile observes `loadUrl` (both overloads), `postUrl`,
`loadData`, `loadDataWithBaseURL`, `evaluateJavascript`, `addJavascriptInterface`
and `removeJavascriptInterface`. It starts disabled. Other API families can be
added as custom profiles; there are no built-in File, SQL or Crypto profiles yet.

Open **Monitor → Profiles**, select a profile and choose **Enable** or **Disable**.
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

Events are session-only and are not stored in the project database. The latest
2,000 are retained across connections while noxen stays open. Search applies to
these retained events; the table shows the latest 200 matches. **Clear events**
clears the displayed collection. Bounded agent/UI queues report dropped events;
the status also counts older retained events discarded. A disconnected process
can lose its final unflushed batch without a loss report.

Monitoring changes timing and adds overhead, especially with stack capture.
Enable only relevant profiles. Temporal proximity to an Intent is not evidence
that the Intent caused an operation: Monitor does not claim automatic causality
or taint analysis.
