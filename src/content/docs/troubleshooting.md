---
title: "Troubleshooting"
---

## `Connection failed`

Check:

- `frida-server` is running on the Android device.
- The device is reachable.
- The app name, package name, or PID is correct.
- Host and device Frida versions are compatible.
- The target process is alive.

Try spawn mode if attach mode misses early startup behavior: select **Spawn** in the
Mode dropdown on the Home tab before connecting.

## `noxen` command is not found

Check that the virtual environment is active, then refresh zsh's command cache if
needed:

```bash
rehash
```

You can also launch noxen without relying on the console script:

```bash
python -m noxen
```

## `script_bundle.js not found`

The runtime bundle is missing. This should normally affect only source-tree
development, because regular package installs include the bundled runtime files.
Frida 17 support depends on this file.

In source-tree development noxen reads `agent/script_bundle.js`; regular package
installs read the bundled copy inside the Python package.

Rebuild it:

```bash
npm install
npm run build
```

Then run noxen again.

If the Log tab mentions `agent/system_server_bundle.js`, rebuild the same way. That
bundle is only used by the optional `Input ANR bypass (experimental)` switch.

## Frida 17 Java errors

If errors mention `Java`, `require`, or `frida-java-bridge`, confirm that:

- `agent/script_bundle.js` exists if you are running from the source tree.
- `agent/system_server_bundle.js` exists if you are running from the source tree and
  `Input ANR bypass (experimental)` is enabled.
- `src/noxen/runtime/agent/` was synced if you are building a wheel.
- The relevant bundle was regenerated after editing `agent/script.js` or
  `agent/system_server.js`.
- The host Python environment is using the Frida version you expect.

## No intents appear

Possible causes:

- The selected app is not using the hooked methods.
- The behavior you are testing happens before attach.
- The hook signature is wrong.
- The app uses native code or reflection-heavy paths.
- Filters are hiding active interceptions.

Try spawn mode from the Home tab and check:

- The Intercept toggle is enabled if you expect blocking behavior.
- Intercept filters are not hiding the events you want to inspect.

## Too many intents appear

Add Intercept filters from the filter UI, or reduce hook coverage with a narrower
custom hook file. See [Filters](https://frankheat.github.io/noxen-docs/filters/) for
rule examples.

## App becomes not responding

This usually means a hooked thread was blocked too long.

Immediate actions:

- Forward or drop the active intent.
- Turn interception off from the Intercept toggle.
- Add filters to auto-forward noisy events.
- Use fewer hooks.
- Prefer app-specific hooks.
- On rooted test devices, the optional `Input ANR bypass (experimental)` switch can
  reduce input-dispatch ANRs while noxen holds an event, but it cannot guarantee a
  later ANR dialog on every Android build.

See [Android behavior and limits](https://frankheat.github.io/noxen-docs/android-behavior-and-limits/).

## Need more runtime details

The Log tab shows system and Frida session messages with aligned source and level
columns. DEBUG messages are stored but hidden by default to keep the view readable.

Enable `Verbose logs` in the Log tab when you need detailed diagnostics such as
individual hook paths, skipped `system_server` hooks, or Input ANR hold start/end
events. The switch only changes which stored messages are visible; it does not add
extra status lines to the log.

## Custom hook does not work

Check:

- Class name is fully qualified.
- Method name is correct.
- Argument types exactly match the overload.
- The method exists on the device API level.
- The code path is actually executed.

## APK analysis fails

APK analysis uses optional `androguard` support. If the command reports that
`androguard` is missing, install the analysis extra:

```bash
pip install ".[analyze]"
```

If `androguard` is installed and analysis still fails, the APK may use structures the
analyzer does not understand. You can write hooks manually.

## UI looks broken

Terminal UI rendering depends on terminal size and capabilities.

Try:

- Increase terminal width.
- Use a modern terminal emulator.
- Toggle the theme from the UI or command bar.
- Restart the session if the terminal was resized aggressively.
