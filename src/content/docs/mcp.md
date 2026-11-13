---
title: MCP
description: Connect an MCP client to the project open in noxen.
---

The MCP server gives a client access to the project and Frida session open in
noxen. Changes made through MCP appear in the same interface used by the analyst.
There is no second capture session.

This feature is under development on `feature/mcp`.

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

**Allow control** permits device rescans, connection and interception changes,
and Monitor profile activation. Turning it off rejects new control operations.
Operations already started can finish. **Stop** closes MCP access without disconnecting Frida
or forwarding a held Intent. The analyst retains control in the interface.

## Available operations

| Operation | Purpose |
| --- | --- |
| `get_status` | Connection state, agent readiness, event epochs and recording problems. |
| `list_devices` | Devices from the most recent Home scan. |
| `refresh_devices` | Rescan Frida devices and update Home. |
| `connect`, `disconnect` | Start or stop the shared Frida session. |
| `list_history`, `get_intent` | Search History and read captured or modified Intent details. |
| `list_monitor_events`, `get_monitor_event` | Search recorded Monitor calls and read their details. |
| `get_interception` | Inspect the currently held Intent. |
| `resolve_interception` | Forward or drop an Intent by its decision ID. |
| `set_intercept` | Turn interception on or off. Turning it off forwards the matching hold. |
| `get_app_info` | Read the current Info app snapshot. |
| `get_logs` | Read recent system logs, including hook and connection diagnostics. |
| `get_monitor_profiles` | Read profile definitions and reported hook states. |
| `set_monitor_profile_enabled` | Persist an explicit enabled state and request hook reconfiguration. |

`connect` accepts a device from `list_devices` and either a package to spawn,
a process name or a PID to attach to. It uses the hook configuration selected in
Home. Use `refresh_devices` if the device is missing. When an extra script is
selected, connect from Home instead.

Connecting through MCP keeps the current tab selected.

A connection request can return while setup is still running. Read `get_status`
until the agent is ready, and inspect reported hook states and the Log tab for
partial installation. Enabling a profile means its configuration was accepted;
it does not mean every method was found and hooked.

## Reading events

Search is independent of the visible table's filters and selection. Results are
ordered by descending saved event ID. Each page contains at most 100 summaries;
use the detail operation to retrieve the captured fields. An oversized response
returns an error rather than silently removing data.

For older pages, pass the returned `next_before_id` and `epoch`. Clearing the
corresponding history invalidates its epoch. Reopening noxen also invalidates old
references. Restart the query after either operation. Start from the first page
again to see new arrivals; existing Intent outcomes can change after forwarding.

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

Read `get_interception` before forwarding or dropping an Intent. Pass its
`decision_id` to `resolve_interception`, or as `expected_decision_id` when
turning interception off. Pass null when turning it off with no hold. If the
hold changes before the request reaches the agent, read the state again before
deciding what to do. Finish or cancel any active draft in the TUI first.

MCP does not expose Intent editing, profile or hook
creation, filter changes, extra-script execution, project switching or autonomous
device interaction. `get_interception` returns the capture, not an unsaved editor
draft. Info app returns its existing snapshot rather than refreshing it.
