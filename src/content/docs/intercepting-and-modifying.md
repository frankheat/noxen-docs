---
title: "Intercepting and modifying"
---

The Intercept tab is where blocking decisions happen. When a hooked intent reaches
Python, requests a blocking decision, and is not hidden by Intercept filters, noxen
waits for you to forward, modify, or drop it. Events observed with interception off,
or while another event is already held, are recorded in History without becoming
another active Intercept decision.

The UI provides the normal workflow through buttons and edit controls. The command bar
is optional and can be hidden when you do not need keyboard-driven shortcuts.

## Forward or drop

Use **Forward** to let the intercepted operation continue. This is not confirmation
that the method succeeded or that Android delivered the Intent.

For methods accepting an Intent argument, **Drop** skips the intercepted method
and returns a type-appropriate default (`null`, `false`, zero, or no value).
For `getIntent()`, the original getter has already run: Drop returns `null` in place
of its result. Dropping a receiving callback does not undo delivery or earlier
application work, and skipping a call can change or break the app's control flow.
Exceptions raised by the original method are propagated to the app, not converted
into a successful return by noxen.

## Stage modifications

Use the edit form to change fields visually. Modifications do not immediately change
the target intent. They are applied when you forward.

The edit form and bare modification commands operate on one shared draft. A command
entered while the editor is open updates the corresponding field or row immediately.
Commands entered before opening the editor are also reflected when the form opens, so
the form always represents the complete Intent that will be forwarded.

While the form is open, noxen marks the captured intent as being edited. Use
**Apply & Forward** or `Ctrl+F` to validate and apply the changes before forwarding.
Use **Cancel edit** or `Esc` to discard the entire draft, including changes made from
the command bar, and return to the captured intent without forwarding or dropping it.

The form stays open while noxen waits for Frida to resume the blocked thread and
report the resulting Intent. If the resume request fails, the entered values remain
available so that you can correct or retry them. After resume, History records the
Intent observed by the agent, not merely the requested changes. If a modification
fails partway through, or its result cannot be confirmed, noxen shows a warning in
History and the Log. A `!` appears beside the History outcome; the detail explains
the uncertainty. A partially changed Intent may still reach the app.

If you drop the intent, staged modifications are discarded with that block.

If the target process terminates or the session disconnects, noxen clears the active
Intercept state because the blocked thread and its decision are no longer valid. The
captured event remains available in History.

## What can be changed

| Field | UI action |
|---|---|
| Action | Edit the action value |
| Component | Edit `package/class`, or empty the field to remove it |
| Data URI | Edit the data value |
| MIME Type | Edit or clear the content type, such as `image/*` or `application/pdf` |
| Category | Add or remove a category row |
| Flags | Edit a signed Java integer or unsigned 32-bit mask up to `0xFFFFFFFF` |
| Extra | Add, replace, or remove an extra |

Data URI and MIME type are applied atomically. Editing only one preserves the other,
avoiding Android's normal `setData()` / `setType()` behavior where either setter clears
the other field.

The editor modifies the **base Intent**. If a selector or ClipData is present, its
captured tree remains visible in a read-only section; its values are not reconstructed
or edited. The base Component is editable, with available exported and permission
metadata below it. Activity, broadcast, and service events do not show a Routing section.
Editing the base Action, Data URI or MIME
type does not edit the selector or change ClipData's declared MIME types.
Changing Action, Data URI or MIME type does not re-query PackageManager or predict
a new target. The editor never assumes a selector is active merely because it is present.

The editable Base Intent, Categories and Extras sections are grouped together, followed
by separate read-only Selector and ClipData sections when present. Section headings
share one style, and top-level labels and values use aligned columns. Indentation
is reserved for nested objects, not for the selector's own fields.

### Changing Component

Commands are applied to the draft before its resulting values are validated. A
valid `component` command can therefore replace an invalid Component field;
removing or replacing an extra can likewise repair its invalid value or duplicate
key. If another invalid field remains, the command is rejected without changing
the editor's contents. Relative flag commands still require a valid starting mask.

Use `package/class`, either `dev.example/.Activity2` or
`dev.example/dev.example.Activity2`. A class may also belong to a different Java
package, such as `dev.example/other.package.Activity2`. Relative class names are
expanded before applying. The component does not have to appear in Info app's
inventory; syntax validation does not prove that it exists or is accessible.

