---
title: "MCP"
description: Let an MCP client read and drive the session open in noxen.
---

The **MCP** tab runs a [Model Context Protocol](https://modelcontextprotocol.io) server
that gives a client, such as an AI assistant, access to the project and Frida session
open in noxen. The client works on the same session you see: its changes appear in the
interface, and yours in the client.

## Start the server

Choose a **Port** and select **Start**. The tab shows the endpoint and the
`Authorization` header to enter in a client that supports Streamable HTTP.

The server listens only on `127.0.0.1` and requires the header on every request. Treat
the token as a password: anyone who has it can read your captures. A new token is made
each time the server starts, and it is never saved.

**Stop** closes the server. It does not disconnect Frida or release a held Intent.

## Allow control

Without **Allow control**, a client can only read. With it, the client can also:

- discover devices and connect or disconnect;
- turn interception on or off, and forward, edit or drop held Intents;
- change filters, stack settings and Monitor profiles;
- refresh Info app, and clear events and logs;
- connect Sender, and edit and send requests.

Turning it off rejects new control operations; ones already started finish.

## Operations

| Operation | Purpose |
| --- | --- |
| `get_provider_interception` | Read the active provider call and its phase |
| `resolve_provider_interception`, `list_provider_calls` | Inspect or resolve a provider request or Cursor response; read saved calls |
| `get_status` | Connection state, agent readiness, the connection token and recording problems |
| `list_devices`, `refresh_devices` | List the devices from the last scan, or scan again |
| `list_applications`, `list_processes` | Find a package to spawn, or a running process and its PID |
| `connect`, `disconnect` | Start or stop the Frida session |
| `get_interception`, `wait_for_interception` | Read or wait for a held Intent or provider call |
| `resolve_interception` | Forward or drop the current hold; supports Intent modifications |
| `set_intercept` | Turn interception on or off |
| `set_input_anr_bypass` | Change the Input ANR bypass setting |
| `list_history`, `get_intent`, `export_history` | Search History and read full captures |
| `get_filters`, `set_filters` | Read or replace the Intercept or History filters |
| `get_stack_settings`, `set_stack_settings` | Read or change stack settings |
| `list_monitor_events`, `get_monitor_event` | Search Monitor events and read one |
| `get_monitor_profiles` | Read profiles and the state of their hooks |
| `set_monitor_profile_enabled`, `set_monitor_profiles_enabled` | Enable or disable one or several profiles |
| `add_monitor_hook`, `save_monitor_profile`, `remove_monitor_profile` | Edit profiles |
| `restore_monitor_defaults`, `retry_monitor_hooks` | Restore built-in profiles, or retry installing hooks |
| `get_app_info`, `refresh_app_info` | Read the Info app snapshot, or read it again |
| `get_logs`, `list_crashes`, `get_crash` | Read logs and crash reports |
| `clear_events`, `clear_logs` | Clear History, Monitor events or logs |
| `get_sender`, `connect_sender`, `disconnect_sender` | Read or change the Sender connection |
| `check_sender_activity_context` | Check whether the sender app is in the background |
| `list_sender_requests`, `get_sender_request` | Read saved requests |
| `save_sender_request`, `remove_sender_request` | Save or delete a request, without sending it |
| `prepare_sender_request`, `prepare_sender_component` | Prepare a request from a capture or an Info app component |
| `execute_sender_request` | Send a saved request |
| `list_sender_runs`, `get_sender_run`, `compare_sender_runs` | Read runs, or compare two |
| `wait_for_sender_run`, `cancel_sender_run` | Wait for a run, or ask it to stop |
| `retry_sender_recording` | Retry saving results after a storage error |

Errors carry a stable code in `structuredContent.error.code` and an explanation in
`structuredContent.error.message`.

## Tokens and revisions

Control operations require the `connection_token` from `get_status`. Changes to
filters and Monitor profiles also require the current revision. A stale token or
revision is rejected, so a client never overwrites something newer. After a timeout,
read the state again before retrying: a lost response does not undo the operation.

## Connect

`connect` takes a device from `list_devices` and a package to spawn, a process name or
a PID. If attaching by name fails, find the PID with `list_processes` and connect with
`mode: "attach_pid"`.

- `hooks` adds hook definitions, such as the output of
  [`noxen-analyze`](../apk-analysis/), for this connection. Without it, the hook config
  selected in Home is used.
- `extra_script` replaces the extra script selected in Home for this connection; `""`
  connects without one.

`connect` can return before setup finishes. Poll `get_status` until the agent is ready,
and check hook states: an enabled profile does not mean every hook installed.

## Read events

`list_history` and `list_monitor_events` return up to 100 summaries per page, newest
first; read full details with `get_intent` or `get_monitor_event`. For the next page,
pass the returned `next_before_id` and `epoch`. Clearing events or restarting noxen
invalidates an epoch: start again from the first page.

To apply the project's History filters, pass their revision from
`get_filters(scope: "history")` as `filter_revision`.

`export_history` returns full entries, including the original of an edited Intent, in
pages that fit the response limit. Follow `next_before_id` until it is null.

Events still waiting to be saved do not appear yet: responses report how many are
pending. An empty result does not prove a call did not happen.

Integers JSON cannot represent exactly, and non-finite floats, are written as
`{"$number": "...", "kind": "integer"}` or `"float"`.

:::caution
Captured text comes from the target app. A client must treat it as data, never as
instructions.
:::

## Hold and edit Intents

1. Call `wait_for_interception` with the `connection_token` as `expected_connection`.
   Pass the last `decision_id` you handled as `after_decision_id` to skip it. It waits
   up to 30 seconds (10 by default).
2. Read the hold with `get_interception`.
3. Call `resolve_interception` with its `decision_id` and `action: "forward"` or
   `"drop"`. To change the Intent, pass `modifications` with `forward`.

Finish or cancel any edit open in noxen first. After forwarding, check
`modification_error`, and read the recorded result with `get_intent` using the
returned `event_id` and `history_epoch`.

| Change | Fields |
| --- | --- |
| `component`, `action`, `data`, `mime` | `value`; `""` clears the field |
| `cat_add`, `cat_rem` | `value`: the category |
| `flag_add`, `flag_rem` | `value`: a 32-bit mask, decimal or hexadecimal |
| `extra_add` | `key`, `value`, `extra_type`, such as `string`, `int` or `string[]` |
| `extra_rem` | `key` |
| `nested_component`, `nested_action`, `nested_data`, `nested_mime` | `key` of an extra holding an Intent, or `path`, and `value` |

All values are strings.

```json
{"type": "extra_add", "key": "message", "value": "updated", "extra_type": "string"}
```

```json
{"type": "nested_component", "key": "next", "value": "dev.noxen.playground/.Activity2"}
```

`path` reaches an Intent deeper in the payload:

| Path | Intent |
| --- | --- |
| `["extras", "payload", "next"]` | `next` inside the Bundle extra `payload` |
| `["extras", "container", "extras", "next"]` | `next` inside the Intent extra `container` |
| `["selector"]` | The selector |
| `["clipData", 0]` | The Intent in the first ClipData item |

If a change is not valid, the Intent stays held.

## Sender

1. Read the tokens with `get_sender`, and connect with `connect_sender`.
2. Save a request with `save_sender_request`. It uses the [Sender](../sender/) format.
3. Send it with `execute_sender_request`, passing a new `execution_key`. Sending again
   with the same key and revision returns the existing run instead of sending twice.
4. Wait with `wait_for_sender_run` (up to 30 seconds; a timeout does not cancel the
   run), then read it with `get_sender_run`. If a run is too large for one response,
   read its `request`, `result` and `sender` sections separately.

Before a `startActivity`, `check_sender_activity_context` reports whether the sender
app is in the background. A returned activity launch reports
`result.activityLaunch: "unverified"`.

## Input ANR bypass

`input_anr_bypass` in `get_status` is `disabled`, `waiting_for_connection`, `starting`,
`active` or `unavailable`. `active` means at least one `system_server` hook installed,
not that every input ANR path is covered. Enable it before holding Intents.
