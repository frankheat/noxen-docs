---
title: "The interface"
---

noxen is a terminal UI with six tabs. This page describes how to connect to an app
and what each tab does.

## Launching noxen

```bash
noxen
```

Optional flags:

| Flag | Meaning |
|---|---|
| `--project FILE` | Open an existing `.noxen` project and restore its history |
| `--new-project NAME` | Create a new project database with the given name |

## Home tab

The Home tab is where you select a target and connect.

![Home tab](/noxen-docs/screenshots/home.png)

### Device

noxen scans for connected Frida-compatible devices on startup. The first USB device
found is selected automatically when no valid selection is retained. USB and remote
devices are preferred to the local host. Use the refresh button (↺) to rescan,
including after starting an emulator that was not running when noxen opened.
Each rescan starts a fresh discovery context, so an initially unavailable ADB
server does not require restarting noxen. Connections keep their own discovery
context: refreshing the device list does not disconnect an active session.

### Mode

Choose how to attach to the target process:

| Mode | When to use |
|---|---|
| Spawn | Starts the app from scratch; use it when you need to catch startup behavior |
| Attach (app name) | Connects to an already-running process by its Frida-reported name |
| Attach (PID) | Connects to a process by numeric PID |

Spawn is the default.

### Target

The target dropdown lists processes or packages available on the selected device for the
chosen mode. Use the refresh button (↺) to reload it.

### Hook config and Extra script

Both fields accept a file path. Use the **Browse** button to navigate the filesystem
and select a file, or type the path directly. Use **✕** to clear the field.
The selected paths are saved in the current project and restored when that `.noxen`
project is reopened.

