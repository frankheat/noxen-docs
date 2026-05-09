---
title: "Frida compatibility"
---

noxen is intended to work across current Frida versions that support the required Java
instrumentation APIs. It has been tested with Frida 16.6.6 and 17.7.3 because Frida 17
introduced a compatibility boundary that older scripts often fail to cross.

Those tested versions are not the only supported versions. The important distinction is
the behavior before and after Frida 17.

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

If the bundle is missing, the tool falls back to:

```text
agent/script.js
```

That fallback can work with older Frida versions, but versions with Frida 17-style Java
bridge loading should be expected to fail without the bundle.

## Extra scripts

Extra scripts selected from the Home tab are appended after the main Frida agent
bundle.

That means custom scripts can use:

```javascript
Java.perform(function () {
  // custom logic
});
```

without importing `frida-java-bridge` themselves.

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

If the session fails before hooks are installed:

- Confirm the Android `frida-server` version.
- Confirm the Python `frida` package version.
- If running from the source tree, confirm `agent/script_bundle.js` exists.
- Try the same command with a known working pre-17 or 17+ Frida environment.
- Check the Log tab for JavaScript initialization errors.
