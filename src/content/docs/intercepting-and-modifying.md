---
title: "Intercepting and modifying"
---

Use Intercept to inspect an Intent before the app continues. You can forward it,
edit its fields, or drop the hooked call or result. To capture events without
holding the app, turn interception off. To hold a narrower set of calls, use
[Intercept filters](../filters/).

noxen holds one Intent at a time. A second call can proceed and appear in History
while you review the first, even if both match your filters.

The hooked thread waits, and Android's deadlines still apply. If you hold a call
too long, Android can report that the app is not responding. noxen tries to release
a held call when you disconnect. If the connection drops abruptly, you may need to
restart the target. [Android behavior and limits](../android-behavior-and-limits/)

## Forward or drop

**Forward** lets the intercepted operation continue. Method success and Android delivery require separate confirmation.

What **Drop** does depends on the hook. If the method takes an Intent argument,
noxen skips the method and returns a default value for its return type. If the
hook captures `getIntent()`, the getter has already run and noxen returns `null`
to the caller. Work the app performed before the hook remains in effect.

## Edit as JSON

**✎** opens the held Intent as JSON, in the same format and editor as
[Sender](../sender/): suggestions with `Ctrl+Space`, automatic brackets and quotes,
`Ctrl+O` to fold a block and `Ctrl+N` to unfold all. **Apply & Forward** (`Ctrl+F`)
applies your changes and lets the call continue. **Cancel edit** (`Esc`) discards
them and leaves the Intent held.

```json
{
    "component": "dev.noxen.playground/dev.noxen.playground.Activity8",
    "action": "test.PING",
    "flags": 268435456,
    "categories": [],
    "extras": {
        "n": {"type": "int", "value": 3}
    }
}
```

noxen compares your JSON with the one it opened and applies **only what you
changed**. A value that could not be captured in full, such as an opaque object or a
truncated string, is not in the JSON: the line under the editor names it, and it
stays on the Intent untouched. Deleting a field you were shown clears it; deleting
an extra removes it. JSON escapes control characters, so a value such as
`a\u0000b` is shown and written back exactly.

If the JSON is not valid, or a change cannot be made, the line under the editor says
why and the Intent stays held. [Modification commands](../commands/#intent-modifications)
typed while the editor is open change the JSON directly; commands staged before
opening it are already in the JSON.

If a release request fails, the editor keeps your JSON so you can retry. If you
see a `!` in History after forwarding, open the detail to check the result.
The agent may have applied only some edits, or noxen may have missed confirmation
of the final payload even though the app continued.

## What can be changed

- **Component**, **action**, **data**, **mimeType**, **flags** and **categories** of
  the Intent. A component uses `package/class`, for example `dev.example/.Activity2`;
  the syntax is checked, not whether the component exists or is accessible. `flags`
  is an unsigned 32-bit integer.
- **Extras** of type `String` (including `null`), `boolean`, `int`, `long`, `float`,
  `double`, `Uri`, and arrays `String[]`, `int[]`, `long[]`, `float[]`, `double[]`.
  A `long` is a decimal string, as in Sender. Other types, such as `short` or
  `char`, can be removed or left as they are, but not set.
- **Inside nested Intents**, in extras, Bundles, the selector or ClipData items:
  only **component**, **action**, **data** and **mimeType**. **History → Changes**
  shows the path and the values before and after forwarding. For a test case, use
  **Forward nested Intent → Activity1** in the Playground and change the component
  of `next` to `dev.noxen.playground/.Activity2`.

`package` cannot be changed, and the selector, ClipData and nested Intents cannot be
added or removed.

Changing the component before a send can change which recipient the Intent
requests. In a receiving hook, Android has already chosen where to deliver the
Intent. Your edit changes the field the receiving app reads or reuses. Editing a
selector changes its fields; Android can still route using the base Intent's
explicit component. On Android builds where the agent cannot copy and replace a
ClipData item, noxen reports a modification failure for that path.

## Reading a capture

`Ctrl+T` shows the held Intent as JSON, in the request format that [Sender](../sender/)
uses; `Ctrl+T` again returns to the layout above. The choice applies to History too.
`hook` comes first and names the hooked call, such as
`dev.noxen.playground.Activity2.getIntent()`. `operation` appears only when the
hooked method is itself that call: a receiving hook such as `getIntent` does not
tell how the Intent was sent. Caller and attack-surface labels are not shown. A
value that could not be rebuilt, such as an opaque object or a truncated string,
is left out and listed under `notCaptured`.

`hook` and `notCaptured` are for reading only. **To Sender** converts the capture
itself into a Sender request without them, so the view is never sent as it is.
If you paste the view into a Sender request by hand, remove both fields first:
Sender rejects them.

- **Component permissions.** Export and required permissions describe a named Component, or the manifest declaration of the hooked Class for receiving methods. The base Intent and selector can each name a Component. Neither field confirms where Android delivered the Intent. [Unresolved permissions](../info-app/#unresolved-permissions)
- **Broadcast permissions.** **Required Permission** describes which senders can reach the component. **Receiver Perm** is a separate argument on a send that restricts which recipients can receive the broadcast. noxen does not enumerate implicit or dynamically registered recipients.
- **ClipData and URI grants.** ClipData can contain text, HTML, URIs, and nested Intents. When URI grant flags are shown, they describe what the outer Intent requested. noxen does not open the URI or verify access.
- **PendingIntent.** The bundled hooks record requests to `getActivity`, `getBroadcast`, and `getService`. They capture factory arguments. Android may return an existing token, and these events do not establish what a later `send()` will deliver.
- **Null Intent.** A recorded absent object can be forwarded or dropped. Editing requires an Intent object. Older captures without presence metadata can be ambiguous.

## Structured extra values and safety

noxen reads supported values such as scalars, Intents, Bundles, arrays, and standard lists. Reading a lazy Bundle entry can materialize an Android object in the hooked process. Unsupported objects are shown as opaque. noxen avoids arbitrary getters and `toString()` calls.

Structured captures can stop after 8 levels of nesting, 50 entries per container, or 300 nodes per traversal. Strings and keys are limited to 2,048 UTF-16 code units. A Bundle scan also stops after three value-read exceptions or if a key cannot be read safely. Check omission, truncation, and read-error markers before treating a capture as complete. A truncated key cannot be removed using its displayed prefix.

If reading the base Intent's flags throws, noxen displays zero without a
separate read-error marker. noxen can also shorten an individual category name
that exceeds the string limit, even when it lists every category.
