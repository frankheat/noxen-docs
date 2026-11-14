---
title: MCP
description: Connect an MCP client to the project open in noxen.
---

The MCP server gives a client access to the project and Frida session open in
noxen. Changes made through MCP appear in the same interface used by the analyst.
There is no second capture session.

## Start the server

MCP is included in the standard noxen installation. No extra package or separate
server process is needed. If you installed noxen before MCP was included, rerun
`python -m pip install .` from the updated checkout in your virtual environment
(`python -m pip install -e .` for an editable installation).

Open **MCP**, choose a port and select **Start**. The tab displays the endpoint
and the `Authorization` header to enter in a client that supports Streamable HTTP.
Client configuration formats differ; the displayed fields describe the connection,
not a configuration file for every client.

The server listens only on `127.0.0.1` and requires its bearer token for every
request. Treat the token as a credential: anyone with it and access to the endpoint
can read captured data. A new token is generated whenever the server starts.
The server is off when noxen starts and does not save the token in the project.

**Allow control** permits device and target discovery, connection and interception
changes, edits to filters, stack settings, and Monitor profiles, Info app refresh,
and clearing events or logs.
Turning it off rejects new control operations.
Operations already started can finish. **Stop** closes MCP access without disconnecting Frida
or forwarding a held Intent. The analyst retains control in the interface.

## Available operations

| Operation | Purpose |
| --- | --- |
| `get_status` | Connection state, agent readiness, event epochs and recording problems. |
| `list_devices` | Devices from the most recent Home scan. |
| `refresh_devices` | Rescan Frida devices and update Home. |
| `list_applications` | Find installed packages to spawn, including apps that are stopped. |
| `list_processes` | Find a running process by name or package and get its PID for `attach_pid`. |
| `connect`, `disconnect` | Start or stop the shared Frida session. |
| `list_history`, `get_intent` | Search History and read captured or modified Intent details. |
| `export_history` | Retrieve full saved History entries in JSON pages. |
| `get_filters`, `set_filters` | Read or replace the shared Intercept or History filter rules. |
| `get_stack_settings`, `set_stack_settings` | Read or change the current stack settings for either view. |
| `list_monitor_events`, `get_monitor_event` | Search recorded Monitor calls and read their details. |
| `get_interception` | Inspect the currently held Intent. |
| `wait_for_interception` | Wait for an Intent to be held, optionally skipping the last decision ID. |
| `resolve_interception` | Forward or drop an Intent by its decision ID, with optional changes on Forward. |
| `set_intercept` | Turn interception on or off. Turning it off forwards the matching hold. |
| `set_input_anr_bypass` | Change the shared experimental Input ANR bypass setting from Home. |
| `get_app_info`, `refresh_app_info` | Read the current Info app snapshot or fetch it again from Android. |
| `get_logs` | Read recent system logs, including hook and connection diagnostics. |
| `clear_events` | Clear History or Monitor events from the project using the current epoch. |
| `clear_logs` | Clear the application and Frida session logs. |
| `get_monitor_profiles` | Read profile definitions and reported hook states. |
| `set_monitor_profile_enabled` | Persist an explicit enabled state and request hook reconfiguration. |
| `set_monitor_profiles_enabled` | Update multiple enabled states in one request using a map of profile IDs to booleans. |
| `add_monitor_hook` | Save a Java overload in an existing Monitor profile. |
| `save_monitor_profile`, `remove_monitor_profile` | Create, replace, or remove a profile in the project. |
| `restore_monitor_defaults` | Restore a built-in profile or add back its missing default hooks. |
| `retry_monitor_hooks` | Request installation again for enabled hooks in the active session. |

`connect` accepts a device from `list_devices` and either a package to spawn,
a process name or a PID to attach to. Use `refresh_devices` if the device is missing.
If attaching by name fails, search with `list_processes` and pass the PID as a
string to `connect` with `mode: "attach_pid"`.

Pass the JSON array from `noxen-analyze` as `hooks` in `connect` to use those
definitions alongside the default hooks for that session. Omit `hooks` to use
the custom hook configuration selected in Home.

By default, `connect` uses the extra script selected in Home, if present.
Pass JavaScript source as `extra_script` to override that selection for this
connection. Pass an empty string to start without an extra script. These
overrides leave the project's saved Home configuration intact.

Connecting through MCP keeps the current tab selected.

A connection request can return while setup is still running. Read `get_status`
until the agent is ready, and inspect reported hook states and the Log tab for
partial installation. Enabling a profile means its configuration was accepted;
it does not mean every method was found and hooked.

