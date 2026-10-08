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

The form stays open while noxen waits for Frida to confirm the operation. It closes
only after a successful forward. If the session or modification request fails, the
entered values remain available so that you can correct or retry them.

If you drop the intent, staged modifications are discarded with that block.

If the target process terminates or the session disconnects, noxen clears the active
Intercept state because the blocked thread and its decision are no longer valid. The
captured event remains available in History.

## What can be changed

| Field | UI action |
|---|---|
| Action | Edit the action value |
| Data URI | Edit the data value |
| Category | Add or remove a category row |
| Flags | Edit a signed Java integer or unsigned 32-bit mask up to `0xFFFFFFFF` |
| Extra | Add, replace, or remove an extra |

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
- `[CAPTURED INTENT PAYLOAD]`: the intent's `Type` (sends only), `Target` (sends),
  `Action`, `Data (URI)`, `Package` (only when the intent has one), `Flags`, and
  categories.
- `[PENDING INTENT]`: decoded PendingIntent flags (only for `PendingIntent` captures).
- `[EXTRAS]`: a static tree of the intent extras. Scalars stay compact, while nested
  `Intent`, `Bundle`, array, and `ArrayList` values expand into readable child rows.
- `[CHANGES]`: a diff of any staged modifications (History detail, modified forwards).

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

`Type` is `EXPLICIT` for sends that name a component. Implicit sends say who can
receive them: `IMPLICIT (package-scoped)` when the intent is limited to one app with
`setPackage()` (shown on the `Package` row), or `IMPLICIT (any app)` when any installed
app with a matching filter can receive it. For a broadcast carrying sensitive extras,
that is a potential data leak. Events captured before noxen recorded the package show a
plain `IMPLICIT`.

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
| `Alt+Up` | Resize the active Intercept or History panel up |
| `Alt+Down` | Resize the active Intercept or History panel down |
| `Left` / `Right` | Move between tabs when the tab bar has focus |

Depending on terminal focus and Textual behavior, arrow tab switching works when the tab
bar has focus rather than while typing in the command input.
