---
title: "Frida compatibility"
---

noxen is intended to work across current Frida versions that support the required Java
instrumentation APIs. It has been tested with Frida 16.6.6 and 17.7.3 because Frida 17
introduced a compatibility boundary that older scripts often fail to cross.

Those tested versions are not an exhaustive compatibility matrix. The Frida 17
loading change is one boundary, but Android ART, OEM changes, and the Java bridge
also affect whether hooks can be installed and invoked on a particular device.

## The Frida 17 change

Frida 17 changed how the Java bridge is provided. Code that assumes a global `Java`
object can fail unless the bridge is explicitly loaded.

The agent handles this with a compatibility shim:

```javascript
const Java = globalThis.Java !== undefined ? globalThis.Java : require('frida-java-bridge');
globalThis.Java = Java;
```

## Runtime bundle

Normal package installs include the JavaScript runtime bundles required by noxen.
Users do not need to rebuild them.

When running from the source tree, Python loads:

```text
agent/script_bundle.js
```

Installed packages use the packaged copy under:

```text
src/noxen/runtime/agent/script_bundle.js
```

The installed wheel stores the same file inside the `noxen` Python package. The
bundle includes what is needed for Frida 17-style Java bridge loading.

The current source dependency pins `frida-java-bridge` to `7.0.10`; the committed
bundles embed that dependency. Changing the host Python `frida` version alone does
not replace the bridge embedded in these bundles. A host/server version match is
necessary for a reliable setup but does not establish Java bridge compatibility
with every Android runtime.

If the bundle is missing, the tool falls back to:

```text
agent/script.js
```

That fallback can work with older Frida versions, but versions with Frida 17-style Java
bridge loading should be expected to fail without the bundle.

## Extra scripts

Extra scripts selected from the Home tab are evaluated in the main agent's runtime
after its bundle is loaded and before noxen requests its own hooks. They share the
agent's Java bridge, but have their own source filename for error reporting.

That means custom scripts can use:

```javascript
Java.perform(function () {
  // custom logic
});
```

without importing `frida-java-bridge` themselves.

`Java.perform()` can defer its callback until the app class loader is available.
Successful initial execution does not confirm asynchronous setup or bypass success.
See the [extra script contract](../running-noxen/#extra-script-contract) for timing,
error handling, supported script formats, and reserved RPC exports.

## Developer rule

After changing:

```text
agent/script.js
agent/system_server.js
```

run:

```bash
npm run build
```

and commit the changed source file with its matching bundle and packaged runtime copy:

```text
agent/script.js
agent/script_bundle.js
agent/system_server.js
agent/system_server_bundle.js
src/noxen/runtime/agent/
```

## Version troubleshooting

noxen treats the agent's hook registration report as part of connection setup. It
does not show a ready connection if the report is missing, reports a fatal error,
or contains no installed hooks. Partial registration remains available with a
persistent warning and per-hook details in Log. "Installed" describes registration,
not a guarantee that ART will dispatch that hook: some Java bridge versions can
silently miss methods on classes that have not yet been initialized. Verify the
first invocation of any hook whose coverage is critical to your analysis.

If the session fails before hooks are installed:

- Confirm the Android `frida-server` version.
- Confirm the Python `frida` package version.
- If running from the source tree, confirm `agent/script_bundle.js` exists.
- Compare with a known working host/server pair on a controlled test device; do
  not assume that downgrading is safe or fixes every OEM runtime issue.
- Check the Log tab for JavaScript initialization errors.