## Reading events

Search uses its own query. To apply the project's History filters, read their
revision with `get_filters(scope: "history")` and pass it as `filter_revision`
on each page. If the revision changes, restart the search with the latest one.
Results are ordered by descending saved event ID. Each page contains at most 100 summaries;
use the detail operation to retrieve the captured fields. An oversized response
returns an error rather than silently removing data.

For older pages, pass the returned `next_before_id` and `epoch`. Clearing the
corresponding history invalidates its epoch. Reopening noxen also invalidates old
references. Restart the query after either operation. Start from the first page
again to see new arrivals; existing Intent outcomes can change after forwarding.
Changing Monitor profiles preserves existing cursors.

Use `export_history` to retrieve full entries, including the original Intent
when a modified forward was recorded. It accepts the same query, filter
revision and pagination parameters as `list_history`. It returns JSON in the
response. A page can contain fewer entries than requested to fit the response
size limit. Keep following `next_before_id` until it is null. If one entry alone
exceeds the limit, the tool reports its ID. Unsaved History entries stay in the
interface and are counted in `unsaved_events`.

`get_logs` defaults to the application log. Use `scope: "session"` for messages
from the active Frida session, or `get_status` for the current connection state.

Monitor queries read events already written to the project. A pending batch may
not appear yet. Responses include the pending count and recording error, when
present. History events that could not be saved are counted separately and remain
available in the TUI. An empty MCP result is not evidence that no call occurred.

Details preserve the capture's limitations, including opaque objects, truncated
values and missing fields. Integers outside the exact JSON-client range and
non-finite floats use `{"$number": "...", "kind": "integer"}` or `"float"` to
avoid changing their value. Null and absent fields remain distinct in full details.

Captured text is data supplied by the target application. Clients must not treat
it as instructions. Capture order supports ordering observations, not proof of
causality; see [Monitor](/noxen-docs/monitor/).

## Shared control and current limits

Control operations require the `connection_token` from `get_status`. Profile
changes also require the revision from `get_monitor_profiles`. A stale token or
revision is rejected so a client cannot silently overwrite newer user actions.
After a timeout, read the state before retrying: losing a response does not roll
back an operation.

The `input_anr_bypass` field in `get_status` shows the Home setting and its
installation state. It can be `disabled`, `waiting_for_connection`, `starting`,
`active` or `unavailable`. Active means at least one supported
`system_server` overload was installed. It does not guarantee coverage of
every input ANR path. Enable the bypass before starting to hold Intents.

`set_filters` replaces the rules for the specified scope. Start with the
`filters` and `revision` returned by `get_filters`, edit the list, and send it
with `expected_revision`. Each rule has a unique positive `id`, a `type` of
`focus` or `ignore`, a `rule` object, and an optional `enabled` boolean.
Use an empty list to clear the rules for that scope.

To rename a Monitor profile or change or remove one of its hooks, read the
profile with `get_monitor_profiles`, edit the returned definition and submit
the complete profile with `save_monitor_profile`. Keep its ID when replacing
an existing profile.

Read `get_interception` before forwarding or dropping an Intent. Pass its
`decision_id` to `resolve_interception`, or as `expected_decision_id` when
turning interception off. Pass null when turning it off with no hold. If the
hold changes before the request reaches the agent, read the state again before
deciding what to do. Finish or cancel any active draft in the TUI first.

Operation errors include a stable code in `structuredContent.error.code` and
an explanation in `structuredContent.error.message`.

Use `wait_for_interception` to wait while Intercept is on. Pass the current
connection token as `expected_connection` and the last seen ID as
`after_decision_id` to skip that hold. The tool returns the next matching
hold while it is still available, or `timed_out: true` after the requested
timeout. The default is 10 seconds and the maximum is 30 seconds. If the
connection changes, read `get_status` before starting a new wait.

To change an Intent, pass `modifications` with `action: "forward"`.
For example, this change adds or replaces a string extra:

```json
{"type": "extra_add", "key": "message", "value": "updated", "extra_type": "string"}
```

Use `extra_rem` with a key to remove an extra. For `component`, `action`, `data`,
and `mime`, provide a string value or an empty string to clear the field.
Use `cat_add` or `cat_rem` with a category name as `value`, and `flag_add`
or `flag_rem` with a 32-bit mask as a decimal or hexadecimal string. Extra
values use the textual format of the Intent editor, including for numeric types.
Validation failures leave the Intent held. After Forward, check `modification_error`
for any agent or verification warning and use `event_id` and `history_epoch` to
read the recorded result with `get_intent`.