- **Hook config**: additional hook definitions (JSON) loaded alongside
  the bundled default hooks. See [Hook configuration](https://frankheat.github.io/noxen-docs/hook-configuration/).
- **Extra script**: an optional JavaScript file executed in the agent's runtime
  before noxen requests installation of its own hooks. See the contract below.
  Messages sent with `send()` are routed to Log. The `[*]`, `[+]`, `[~]`, and `[!]`
  string prefixes retain their usual log levels; unprefixed strings, ordinary
  objects, and other values appear as DEBUG entries when **Verbose logs** is
  enabled. These messages do not create History entries or control a held intent. The `noxenEvent` field
  is reserved for the agent's internal protocol. Extra scripts run with the same
  privileges as the agent; this message separation is not a script sandbox.

### Extra script contract

Use an extra script for target-specific instrumentation, such as a protection
bypass or a behavior change needed for analysis. Only run scripts you trust.

**Reading and execution:** noxen reads the selected file before starting a
connection or replacing the current session. A missing, unreadable, or non-UTF-8 file
blocks the connection and shows an error in Home. Paths support `~`; UTF-8 files
with a BOM are accepted. An empty file is a valid no-op. The connection uses the
content already read, even if the file changes afterward. Projects remember the
path, not a copy of the script; each new connection reads the file again.

The agent is loaded first, then the extra script is evaluated with its file path
as its source name. Syntax errors and uncaught synchronous exceptions stop session
startup; Log includes the technical details. A successful initial execution is
reported separately from file reading. Do not interpret it as proof that a bypass
is effective.

**JavaScript format:** supply a plain JavaScript script or a compatible standalone
bundle. Raw TypeScript, static `import` statements, and unresolved package imports
are not compiled or resolved by noxen. The agent already exposes `Java`, including
on Frida 17; do not import or bundle a second Java bridge unnecessarily.
Place initial setup in the script body, or schedule it explicitly; noxen does not
call user-defined `init` RPC methods.

For example, a script can schedule Java-specific setup as follows:

```javascript
Java.perform(function () {
    // Install target-specific Java hooks here.
    send("[+] Extra Java setup callback reached");
});
```

**Timing:** in Spawn, initial script execution happens while the process is
suspended, before noxen requests its hooks and resumes the process. However,
`Java.perform()` may defer its callback until the app class loader is available.
Timers, promises, and module-load callbacks may also run later. noxen does not wait
for these callbacks or for a returned Promise; waiting before resume could prevent
the app from reaching the state the callback needs. Avoid blocking waits during
initial execution. In Attach, earlier application behavior has already happened
and cannot be undone by loading the script.

**Shared runtime:** `rpc.exports` and existing noxen RPC methods are reserved.
Replacing them during initial execution fails startup. Adding a uniquely named
export is allowed, but noxen does not provide a UI for calling it. Do not modify
the agent's Java bridge or shared class-loader configuration unless you understand
the effects. Hooking the same Java overload as noxen can replace one implementation
with another; noxen does not automatically chain conflicting hooks. The RPC check
is an initial compatibility check, not ongoing enforcement or a security sandbox.

**Later errors and cleanup:** uncaught errors from asynchronous callbacks appear
in Log with their stack trace. They do not automatically disconnect a running
session. A script may have applied some changes before an error. Disconnecting
removes instrumentation but does not guarantee reversal of memory patches,
application state changes, or external side effects; restart the target when a
clean process is needed. A connected state confirms noxen's hook registration,
not that the extra script's asynchronous setup or bypass succeeded.

### Input ANR bypass (experimental)

When enabled, noxen opens a second Frida session against `system_server` to suppress
input-dispatch ANRs while an intent is held. Intended for rooted research devices only.
The internal hold window is fixed at two minutes; it is not exposed as a user setting
because Android and OEM frameworks do not guarantee that an ANR dialog appears exactly
when that window expires.
See [Android behavior and limits](https://frankheat.github.io/noxen-docs/android-behavior-and-limits/).

### Connect and Disconnect

**Connect** starts the Frida session. The Home tab remains visible while the connection
is being established, and noxen switches to Intercept only after the target agent is
ready. If the connection fails, the Home tab shows a persistent error and a notification;
the Log tab keeps the technical details.

If a Spawn attempt fails or is cancelled before the new process is resumed, noxen
tries to terminate that process. If termination fails, it tries to resume it so it
is not left suspended. Attach failures or cancellations do not terminate the
existing target app. Callbacks from an old connection cannot clear a newer session.

**Disconnect** cleans up both the target app session and the `system_server` session if
active. The button is enabled only when a session is live.

## Intercept tab

The active interception view. Each blocked intent appears as a labelled block. Use the
buttons or command input to forward, modify, or drop it.

![Intercept tab](/noxen-docs/screenshots/intercept.png)

See [Intercepting and modifying](https://frankheat.github.io/noxen-docs/intercepting-and-modifying/).

## History tab

Stores every captured intent, including those auto-forwarded by filters. Supports
search, sorting, column selection, and detail view.

![History tab](/noxen-docs/screenshots/history.png)

See [History and projects](https://frankheat.github.io/noxen-docs/history-and-projects/).

## Info app tab

Shows a session-only snapshot of the hooked app: identity, build flags, signing,
permissions, and manifest components. Overview, Permissions, and Components are
separate sub-views, with search, filters, and sorting in the tables.

Use **Refresh** (`Ctrl+R`) to request a new snapshot and **Panel** (`Ctrl+T`) to
toggle the navigation rail. These shortcuts appear only in Info app. The snapshot
is cleared on disconnect and is not restored from a project file.

See [Info app](../info-app/) for access classification and its limitations.

## Log tab

Displays Frida and system messages. Includes:

- Session attachment and detachment events.
- Hook installation results.
- `system_server` session messages when Input ANR bypass is active.

Enable **Verbose logs** to see debug-level messages such as hold lifecycle events
and per-hook installation details.

## Settings tab

Stores startup defaults that apply to every new session:

| Setting | Meaning |
|---|---|
| Intercept on startup | Whether blocking mode starts enabled |
| Stack trace on startup | Whether stack traces are shown by default |
| Stack depth | Number of stack frames shown |

Press **Save** to persist changes. noxen stores these user settings in the standard
per-user config directory for the operating system, not in the project checkout:

- Linux: `$XDG_CONFIG_HOME/noxen/settings.txt`, or `~/.config/noxen/settings.txt`
- macOS: `~/Library/Application Support/noxen/settings.txt`
- Windows: `%APPDATA%\noxen\settings.txt`

Command-bar visibility is also a user preference: `Ctrl+B` saves the Intercept and
History visibility states independently in this settings file. It is not stored
in the project. A hidden command bar can be restored with `Ctrl+B` in its tab.

## Common startup problems

- `frida-server` is not running on the device.
- Host and device Frida versions are incompatible.
- The target process is not running (for attach modes).
- USB connection is not recognized.
