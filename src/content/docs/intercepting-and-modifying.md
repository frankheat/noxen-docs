---
title: "Intercepting and modifying"
---

The Intercept tab is where blocking decisions happen. When a hooked intent reaches
Python and is not hidden by Intercept filters, noxen waits for you to forward, modify,
or drop it.

The UI provides the normal workflow through buttons and edit controls. The command bar
is optional and can be hidden when you do not need keyboard-driven shortcuts.

## Forward or drop

Use **Forward** to continue execution with the current intent. Use **Drop** to return
from the hooked method without delivering the intercepted intent.

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
or edited. A separate Routing section shows the captured classification and the
selector's role when available. Editing the base Action, Data URI or MIME
type does not edit the selector or change ClipData's declared MIME types.
Routing is labelled **Derived from capture**: it describes the intercepted Intent,
not a fresh resolution of the editor draft. Changing Action, Data URI or MIME type
does not re-query PackageManager or predict a new target. The editor never assumes
a selector is active merely because it is present.

After Routing, the editable Base Intent, Categories and Extras sections are grouped together, followed
by separate read-only Selector and ClipData sections when present. Section headings
share one style, and top-level labels and values use aligned columns. Indentation
is reserved for nested objects, not for the selector's own fields.

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

- `[HOOK]`: the hooked `Class` and `Method`.
- `[ROUTING]`: derived metadata, separate from Android object fields. Sending
  captures show `Mode`, `Source` when recorded, `Target` and any `Enforced Perm`.
  The selector's role is shown here as `ACTIVE`, `IGNORED`, or `REDUNDANT` when
  recorded. Resolution is not proof of delivery, and older captures do not acquire
  inferred source or selector-role metadata.
- `[CAPTURED INTENT PAYLOAD]`: the captured `Component` (when non-null),
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
the hooked `Class` for receiving methods, the resolved `Target` for sending methods:

```
Target        : com.example/.Receiver2
                ├─ Exported            : true
                └─ Required Permission : com.example.permission.CUSTOM (normal)
```

- `Exported`: whether the component is reachable from other apps.
- `Required Permission`: the permission a caller must hold to reach it (the component's
  own `android:permission`, falling back to the application-level one), with its
  **protection level** in parentheses (`normal` / `dangerous` / `signature` / …). The
  level is `unresolved` when Android cannot resolve the permission for the hooked app.
  Either no package defines it, or its defining app is hidden by package visibility (see
  [Unresolved permissions](/noxen-docs/info-app/#unresolved-permissions)). The line is
  omitted when the component requires no permission.

Routing `Mode` is `EXPLICIT` for sends that name a component. Implicit sends say who can
receive them: `IMPLICIT (package-scoped)` when the intent is limited to one app with
`setPackage()` (shown on the `Package` row), or `IMPLICIT (any app)` when any installed
app with a matching filter can receive it. For a broadcast carrying sensitive extras,
that is a potential data leak. Events captured before noxen recorded the package show a
plain `IMPLICIT`.

When an Intent has a selector, Android consults it only if the base Intent has no
component. Noxen shows `Source: selector` and a `Mode` of `EXPLICIT`,
`IMPLICIT (package-scoped)`, or `IMPLICIT (any app)`. If the base Intent already names a
component, that component wins and the selector is not a fallback. The selector role is
then `IGNORED (base component takes precedence)`, or `REDUNDANT (same component as
base)` when both directly name the same component. Selector inspection is read-only;
the Intercept editor shows it for context and continues to modify the base payload only.

ClipData inspection is also read-only. Captured items have fixed depth, item-count,
node-count, and text-length limits. Omitted or unreadable values are indicated in the
detail instead of being silently discarded. History search includes captured ClipData
fields, including nested Intents.

For example, two different components remain visible without implying two destinations:

```text
[ROUTING]
  Mode          : EXPLICIT
  Source        : base component
  Selector      : IGNORED (base component takes precedence)
  Target        : com.example/.ActivityA

[CAPTURED INTENT PAYLOAD]
  Component     : com.example/.ActivityA

[SELECTOR]
  Component     : com.example/.ActivityB
```

The `Target` resolves to the addressed component, `… (resolved)` for implicit intents,
`(resolved) N receivers` for implicit broadcasts matching several receivers,
`(unresolved)` when no activity or service matches, or `… (couldn't read: not visible)`
when Android package visibility hides a third-party target. Broadcast targets are
looked up among manifest receivers only: when none matches, the target reads
`(no manifest receiver); dynamic receivers are not visible`, because receivers
registered at runtime with `registerReceiver()`, in this app or in others, may still
receive it. When a broadcast is sent with a `receiverPermission`, that sender-enforced
permission is shown on a separate `Enforced Perm` line.

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
| `Ctrl+L` | Clear the active output panel |
| `Ctrl+B` | Show or hide the active tab command input/output area |
| `Ctrl+F` | Forward the current intent, applying editor changes when edit mode is open |
| `Ctrl+D` | Drop the current intent |
| `Esc` | Cancel editing without forwarding or dropping (edit mode only) |
| `Alt+Up` | Enlarge the active detail/command panel in Intercept, History, or Info app > Components |
| `Alt+Down` | Shrink the active detail/command panel in Intercept, History, or Info app > Components |
| `Left` / `Right` | Move between tabs when the tab bar has focus |

Depending on terminal focus and Textual behavior, arrow tab switching works when the tab
bar has focus rather than while typing in the command input.
