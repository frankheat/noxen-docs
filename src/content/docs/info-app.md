---
title: "Info app"
---

The Info app tab is a snapshot of the **hooked target app**, covering its identity, build
configuration, signing, permissions, and the full roster of its components. It complements
the live event stream with a static picture of the app's attack surface.

The snapshot is taken automatically when you connect to a target and can be re-taken with
the **Refresh** button. It is session-only (not stored in the project). Until you connect,
the tab shows a short "connect to a target" message.

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
  permissions, and URI grants.

## Access

Every exported component gets an **Access** class that describes how hard it is for another
app to reach it. It follows from the protection level of the permission guarding the component:

| Access | Permission guarding the component |
|---|---|
| `open` | none, `normal` (granted to any app that asks), or `unresolved` |
| `weak` | `dangerous`; any app can hold it once the user grants it |
| `protected` | `signature`, `signatureOrSystem`, or `internal` |

Components that are not exported have no access class because other apps cannot reach them.

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
The permission names are in the detail panel.

### Unresolved permissions

A permission is `unresolved` when Android cannot resolve it for the hooked app. There are
two possible reasons, and they cannot be told apart from inside the app:

- **no package defines it**: another app could define it (for example at `normal` level),
  request it, and reach the component;
- **the app that defines it is hidden** from the target by Android 11+ package visibility.

Because the first case leaves the component reachable, noxen counts `unresolved` as `open`
so it is not hidden from review. Check which one applies on the device:

```bash
adb shell pm list permissions -f
```

A permission defined by a package listed there (with its `protectionLevel`) exists; a
permission missing from the list is not defined by any installed package.

### Defined by

The Permissions table shows the package that defines each permission. In the component
detail, a permission defined by **another** app (not the target itself or the platform) is
marked `defined by <package>`: the protection then depends on that app, and if it is
uninstalled the permission stops existing.

## Finding the attack surface

The Components view is the app's attack surface at rest. Use the **Exposed only** switch to
keep just the components whose access is `open`: exported and reachable with little or no
barrier. The type filter and the search box (which also matches permission names, including
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
| Level | `unresolved` → `normal` → `dangerous` → `signature` → `signatureOrSystem` → `internal` |
| Type | activity → service → receiver → provider |
| Exported, Enabled, Granted | `yes` → `no` |

Other columns sort alphabetically. Rows with the same value are always ordered by name.
Rows with an empty Permission, Granted, or Defined by value stay at the bottom in both
directions. The not-exported Access state is a real value, so it moves with the order.

## Notes

- All data is read from the app's own `PackageManager` inside the process, so the target's
  own components and permissions are always complete. Permissions defined by other apps are
  subject to package visibility (see [Unresolved permissions](#unresolved-permissions)).
- Intent-filters are not shown here (they are not reliably enumerable at runtime).
