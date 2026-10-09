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

The top-level JSON value must be an array. `clazz`, `method`, and every entry in
`args` must be non-empty strings. When present, `minApi` must be a positive
integer. Unknown fields are ignored with a warning.

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

The selected file is validated before noxen starts a connection. A missing or
unreadable file, invalid JSON, or an invalid hook definition prevents the
connection from starting. The error is shown on the Home tab and its detailed
location, such as `hook[3].args[1]`, is written to Log.

Custom hooks are intended for methods that carry an Intent. A supported entry is
one of the following:

- a method whose `args` contains `android.content.Intent`;
- a zero-argument `getIntent` method returning `android.content.Intent`;
- `PendingIntent.getActivity`, `getBroadcast`, or `getService`, with the Intent
  in the expected third argument position.

Other method shapes are rejected because noxen could not extract and safely edit
an Intent from them.

## Duplicates

An exact hook signature is identified by `clazz`, `method`, and `args`. If the
same signature appears more than once, including once in the bundled defaults
and once in a custom file, noxen keeps the first definition and reports the
duplicate in Log.

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

Static validation cannot prove that a class or overload exists in the selected
process. After connecting, the Frida agent attempts each hook independently and
reports a summary such as:

```text
Hooks: 27 installed, 2 skipped, 1 failed
```

An API-incompatible hook is skipped. A missing class, method, or overload fails
only that hook and does not discard hooks that were installed successfully. Log
identifies whether each affected entry came from the bundled defaults or the
custom file. If no custom hook could be installed, noxen emits an explicit
warning.

The project stores the selected file path, not a copy of the JSON content. Keep
the file available at that path when reopening the project. Paths selected with
Browse are normalized to absolute paths.
