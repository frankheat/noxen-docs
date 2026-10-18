---
title: "Info app"
---

The Info app tab is a snapshot of the **hooked target app**, covering its identity, build
configuration, signing, permissions, and the full roster of its components. It complements
the live event stream with a static picture of the app's attack surface.

The snapshot is requested automatically when you connect to a target and can be re-taken with
**Refresh** (`Ctrl+R` in the footer). **Panel** (`Ctrl+T`) toggles the navigation rail.
It is session-only (not stored in the project) and is cleared on disconnect. Until you connect,
the tab shows a short "connect to a target" message.
Late responses from a disconnected session or a superseded Refresh are ignored;
they cannot restore cleared data or replace the current app's snapshot.
If the app is not ready to provide it after startup, noxen logs a warning; use Refresh
after the app has initialized. The snapshot is not continuously monitored.

## Layout

A collapsible vertical rail on the left switches between three sub-views:

- **Overview**: identity (package, version, UID, PID, process, installer, install dates),
  build and flags (target/min/compile SDK, debuggable, allow backup, cleartext traffic,
  test only, Network Security Config), signing (certificate SHA-256), and a summary with
  component counts, how many components are exported, how the exported ones split by
  [access](#access), and how many requested permissions are `unresolved`.
- **Permissions**: a searchable table of the permissions the app **requests** (with their
  runtime granted state) and the permissions it **defines**, each with its protection level
  and the package that defines it (`Defined by`).
- **Components**: a searchable, filterable table of every activity, service, receiver, and
  provider, with its type, exported flag, [access](#access), enabled state, and required
  permission (and level) in the last column. Selecting a row shows a detail panel with the
  full names; providers additionally list their authority, read and write permissions, path
  permissions, and URI grants. Use `Alt+Up` / `Alt+Down` to enlarge or shrink the detail
  panel; these shortcuts appear only in Components when a snapshot is available.

The component inventory includes components disabled in the manifest or at runtime.
They remain visible with **Enabled: no** rather than disappearing from the list.
The enabled state reflects the component setting at snapshot time; an explicit
runtime override takes precedence over its default. Use **Refresh** after enabling
or disabling a component to update its state. Disabled components remain included
in the summary counts.
This column describes the component's own setting; it is not a combined check of
application enabled state, caller access, or whether Android can currently start it.

## Access

Every exported component gets an **Access** class for review, based on the base
protection level of the permission guarding the component. It is not a reachability
test or a vulnerability verdict:

| Access | Permission guarding the component |
|---|---|
| `open` | none, `normal`, `unresolved`, or `unknown` |
| `weak` | `dangerous` |
| `protected` | `signature`, `signatureOrSystem`, or `internal` |

`unknown` means the reported base protection level is not mapped by noxen. It is
kept in `open` conservatively, not because access was verified. Permission flags,
caller-specific grants, component state, platform restrictions, and checks performed
by application code are not combined into this classification.

Components that are not exported have no access class. This is not a statement
that every form of access is impossible: for example, Android can grant access to
specific URIs on a non-exported provider. See the
[Android provider documentation](https://developer.android.com/guide/topics/manifest/provider-element).

### Providers

A provider has no single permission: reads and writes are guarded separately
(`android:readPermission` / `android:writePermission`; `android:permission` sets both), and
`<path-permission>` entries can grant access to specific paths with a different permission.
noxen classifies each direction on its own. A path permission is an alternative way in, so
the weakest one counts. The provider takes its weakest direction and is `open` if
either reads or writes are. The detail panel shows both, for example
`open (read: protected · write: open)`.

In the table, a provider guarded by one permission for both reads and writes (the
`android:permission` case) shows it like any other component. Otherwise the cell stays short
and summarises the protection level of each direction plus the number of path permissions.
For example, it can report signature-level reads, unrestricted writes, and one path rule.
The permission names are in the detail panel. This is a weakest-direction/path
summary, not the effective access for every URI; no URI is opened or tested.

### Unresolved permissions

A permission is `unresolved` when Android cannot resolve it for the hooked app. There are
two possible reasons, and they cannot be told apart from inside the app:

- **no package defines it**: another app could define it (for example at `normal` level),
  request it, and reach the component;
- **the app that defines it is hidden** from the target by Android 11+ package visibility.

Because the first case can leave a weak permission boundary, noxen counts `unresolved` as `open`
so it is not hidden from review. Check which one applies on the device:

```bash
adb shell pm list permissions -f
```

A permission defined by a package listed there (with its `protectionLevel`) exists; a
permission missing from a complete, successful listing was not found in that device
snapshot. Check the actual device/user and any command errors before drawing a conclusion.

### Defined by

The Permissions table shows the package that defines each permission. In the component
detail, a permission defined by **another** app (not the target itself or the platform) is
marked `defined by <package>`. That identifies a dependency on another package's
permission declaration at snapshot time; it does not predict what will happen
after installing or uninstalling packages. Refresh and verify the device state.

## Finding the attack surface

The Components view is the app's attack surface at rest. Use the **Exposed only** switch to
keep just exported components whose guarding permissions yield Access `open`.
This classification is independent of **Enabled**: a disabled
component can still appear with Access `open` and Enabled `no`, because the app
might enable it later. It is not a claim that the component is currently reachable.
Enabled `yes` alone is not proof of reachability either; other platform conditions
can apply. The type filter and the search box (which also matches permission names, including
a provider's read, write, and path permissions) narrow the list further. Component names
are always shown in full; the detail panel has every permission name in full for
copy-paste.

## Sorting

Click a column header in the Permissions or Components table to sort by that column; click
again to reverse the order. The sorted column shows `↑` or `↓`. The Components table starts
sorted by type; the Permissions table starts in snapshot order (requested, then defined).
Sorting survives search, filters, and Refresh for the session, and the selected component
stays selected.

Columns with a meaning are sorted by that meaning, not alphabetically. Ascending goes from
the most exposed to the most protected:

| Column | Ascending order |
|---|---|
| Access | `open` → `weak` → `protected` → not exported |
| Level | `unresolved` → `unknown` → `normal` → `dangerous` → `signature` → `signatureOrSystem` → `internal` |
| Type | activity → service → receiver → provider |
| Exported, Enabled, Granted | `yes` → `no` |

Other columns sort alphabetically. Rows with the same value are always ordered by name.
Rows with an empty Permission, Granted, or Defined by value stay at the bottom in both
directions. The not-exported Access state is a real value, so it moves with the order.

## Notes

- The inventory is read from the target's `PackageManager`; process and runtime
  information is collected inside that process. It describes manifest components,
  not dynamically registered receivers or a live reachability scan. Failed or
  unavailable lookups must not be interpreted as proof of absence. Permissions defined by other apps are
  subject to package visibility (see [Unresolved permissions](#unresolved-permissions)).
- Intent-filters are not shown here (they are not reliably enumerable at runtime).
