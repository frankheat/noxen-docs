---
title: "Intercept"
description: Hold an Intent at a hook, then forward it, edit it as JSON, or drop it.
---

The **Intercept** tab shows the Intent held at a hook. While it is held, the hooked
thread waits: you decide whether the call continues, with or without changes.

![Intercept tab](/noxen-docs/screenshots/intercept.png)

noxen holds one Intent at a time. Other hooked calls continue while you decide, and are
recorded in [History](../history/). To record without holding anything, turn
interception off; to hold fewer calls, use [Filters](../filters/).

:::caution
A held thread is subject to Android's deadlines. If you hold it too long, Android can
report that the app is not responding. See
[Android behavior and limits](../android-behavior-and-limits/).
:::

## Forward or drop

| Action | Shortcut | Effect |
| --- | --- | --- |
| **Forward** | `Ctrl+F` | The call continues |
| **Drop** | `Ctrl+D` | The call is suppressed |

What a drop suppresses depends on the hook. For a method that receives an Intent,
noxen skips the method and returns a default value. For `getIntent()`, the getter has
already run, so noxen returns `null` to the caller. Either way, work the app did before
the hook stays done.

Forward means the call continued. Whether Android delivered the Intent, or the method
succeeded, has to be checked on the receiving side.

## Edit as JSON

**✎** opens the held Intent as JSON, in the same format and editor as
[Sender](../sender/):

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

| Action | Shortcut |
| --- | --- |
| Apply your changes and forward | `Ctrl+F` (**Apply & Forward**) |
| Discard your changes, keep the Intent held | `Esc` (**Cancel edit**) |
| List suggestions | `Ctrl+Space` |
| Fold or unfold a block | `Ctrl+O` |
| Unfold everything | `Ctrl+N` |

noxen applies only what you changed. Deleting a field clears it; deleting an extra
removes it. If the JSON is not valid, or a change cannot be made, the line under the
editor says why and the Intent stays held.

### What you can change

Everything the JSON shows, with the types that [Sender](../sender/#supported-operations)
supports:

- `component`, `package`, `action`, `data`, `mimeType`, `flags` and `categories`.
  `null` clears a text field; `""` sets an empty string. For `flags`, use a list of
  Android flag names or an unsigned 32-bit decimal mask. The editor suggests names
  inside the list. Captured masks stay numeric when noxen cannot name every bit
  unambiguously.
- Extras of every type, including Bundles and Intents. A `long` is written as a
  decimal string.
- `selector` and `clipData`, which you can also add or remove, and Intents nested in
  extras, Bundles, the selector or ClipData.

A component is written `package/class`, for example `dev.example/.Activity2`. noxen
checks the syntax, not whether the component exists.

`package` and `selector` cannot both be set: Android refuses it.

### Values not captured in full

Some values cannot be shown: an object noxen cannot read, or a string longer than the
capture limit. They are left out of the JSON, named in the line under the editor, and
stay on the Intent unchanged.

noxen makes each change as narrowly as it can, such as one field or one extra. A value
that contains something not captured in full is never replaced as a whole, because the
hidden part would be lost: only its narrow changes are applied, and the rest is refused
with the reason.

### Where a change takes effect

Changing the component before a send can change where the Intent goes. In a receiving
hook, such as `getIntent()`, Android has already delivered it: your change affects what
the app reads. A selector affects routing only when the base Intent names no component.

After forwarding, the capture in History shows each change as before and after. If it
shows `!`, open the detail: an edit may have failed, or noxen could not confirm it.

## View as JSON

`Ctrl+T` switches between the capture detail and its JSON view. The choice
applies to History too.

The JSON starts with `hook`, the hooked call, such as
`dev.noxen.playground.Activity2.getIntent()`. `operation` appears only when the hook is
itself the sending call. Values that could not be captured in full are listed under
`notCaptured`. These two fields are for reading: remove them before pasting the JSON
into a Sender request. **To Sender** in History does this for you.

Provider captures start with the same `hook` field. When noxen can reconstruct
the request, it shows the operation and its Sender fields. Otherwise, it shows
the captured arguments. The `response` object contains the returned value or
type and any captured Cursor data.

## Read the detail

| Section | Shows |
| --- | --- |
| HOOK | The hooked class and method. For a receiving hook, whether the class is exported and the permission that guards it |
| ROUTING | For a send: explicit or implicit, and the **Target** Android resolved, with its export and permission |
| CAPTURED INTENT PAYLOAD | Component, action, data, MIME type, package, flags and categories |
| SELECTOR, CLIP DATA | The selector Intent and the ClipData items, when present |
| PENDING INTENT | The flags of a PendingIntent request |
| EXTRAS | Each extra with its type and value |
| STACK TRACE | The caller's stack, when stack traces are on |

- **Permissions.** Export and permission describe a component as declared. They do not
  confirm where Android delivered the Intent. See
  [Info app](../info-app/#unresolved-permissions).
- **Broadcast permissions.** **Required Permission** restricts which senders reach a
  component. **Receiver Perm**, on a send, restricts which receivers get the broadcast.
- **Implicit broadcasts.** Android resolves only receivers declared in a manifest, so a
  broadcast to dynamically registered receivers shows **Target** `(unresolved)`.
- **ClipData.** URI grant flags describe what the Intent requested. noxen does not open
  the URI or check access.
- **PendingIntent.** The capture records the request to create it. Android may return
  an existing token, and a later `send()` is not captured here.
- **Null Intent.** An absent Intent can be forwarded or dropped, but not edited.

## Capture limits

noxen reads scalars, Intents, Bundles, arrays and standard lists. Other objects are
shown as opaque; noxen does not call their getters or `toString()`.

| Limit | Value |
| --- | --- |
| Nesting | 8 levels |
| Entries per container | 50 |
| Values per capture | 300 |
| String or key length | 2,048 UTF-16 code units |

A Bundle is also read only up to three read errors. Check for omission and truncation
markers before treating a capture as complete.

## See also

- [Filters](../filters/)
- [History](../history/)
