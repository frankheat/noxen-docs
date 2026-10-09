---
title: "Commands"
---

The command input is optional. The TUI also provides buttons, filters, edit controls,
and dialogs for the same workflow.

Use this page as a reference when you prefer keyboard-driven testing, want faster
repetition, or need exact command syntax.

Commands are divided into two groups:

- bare commands affect the current intercepted intent;
- slash commands affect app state, tab state, filters, exports, or settings.

## Intent actions

These commands are available when an intent is actively blocked in the Intercept tab.

| Command | Alias | Meaning |
|---|---|---|
| `forward` | `f` | Forward the current intercepted intent |
| `drop` | `d` | Drop the current intercepted intent |

## Intent modifications

Modifications are staged. They are applied only when you forward the current intent.
When the intent is forwarded, the same staged changes are reflected in History and in
the project database.

The command bar and visual editor share the same draft. When the editor is open, a
modification command updates it immediately. Opening the editor after entering commands
shows their combined result. **Cancel edit** or `Esc` discards every pending change,
regardless of whether it came from a command or from the form.

| Command | Meaning |
|---|---|
| `action <value>` | Set the intent action |
| `data <uri>` | Set the data URI |
| `+cat <value>` | Add a category |
| `-cat <value>` | Remove a category |
| `+flag <int>` | Add an integer flag |
| `-flag <int>` | Remove an integer flag |
| `+x [type] <key> <value>` | Add or replace an extra |
| `+x null <key>` | Add a null String extra |
| `-x <key>` | Remove an extra |

The type names mirror every extra form in the current Android `adb shell am`
intent parser:

| noxen type | adb option | Value received by the app |
|---|---|---|
| `string` | `--es` | `String` |
| `null` | `--esn` | null `String` |
| `bool` | `--ez` | `boolean` |
| `int` | `--ei` | `int` |
| `long` | `--el` | `long` |
| `float` | `--ef` | `float` |
| `double` | `--ed` | `double` |
| `uri` | `--eu` | `Uri` |
| `component` | `--ecn` | `ComponentName` |
| `int[]` | `--eia` | `int[]` |
| `long[]` | `--ela` | `long[]` |
| `float[]` | `--efa` | `float[]` |
| `double[]` | `--eda` | `double[]` |
| `string[]` | `--esa` | `String[]` |
| `int-list` | `--eial` | `ArrayList<Integer>` |
| `long-list` | `--elal` | `ArrayList<Long>` |
| `float-list` | `--efal` | `ArrayList<Float>` |
| `double-list` | `--edal` | `ArrayList<Double>` |
| `string-list` | `--esal` | `ArrayList<String>` |

If no extra type is specified, `string` is used.

Array and list items are comma-separated. String collections accept `\,` for a
literal comma inside an item. Quote the full value in the command bar when it
contains spaces:

```text
+x int[] ids 10,20,30
+x string-list labels "first item,second item,comma\,inside"
+x component target dev.example/.MainActivity
+x null optional_name
```

The edit form exposes the same type set. Numeric values are checked before the
intent is forwarded, including Android `int` and `long` ranges. For booleans,
Android accepts `true`, `false`, `t`, `f`, or an integer (`0` is false and any
other valid integer is true).

See [Intercepting and modifying](https://frankheat.github.io/noxen-docs/intercepting-and-modifying/) for a complete
modification flow.

## Interception state

| Command | Meaning |
|---|---|
| `/intercept on` | Enable block mode |
| `/intercept off` | Disable block mode |
| `/intercept status` | Show current interception state |

When interception is off, intents are still observed and stored in History, but the target
thread is not held waiting for a manual decision.

## Stack trace

| Command | Meaning |
|---|---|
| `/stack on` | Enable stack trace display in the active tab |
| `/stack off` | Disable stack trace display in the active tab |
| `/stack <number>` | Set the number of stack frames shown in the active tab |

Intercept and History stack settings are independent.

## History search

| Command | Meaning |
|---|---|
| `/search <text>` | Apply the same substring search as the History search field |
| `/search` | Clear the History search |

The command is available only in History. It updates the visual search field,
so the command and graphical control never hold different queries. Search is a
temporary case-insensitive substring match. `/filter` remains the appropriate
command for structured rules stored with the project.

## Filters

`/filter` always operates on the active tab.

| Command | Meaning |
|---|---|
| `/filter list` | Show active filters |
| `/filter add ignore <rule>` | Add an ignore rule |
| `/filter add focus <rule>` | Add a focus rule |
| `/filter remove <id>` | Remove a filter by ID |

Examples:

```text
/filter add ignore class=*ContextThemeWrapper
/filter add focus method=sendBroadcast
/filter add focus component=explicit
/filter remove 3
```

See [Filters](https://frankheat.github.io/noxen-docs/filters/) for the full rule format.

## Export and save

| Command | Meaning |
|---|---|
| `/export entries` | Export all history entries to JSON |
| `/export filtered entries` | Export only the currently filtered History view |
| `/save history filters` | Save History filters to a timestamped text file |
| `/save intercept filters` | Save Intercept filters to a timestamped text file |

## System commands

| Command | Meaning |
|---|---|
| `/help` | Open the help modal |
| `/quit` | Exit the application |
| `/theme` | Toggle dark/light theme |
| `/clear history` | Clear all stored history entries in the current project |

The dark and light variants use paired noxen palettes. Borders, selections,
status colors, logs and controls adapt together so both variants preserve
readability and contrast.