The command bar accepts `component dev.example/.Activity2` and `component clear`.
Inside the editor, these commands update the same draft as the Component field.
Emptying that field removes the component. Cancel edit discards the change.
Selector, ClipData and the base Intent's package restriction remain unchanged.

Before an outgoing call, modifying Component can change the requested recipient,
subject to Android's normal access checks. In receiving hooks such as `getIntent()`
or `onReceive()`, delivery has already been selected: the modification changes the
field read or reused by the app, not the component currently executing. Class and
its captured permissions therefore continue to describe the original receiving
component. PendingIntent hooks edit the factory's input Intent, not the contents
of an already existing PendingIntent token.

Exported and Required Permission are captured metadata, not live lookups while
typing. A different Component never inherits the old component's permissions:
its details are unavailable unless matching captured metadata exists. History's
modified payload, Component change and JSON export use the agent-observed result,
not a prediction from the requested name. Previous projects need no migration.

Android reference: [Intent.setComponent](https://developer.android.com/reference/android/content/Intent#setComponent(android.content.ComponentName)).

### Extra editing

Extra keys wrap within a shared, bounded-width column; Type, Value and the remove
button stay aligned at the top of each row. Type uses a compact shared column,
leaving more space for Value; its open menu is slightly wider so all type names
remain readable. Existing keys longer than 96 characters
show a shortened preview ending in a theme-muted ellipsis, with a separate
**View full key** button below it. The ellipsis is not part of the key.
Use this button, click a wrapped or truncated key, or focus it and press Enter, to
read its full text, then use **Close** or Escape to return to the editor.
Fully visible single-line keys are plain text, without a keyboard focus stop.
This read-only view never changes the key or the draft. Newly added keys remain
editable inputs with horizontal scrolling.
The view shows the full key retained in the capture, not characters already omitted
by the agent's separate capture limits described below.

Values containing line breaks, tabs, control characters or bidirectional overrides
show a quoted, escaped preview marked **Read-only · escaped value**. This is only
a display representation: opening the editor or forwarding unchanged preserves
the original characters, line endings and Java type. These values cannot be edited
inline, but can still be removed or explicitly replaced. This also applies to
string array/list values containing these characters.

Pasting such text into an editable Value field is rejected with **Value not
inserted**, leaving the field and its selection unchanged. Both terminal paste and
the internal clipboard use this rule; no first-line-only paste or automatic
replacement of line breaks with spaces takes place. Ordinary one-line strings,
including quotes, backslashes and printable Unicode, retain their literal meaning.

The Flags field also shows the requested URI grant bits (`READ`, `WRITE`,
`PERSISTABLE`, `PREFIX`) when relevant. This hint follows the editor draft and command
changes, not just the initial capture. Invalid flag input is marked unavailable
and cannot be applied. These bits belong to the base Intent, not ClipData, and do
not prove that Android granted access. No URI is opened to populate these sections.

Extra keys must be unique. The editor rejects a new extra when its key duplicates an
extra that is still present in the captured Intent. A completely empty new row is
ignored, while a row containing a value without a key is rejected. Validation keeps
the editor open and focuses the first invalid field.

The editor supports the complete set of extra forms exposed by the current Android
`adb shell am` intent parser: scalar strings, null strings, booleans, integers,
longs, floats, doubles, URIs and component names, plus primitive/string arrays and
the corresponding `ArrayList` forms. Arrays and lists are intentionally separate
because the receiving app observes different Java types.

Collection values use commas, for example `1,2,3`. In string arrays and lists,
escape a comma inside one item as `\,`. If no type is provided in the command bar,
noxen stores the extra as a string. See
[Commands](https://frankheat.github.io/noxen-docs/commands/#intent-modifications) for
the complete type and syntax table.

Intent flags are displayed with their raw hexadecimal value and decoded Android flag
names when known. Some bits may show multiple names because Android reuses the same
flag value across activity, broadcast, or internal framework contexts.

## Detail layout

Each intercepted event is shown as a set of plain, aligned sections rather than a
severity badge. The facts are presented and the researcher judges them:

- `[HOOK]`: the hooked `Class` and `Method`. Broadcast sends also show `Receiver Perm`,
  the permission argument restricting recipients, when recorded (`None` when absent).
- `[CAPTURED INTENT PAYLOAD]`: the captured `Component` (including `None` for new Activity, broadcast, and service captures),
  `Action`, `Data (URI)`, `MIME Type`, `Package` (only when the
  intent has one), `Flags`, and categories. `MIME Type` is distinct from
  explicit/implicit routing: it describes the content, such as `image/*` or
  `application/pdf`, and participates in Android's implicit-intent resolution.
- `[SELECTOR]`: the selector Intent, only when one is present. Its captured fields,
  nested selector, and extras remain separate from the base payload. Receiving captures
  show the selector without inferring how the sender routed it.
- `[CLIP DATA]`: when present, its label, declared MIME types, and items. Each item
  shows its raw text, HTML, URI, and nested Intent when available. Nested Intents can
  contain further ClipData. Noxen reads the metadata and values already in the Intent;
  it does not open URIs or query their content providers. When a captured ClipData item
  contains a URI, including through a nested Intent or ClipData, `Grant flags`
  summarizes the outer Intent's URI flags (`READ`, `WRITE`, `PERSISTABLE`, `PREFIX`, or `none`).
  The row is omitted for ClipData containing only text, HTML, or Intents without URIs. Those
  flags also govern URI grants through ClipData nested inside its items; grant flags
  on the nested Intents do not govern that propagation. The summary describes declared
  flags, not whether a grant was applied or a URI was accessed.
  The top-level section shows its item count, label, and MIME types as aligned rows;
  the tree begins with the individual items.
- `[PENDING INTENT]`: decoded PendingIntent flags (only for `PendingIntent` captures).
- `[EXTRAS]`: a static tree of the intent extras. Scalars stay compact, while nested
  `Intent`, `Bundle`, array, and `ArrayList` values expand into readable child rows.
- `[CHANGES]`: a diff of changes observed on the resulting Intent (History detail,
  modified forwards), rather than a list of requested changes.

For example:

```text
[EXTRAS] (3)

  ├─ user_id [int] : 42
  ├─ tags [String[]] (2 items)
  │  ├─ [0] [String] : "admin"
  │  └─ [1] [String] : "mobile"
  └─ next [Intent]
     ├─ Action        : com.example.OPEN
     ├─ Data (URI)    : None
     ├─ MIME Type     : text/plain
     ├─ Component     : com.example/.DetailActivity
     ├─ Flags         : 0x00000000
     └─ Extras [Bundle] (1 item)
        └─ retry [boolean] : true
```

## Structured extra values and safety

Extra inspection is read-only and best effort. Android `Bundle` values can be lazy:
reading an entry may materialize a parcelled object inside the hooked application.
Noxen therefore uses a strict allowlist instead of reflecting over arbitrary objects.

- Scalars, known Android values, `Intent`, `Bundle`, arrays, and exact `ArrayList`
  instances receive a structured representation.
- Nested containers use the same rules recursively, so Intents can contain further
  Intents or Bundles without changing the layout.
- Unknown custom `Parcelable`, `Serializable`, and other Java objects show their class
  name and `opaque object`. Noxen does not call their `toString()`, inspect their fields,
  or invoke custom getters.
- Repeated object identities become reference rows instead of being traversed again.
- One unreadable value is shown as an error row and does not discard the rest of the
  captured Intent.

Traversal has fixed safety limits: 8 nested levels, 50 entries per container, 300
nodes per captured Intent, and 2048 characters per string. The tree reports omitted,
truncated, unreadable, and opaque values explicitly. These limits are intentionally
internal rather than user settings so that rendering work remains predictable.
Top-level extra counts, omissions, and read errors are saved with new captures,
so reopening a project does not remove these warnings. This does not recover
values omitted during capture or metadata not saved by older versions.

The original top-level `type`, `value`, and editable type metadata remain in the
capture format. Existing project files remain readable, and supported top-level
scalars and complete adb-compatible collections can still be edited. Structured or
truncated objects are read-only in the editor, but can still be removed or replaced.
An extra key longer than the capture limit is also truncated and read-only; its remove
control is disabled because noxen deliberately does not retain the discarded part of
the key. Modification commands targeting that displayed key are rejected for the same
reason.

## Component permissions and exposure

For each event noxen queries Android's PackageManager and attaches the exposed
component's facts as a small tree under the component **whose exposure matters**:
the hooked `Class` for receiving methods and each captured `Component` for Activity,
broadcast, and service events:

```
Component     : com.example/.Receiver2
                ├─ Exported            : true
                └─ Required Permission : com.example.permission.CUSTOM (normal)
```

- `Exported`: the component's exported flag. This alone does not prove that another
  app can reach it; permissions and other Android checks still apply.
- `Required Permission`: the permission a caller must hold to reach it (the component's
  own `android:permission`, falling back to the application-level one), with its
  **protection level** in parentheses (`normal` / `dangerous` / `signature` / …). The
  level is `unresolved` when Android cannot resolve the permission for the hooked app.
  Either no package defines it, or its defining app is hidden by package visibility (see
  [Unresolved permissions](/noxen-docs/info-app/#unresolved-permissions)). The line is
  omitted when the component requires no permission.

For Activity, broadcast, and service events, noxen shows the base Intent and selector as separate objects,
without classifying the selector as active or ignored or predicting a destination.
Each explicitly named Component has its own exported and permission metadata when
PackageManager can read it. `Details: unavailable` means matching readable component
metadata is not available; it does not assert why. An absent Component stays `None`, and no implicit target
is queried. Older captures reuse stored target metadata only when its component
matches the actual captured Component. No new resolution is performed on old data.
Selector inspection remains read-only in the editor.

ClipData inspection is also read-only. Captured items have fixed depth, item-count,
node-count, and text-length limits. Omitted or unreadable values are indicated in the
detail instead of being silently discarded. History search includes captured ClipData
fields, including nested Intents.

For example, two different components remain visible without implying two destinations:

```text
[CAPTURED INTENT PAYLOAD]
  Component     : com.example/.ActivityA
                  └─ Exported            : false

[SELECTOR]
  Component     : com.example/.ActivityB
                  └─ Exported            : true
```

### Service requests and callbacks

`startService`, `startForegroundService`, `bindService`, `PendingIntent.getService`,
`onStartCommand`, and `onBind` show the base and immediate selector's named service
components with independent exported and permission metadata. There is no predicted
`Target`, `Mode`, `Source`, or selector role, including for older service captures.
Lookup failures do not hide the captured component names.

The component in a selector does not by itself make a base Intent valid for ordinary
service calls. Noxen does not simulate Android's validation, foreground restrictions,
or permission enforcement. Forwarding means allowing the intercepted call to continue,
not proving that Android accepted it or that a service started.

`getService` captures a PendingIntent creation/retrieval request, not an actual service
start. The requested Intent and PendingIntent flags stay visible, but do not prove the
contents of an existing token or a future invocation. The editor modifies the request's
base payload only; it does not rewrite an existing token's selector.

For `onStartCommand` and `onBind`, manifest metadata remains attached to the hooked
Class separately from any Component in the payload. A sticky restart can call
`onStartCommand` with a null Intent; no component lookup is attempted on that absent
object. No Intent is created to replace it.

### PendingIntent requests

The bundled hooks cover `PendingIntent.getActivity`, `getBroadcast`, and `getService`.
All three show the requested base Intent and selector without inferred routing,
selector roles, or a predicted Target, including when reviewing older captures.
Component metadata describes only the components explicitly named in those objects.

These are creation/retrieval requests, not calls to `PendingIntent.send()` or proof
of a future delivery. Android may return an existing token, and `FLAG_NO_CREATE`
may return `null` instead of creating one. Noxen captures the factory arguments,
not the returned token's stored Intent or the result of its later use. Editing
changes the request's base Intent only. See the
[Android PendingIntent reference](https://developer.android.com/reference/android/app/PendingIntent)
for token reuse and update semantics.

The default hook set does not cover `getActivities` (an Intent array),
`getForegroundService`, or token `send` calls. Do not infer complete PendingIntent
coverage from the presence of the `[PENDING INTENT]` section.

### Null Intent versus empty Intent

New captures explicitly record whether an Intent object was present. An absent object
appears in Intercept and History as:

```text
[CAPTURED INTENT PAYLOAD]
  Intent        : null (no Intent object)
```

Action, URI, MIME type, flags, selector, ClipData, and extras are not displayed as if
they belonged to an empty object. Hook Class, Method, available component metadata,
stack trace, and any PendingIntent flags remain visible.

The Edit button is disabled for a recorded null Intent, and modification commands
return an error without staging changes. The agent also rejects modifications to
that hold. Forward and Drop remain available: forwarding preserves the original
null argument or return value, while dropping retains the existing method-specific
behavior of skipping the call or suppressing the returned Intent.

An existing empty Intent remains editable. The presence indicator is preserved in
project metadata and JSON exports without a database schema change. Old captures
without it retain their previous display and behavior; an empty legacy payload is
not retroactively classified as null. History search includes `null` and
`no Intent object` for explicitly absent Intents.

Unknown custom methods are not assigned Android routing semantics or implicit target
lookups merely because one argument is an Intent.

### Broadcast permissions and captured components

Broadcasts have no predicted `Target`, `Mode`, `Source`, or selector role. Noxen does
not query implicit manifest candidates or enumerate dynamically registered receivers.
A selector's named component is not presented as the complete recipient list.
Flags such as `FLAG_RECEIVER_REGISTERED_ONLY` remain visible as captured data;
component metadata does not assert that the component will receive the broadcast.

Two independent permissions can appear:

- `Required Permission`, below a named Component: its manifest permission, restricting
  which senders can call it. For receiving hooks, metadata under Class describes the
  manifest declaration when found, not proof of how that receiver was registered.
- `Receiver Perm`, under Hook: the `receiverPermission` argument of `sendBroadcast`
  or `sendOrderedBroadcast`, restricting which recipients can receive this send.
  Its name survives lookup failures; an unreadable protection level is `unresolved`.

These permissions can differ. Neither belongs to the Intent itself. A recorded null
argument appears as `Receiver Perm: None`; an empty string is shown explicitly as
`"" (empty permission name)`, not as absence. Old captures without the field do not
invent it. `PendingIntent.getBroadcast` is a creation/retrieval request, not an actual
broadcast send, and has no such argument. Its requested Intent does not prove the
contents of an existing token or its future delivery.

In the editor, Receiver Perm is read-only context above Base Intent. The base Component
is editable; the selector remains read-only. Changing Component does not change the
permission argument or predict delivery. No new registration hooks are installed.

## Passive capture

Use the Intercept toggle to stop blocking target threads while still observing
captured events. This is useful when you want History data without manually resolving
every intent. Toggle it again to return to blocking mode.

## Stack traces

Stack traces help identify which code path produced an intent. Enable them from the UI
and choose a moderate depth in noisy sessions.

Large stack traces make review slower and can add unnecessary output.

## Command bar

The command bar is an optional shortcut layer for users who prefer keyboard-driven
testing. You can hide or show it independently in the Intercept and History tabs with
`Ctrl+B`.

See [Commands](https://frankheat.github.io/noxen-docs/commands/) for the full syntax.

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+C` | Quit |
| `Ctrl+Q` | Quit |
| `Ctrl+L` | Clear History (including stored rows) or Log, only in those tabs |
| `Ctrl+B` | Show or hide the Intercept or History command input/output area |
| `Ctrl+F` | Forward the current intent, applying editor changes when edit mode is open |
| `Ctrl+D` | Drop the current intent |
| `Esc` | Cancel editing without forwarding or dropping (edit mode only) |
| `Ctrl+R` | Refresh the snapshot (Info app only) |
| `Ctrl+T` | Show or hide the navigation panel (Info app only) |
| `Alt+Up` | Enlarge the active detail/command panel in Intercept, History, or Info app > Components |
| `Alt+Down` | Shrink the active detail/command panel in Intercept, History, or Info app > Components |
| `Left` / `Right` | Move between tabs when the tab bar has focus |

Depending on terminal focus and Textual behavior, arrow tab switching works when the tab
bar has focus rather than while typing in the command input.
Forward, Drop, and Cancel shortcuts are shown only when usable for the current
blocked event. Intercept resizing requires its command area to be visible. Terminal
or desktop shortcuts can consume key combinations before noxen receives them.
