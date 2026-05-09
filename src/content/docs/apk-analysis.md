---
title: "APK analysis"
---

`noxen-analyze` is an optional helper that scans an APK and creates app-specific hook
definitions. It does not run Frida and it does not connect to a device. Its job is to
produce a JSON hook file that can later be loaded from noxen's Home tab.

Use it when the default framework hooks are too broad and you want to focus on entry
points implemented by the target app.

## Install the analyzer

APK analysis uses `androguard`, which is optional. Install the analysis extra from the
noxen repository:

```bash
pip install ".[analyze]"
```

This adds the `noxen-analyze` command.

## Run it

```bash
noxen-analyze app.apk -o hooks.json
```

The first argument is the APK path. The `-o` option controls where the generated hook
configuration is written. If `-o` is omitted, the default output file is:

```text
customHooks.json
```

After generating the file:

1. Launch noxen.
2. Select device, mode, and target from the Home tab.
3. Use **Hook config** to select the generated JSON file.
4. Connect to the app.

The generated hooks are appended to noxen's bundled default hooks.

## Output format

The output is the same hook configuration format accepted by the Home tab:

```json
[
  {
    "clazz": "com.example.MyReceiver",
    "method": "onReceive",
    "args": ["android.content.Context", "android.content.Intent"]
  }
]
```

Each entry tells noxen which Java class, method, and overload signature should be
hooked by the Frida agent.

## What it finds today

The analyzer looks for Android component classes such as:

- Broadcast receivers.
- Services.

For receivers, it emits hooks for:

- `onReceive(android.content.Context, android.content.Intent)`

For services, it emits hooks for:

- `onStartCommand(android.content.Intent, int, int)`
- `onBind(android.content.Intent)`

## When to use it

Use APK analysis when:

- You want less framework noise than the default broad hooks.
- You want to inspect receiver or service entry points implemented by the target app.
- You already know the APK and want a starting hook file before runtime testing.

The generated hooks are especially useful together with Intercept filters: the hook
file narrows what noxen observes, while filters decide what should stop for manual
review.

## Limitations

Static APK analysis cannot guarantee that every runtime path is covered.

It may miss:

- Activities and arbitrary methods that read intents internally.
- Dynamically loaded code.
- Reflection-heavy code.
- Native paths.
- Obfuscated logic that does not preserve obvious inheritance structure.
- Intent usage that happens entirely through framework methods already covered by default hooks.

It also does not decide whether a component is exploitable. Treat generated hooks as a
starting point for runtime exploration, then validate behavior in Intercept and
History.
