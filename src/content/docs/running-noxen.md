---
title: "The interface"
---

Use Home to connect to an Android process. Once connected, choose a tab based
on whether you want to inspect a held Intent, review captures, or check what
the agent reports.

## Home tab

![Home tab](/noxen-docs/screenshots/home.png)

Select a device, a connection mode, and a target, then choose **Connect**. Refresh the device list after starting an emulator, or refresh the target list if the app or process you need is missing.

| Mode | When to use it |
|---|---|
| Spawn | Start the app and observe startup behavior |
| Attach (app name) | Connect to a running process by its Frida-reported name |
| Attach (PID) | Connect to a specific running process by PID |

noxen opens Intercept when the agent is ready. If the connection fails or only some hooks register, check **Log** for details. See [Troubleshooting](../troubleshooting/).

### Hook config and Extra script

Use **Hook config** to add hooks to the default set. To run target-specific
JavaScript in the agent, select an **Extra script**. noxen saves both file paths
in the project and reads the files again each time you connect.
[Hook configuration](../hook-configuration/)

### Extra script contract

Only run scripts you trust. They execute with the agent's privileges and share its runtime.

- Supply UTF-8 JavaScript or a standalone bundle. noxen provides `Java`. Compile TypeScript and resolve imports before loading the script.
- In Spawn, the script body runs before noxen requests its hooks and resumes the target. Callbacks scheduled through `Java.perform()`, timers, or promises can run later. noxen does not wait for them. Avoid blocking waits during startup.
- Reserve `rpc.exports` and existing noxen RPC names for the agent. Hooks on the same Java overload can conflict.
- File errors and synchronous script errors stop connection setup. Later callback errors appear in **Log**. Use **Verbose logs** to see unprefixed `send()` messages. The `noxenEvent` field is reserved for the agent.
- If the script patches memory or changes app state, restart the target to get a clean process.

### Input ANR bypass (experimental)

On a rooted research device, this can postpone input-dispatch ANRs while an Intent is held. Other Android deadlines still apply. See [Android behavior and limits](../android-behavior-and-limits/).

## Intercept tab

![Intercept tab](/noxen-docs/screenshots/intercept.png)

Resolve a held Intent by forwarding, editing, or dropping it. See [Intercepting and modifying](../intercepting-and-modifying/).

## History tab

![History tab](/noxen-docs/screenshots/history.png)

Inspect and search captured Intents, including those that were never held. See [History and projects](../history-and-projects/).

## Monitor tab

Observe Java calls without stopping them. See [Monitor](../monitor/) for the available profiles and how to correlate calls with History.

## Info app tab

Inspect the connected app's signing, build configuration, permissions, and manifest components. See [Info app](../info-app/) for access classifications and their limits.

## Log tab

Check connection errors, hook installation results, and agent messages. Enable **Verbose logs** for per-hook and interception diagnostics.

## Settings tab

Choose whether interception and stack traces start enabled, set the stack depth, and select a theme. **Save** applies the theme immediately and stores the startup preferences for your user account across projects.
