---
title: "Hook configuration"
---

Hook configuration controls which Java methods are intercepted. This is how you decide
which component communication points noxen can observe.

noxen ships with a default hook configuration bundled inside the package.
Additional hook files can be loaded with the **Hook config** Browse button on the
Home tab before connecting. Custom hooks are appended to the default hooks.

In the source tree, the default configuration is stored at:

```text
config/hooks.json
```

Installed packages use the bundled runtime copy, so normal users do not need to run
noxen from the source checkout.

## Format

Each hook definition has:

- `clazz`: Java class name.
- `method`: method name.
- `args`: exact Java argument type list.
- `minApi`: optional minimum Android API level.

Example:

```json
[
  {
    "clazz": "com.example.MyReceiver",
    "method": "onReceive",
    "args": ["android.content.Context", "android.content.Intent"],
    "minApi": 1
  }
]
```

## Default coverage

The default hooks include common intent entry points such as:

- `Activity.startActivityForResult`
- `Activity.setResult`
- `Activity.onActivityResult`
- `Activity.onNewIntent`
- `Activity.getIntent`
- `ContextWrapper.startActivity`
- `ContextWrapper.sendBroadcast`
- `ContextWrapper.sendOrderedBroadcast`
- `ContextWrapper.startService`
- `ContextWrapper.startForegroundService`
- `ContextWrapper.bindService`
- `PendingIntent.getActivity`
- `PendingIntent.getBroadcast`
- `PendingIntent.getService`

## API-specific hooks

Some Android methods exist only on newer API levels.

For example, Android 14 introduced or changed overloads around broadcast and service APIs.
The `minApi` field prevents the agent from trying to hook methods that are not available
on the current device.

## Exact signatures matter

Frida hooks overloads by argument list. If the argument list is wrong, the method will
not be hooked.

Check:

- Fully qualified class name.
- Method name.
- Exact argument type order.
- Inner class syntax, for example `android.content.Context$BindServiceFlags`.
