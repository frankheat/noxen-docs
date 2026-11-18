---
title: "Sender"
description: Start activities, send broadcasts and call content providers from an app running on the device.
---

The **Sender** tab sends your own requests from an app already running on the device:
it starts activities and services, sends broadcasts and calls content providers. Each
request is saved in the project, and each time you send it the result is kept as a run.
No extra APK is needed.

## Choose a sender app

Select the device and a **Running sender application**, then choose **Connect**. If
only one device is found, it is selected for you. If the app is not listed, open it on
the device and choose **Refresh**.

Sender attaches to the app without restarting it. If it is the app noxen is already
connected to from Home, Sender shares that connection.

The sender app's identity is the caller Android sees: its UID, permissions and
signature. Choose it on purpose:

- To test what any app can reach, use an ordinary third-party app with no special
  permissions.
- A call from the target app itself is an internal call, not proof of external access.
- System apps, shared UIDs and existing URI grants can reach what other apps cannot.

Each run records the sender's package, PID, UID, Android and target SDK versions,
whether it is a system app, which packages share its UID, and its permissions with
their grant state. It does not record AppOps or temporary URI grants.

## Write a request

Each request is a tab. **+** creates an empty one and lists the operations at the
cursor; choosing one writes what it needs. There is always at least one tab: closing
the last one leaves an empty request.

Right-click a tab to **Rename**, **Duplicate** or **Close** it, or to close several at
once with **Close other tabs**, **Close tabs to the left** or **Close tabs to the
right**. Closing a tab deletes its request; noxen asks first when you close several.

The request is JSON: an `operation` and its arguments.

```json
{
    "operation": "sendBroadcast",
    "intent": {
        "action": "dev.example.PING",
        "extras": {
            "count": {"type": "int", "value": 3},
            "id": {"type": "long", "value": "9007199254740993"}
        }
    }
}
```

- An absent field is not set; `null` and `""` are values.
- A typed value names its type. A `long` is a decimal string, so that all 64 bits
  survive.
- Control characters use JSON escapes, such as `\n` and `\u0000`.

| Action | Shortcut |
| --- | --- |
| List suggestions; accepting one writes its structure | `Ctrl+Space` |
| Fold or unfold the block at the cursor | `Ctrl+O` |
| Unfold everything | `Ctrl+N` |
| Move the divider between request and result | `Alt+Left`, `Alt+Right` |

The request is saved as soon as it is valid; saving never sends it. Until then, the
line under the editor says what is wrong. **Send** runs what is on screen once.

## Copy a capture to Sender

**To Sender** (`Ctrl+R`) creates a request from what is selected, and switches to it.
Nothing is sent, and a held Intent stays held.

| From | Creates |
| --- | --- |
| [History](../history/) | A request with the selected Intent |
| [Monitor](../monitor/) | A request repeating the selected content provider call |
| [Info app](../info-app/) | A request for the selected component |

From History, the operation follows the hook: a sending hook keeps its operation,
`getIntent` and `onNewIntent` become `startActivity`, `onReceive` becomes
`sendBroadcast`, and a PendingIntent request becomes the operation it wraps. For other
hooks, such as `bindService`, you choose the operation.

If some values were not captured in full, noxen lists them and asks first. **Send
without them** creates the request without those values; check it before sending.

From Monitor, To Sender is available only for a query, delete, `call` or file read
whose arguments were all captured. Monitor does not record `ContentValues` or Bundle
extras, so inserts, updates and calls with extras have to be written in Sender.

From Info app, a provider request gets the authority; you add the path. To Sender is
disabled when no request can be made, for example for a provider with several
authorities.

## Supported operations

| Operation | Arguments and result |
| --- | --- |
| `startActivity` | Intent. It must include `FLAG_ACTIVITY_NEW_TASK` (`0x10000000`), because the call uses the application context |
| `sendBroadcast` | Intent and optional receiver permission. Returns when the sending call returns |
| `sendOrderedBroadcast` | Intent and optional receiver permission. Waits for the last receiver and records its result code, data and extras |
| `startService`, `startForegroundService` | Intent. Records the returned component or the exception |
| `stopService` | Intent. Records the returned boolean |
| `query` | URI, projection, selection, selection arguments and sort order. Records the rows |
| `getType` | URI. Records the MIME type |
| `insert`, `update`, `delete` | URI with values or selection. Records the returned URI or row count |
| `call` | URI, method, argument and Bundle extras. Records the returned Bundle |
| `openFileDescriptor` | URI. Opens it read-only and records the content as Base64 |

An Intent supports component, package, action, data, MIME type, flags, categories,
extras, selector and ClipData, including nested Intents. Extras can be strings,
booleans, numbers, chars, URIs, Bundles, Intents and arrays. Custom `Parcelable` and
`Serializable` objects are not supported. `extras` set to `{}` creates an empty
Bundle; omitting it creates none.

Use Android flag names in a JSON list, for example:

```json
"flags": ["FLAG_ACTIVITY_NEW_TASK", "FLAG_GRANT_READ_URI_PERMISSION"]
```

The editor suggests names inside the list. Type part of a name to narrow the
suggestions, or press Ctrl+Space to show them again. Sender saves the names as
written and combines their bits when sending. An unsigned 32-bit decimal mask
also works, including for bits that noxen does not name.

Android's rules still apply. Before a `startActivity`, noxen checks whether the sender
app is in the background, where Android may block the launch, and lets you send anyway
or bring the app to the front first. `startForegroundService` needs a target service
that can start in the foreground.

## Read the result

The panel on the right shows the latest run of the selected request: its state, the
returned value, timings and the sender identity. **‹** and **›** go through earlier
runs, each shown with the request as it was sent.

| State | Meaning |
| --- | --- |
| `preparing` | The run was saved; Android has not started it yet |
| `running` | The call started |
| `returned` | The call returned, or the ordered broadcast finished |
| `error` | The call threw an exception |
| `cancelled` | Android reported a cancellation |
| `unknown` | noxen lost track of the call. It may have completed |

An activity launch shows **Call returned · Activity launch unverified**: Android can
block a launch without an exception. Check the receiving side.

If Intercept or another hook changed the call, the run still shows what was sent. Check
History for edits or drops.

Start and finish times come from the device. Sender runs are not numbered with
History and Monitor's capture order.

## Limits

One request runs at a time per sender. **Cancel** stops a running query or file read
if the provider supports it. A run in progress when noxen closed is marked `unknown`
when the project reopens, and is never sent again.

| Limit | Value |
| --- | --- |
| Request size | 256 KiB of JSON, 8 levels of nesting |
| Query rows | 100 by default, up to 1,000, and up to 256 columns |
| Query and file capture | 256 KiB; files default to 64 KiB |
| Returned Bundles | 100 entries each, 4 levels, 4,096 characters per value, 32,768 characters in all |
| Saved result | 384 KiB |

These limits apply to what noxen records, not to what the provider does. Truncated
values are marked in the result.

## See also

- [MCP](../mcp/#sender), to send requests from an MCP client
- [Commands](../commands/#extra-types), for the value types
