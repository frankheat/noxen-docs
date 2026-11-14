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

## Stage modifications

The editor and [modification commands](../commands/#intent-modifications) share a draft. **Apply & Forward** validates and applies it. **Cancel edit** discards the draft and leaves the Intent held.

If a release request fails, the editor keeps your draft so you can retry. If you
see a `!` in History after forwarding, open the detail to check the result.
The agent may have applied only some edits, or noxen may have missed confirmation
of the final payload even though the app continued.

## What can be changed

You can edit the base Intent's action, component, data URI, MIME type, categories, flags, and extras. Editing just the URI or MIME type preserves the other field. Flags accept a signed Java integer or a 32-bit mask up to `0xFFFFFFFF`.

The selector and ClipData are captured separately and are read-only. Clearing a field explicitly can differ from leaving a captured empty string as it was.

### Changing Component

Use `package/class`, for example `dev.example/.Activity2`. Empty the field or use `component clear` to remove it. Syntax validation does not establish whether the component exists or is accessible.

Changing the component before a send can change which recipient the Intent
requests. In a receiving hook, Android has already chosen where to deliver the
Intent. Your edit changes the field the receiving app reads or reuses.
The editor shows exported status and permissions from the original capture when
available. To inspect a different component, check its declaration separately.

### Extra editing

When an extra directly contains a captured Intent, edit its **Component**,
**Action**, **Data URI** or **MIME Type** below the extra's value. Editing either
the URI or MIME type preserves the other field. **Apply & Forward** records the
observed changes in History. For a test case,
use **Forward nested Intent → Activity1** in the Playground and change the
component of `next` to `dev.noxen.playground/.Activity2`.

Give each extra a unique key. Separate collection items with commas, as in
`1,2,3`. If a string item contains a comma, write it as `\,`, for example
`first,second\,item`. [Supported extra types](../commands/#intent-modifications)

Use **View full key** for shortened keys when available. Values containing line breaks or control characters appear as read-only escaped previews. Forwarding them unchanged preserves their original characters and type. Remove or replace them explicitly if needed. Pasting multi-line or control text into a value field is rejected.

## Reading a capture

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
