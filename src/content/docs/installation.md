---
title: "Installation"
---

## Host

noxen requires Python 3.10 or newer.

Create and activate a virtual environment if you do not already have one:

```bash
python -m venv .venv
source .venv/bin/activate
```

First install the Frida Python package that matches the `frida-server` version running
on your Android device. For example:

```bash
pip install frida==17.7.3
```

Frida is installed separately so you can pin the exact version you need without
conflicting with an existing setup.

Then install noxen from the project directory:

```bash
git clone https://github.com/frankheat/noxen.git
cd noxen
pip install .
```

Launch noxen:

```bash
noxen
```

The base install includes noxen's TUI dependencies, default hook configuration, and
JavaScript runtime bundles. User settings are stored in your operating system's
standard per-user config directory when you save them from the Settings tab. Frida
remains separate because its Python package should match your Android `frida-server`
version.

If you also want the `noxen-analyze` command, install the optional analysis extra:

```bash
pip install ".[analyze]"
```

Use an editable install only when you are developing noxen itself. In editable mode,
the environment points to the local source tree, so Python code changes are picked up
without reinstalling the package:

```bash
pip install -e .
```

noxen uses a `src` layout. In the repository, importable Python code lives under
`src/noxen/`; the repository root intentionally does not contain a local `noxen/`
package directory.

## Android device

Use an Android device or emulator with `frida-server` running.

The Frida server version on Android should be compatible with the Frida Python package
installed on the host. If attach fails, check the server version before changing noxen
configuration.

## Frida compatibility

The project has been tested with Frida 16.6.6 and 17.7.3, but those are validation points,
not a hard version limit.

Frida 17 changed Java bridge loading, so noxen uses committed JavaScript bundles.
Regular package installs include those bundles. You only need to rebuild them when
developing noxen and editing the JavaScript agents.

## Developer-only bundle rebuild

After changing either JavaScript agent:

```bash
npm install
npm run build
```

Commit the changed source file, its matching bundle, and the synced packaged runtime
copy:

```text
agent/script.js
agent/script_bundle.js
agent/system_server.js
agent/system_server_bundle.js
src/noxen/runtime/agent/
```
