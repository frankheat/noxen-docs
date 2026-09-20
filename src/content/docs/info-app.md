---
title: "Info app"
---

The Info app tab is a snapshot of the **hooked target app** — its identity, build
configuration, signing, permissions, and the full roster of its components. It complements
the live event stream with a static picture of the app's attack surface.

The snapshot is taken automatically when you connect to a target and can be re-taken with
the **Refresh** button. It is session-only (not stored in the project). Until you connect,
the tab shows a short "connect to a target" message.

## Layout

A collapsible vertical rail on the left switches between three sub-views:

- **Overview** — identity (package, version, UID, PID, process, installer, install dates),
  build and flags (target/min/compile SDK, debuggable, allow backup, cleartext traffic,
  test only, Network Security Config), signing (certificate SHA-256), and a summary with
  component counts and how many are exported / exposed.
- **Permissions** — a searchable table of the permissions the app **requests** (with their
  runtime granted state) and the permissions it **defines**, each with its protection level.
- **Components** — a searchable, filterable table of every activity, service, receiver, and
  provider, with its type, exported flag, required permission (and level), and enabled state.
  Selecting a row shows a detail panel; providers additionally list their authority, read and
  write permissions, and `grantUriPermissions`.

## Finding the attack surface

The Components view is the app's attack surface at rest. Use the **Exposed only** switch to
keep just the components that are exported and reachable with little or no barrier (no
permission, or a `normal`-level one). The type filter and the search box narrow the list
further; component and permission names are shown in full for copy-paste.

## Notes

- All data is read from the app's own `PackageManager` inside the process, so Android 11+
  package visibility does not limit it.
- Intent-filters are not shown here (they are not reliably enumerable at runtime).
