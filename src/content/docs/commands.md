---
title: "Commands"
description: Reference for the commands accepted by the Intercept and History command bars.
---

Intercept and History have a command bar at the bottom; `Ctrl+B` shows or hides it.
Commands without a slash act on the held Intent and work only in Intercept. Commands
with a slash act on noxen and work in both tabs, unless noted.

## Intent actions

| Command | Alias | Effect |
| --- | --- | --- |
| `forward` | `f` | Forward the held Intent |
| `drop` | `d` | Drop the held Intent |

## Intent modifications

These commands change the held Intent. They take effect when you forward it. If the
[JSON editor](../intercept/#edit-as-json) is open, they change its JSON at once.
**Cancel edit** discards them.

| Command | Effect |
| --- | --- |
| `action <value>` | Set the action |
| `component <package/class>` | Set the component, for example `component dev.example/.MainActivity` |
| `component clear` | Remove the component |
| `data <uri>` | Set the data URI |
| `mime <type>` | Set the MIME type, for example `mime application/pdf` |
| `mime clear` | Remove the MIME type |
| `+cat <value>` | Add a category |
| `-cat <value>` | Remove a category |
| `+flag <int>` | Add flags, decimal or hexadecimal |
| `-flag <int>` | Remove flags |
| `+x [type] <key> <value>` | Add or replace an extra; the type defaults to `string` |
| `+x null <key>` | Add a null `String` extra |
| `-x <key>` | Remove an extra |

Changing the data URI keeps the MIME type and the other way round, unlike Android's
`setData()` and `setType()`, which clear each other.

### Extra types

The types match those of `adb shell am`.

| Type | `am` option | Value the app receives |
| --- | --- | --- |
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

Separate array and list items with commas; in strings, `\,` is a literal comma. Quote
a value that contains spaces. A `bool` accepts `true`, `false`, `t`, `f` or an integer,
where `0` is false. Numbers are checked against their Java range.

```text
+x int[] ids 10,20,30
+x string-list labels "first item,second item,comma\,inside"
+x component target dev.example/.MainActivity
+x null optional_name
```

`component` extras and the list types cannot be shown in the JSON editor: add them
with the editor closed.

## Interception

| Command | Effect |
| --- | --- |
| `/intercept on` | Hold matching Intents |
| `/intercept off` | Record Intents without holding them |
| `/intercept status` | Show whether interception is on |

## Stack traces

These apply to the current tab; Intercept and History have separate settings.

| Command | Effect |
| --- | --- |
| `/stack on` | Show stack traces |
| `/stack off` | Hide stack traces |
| `/stack <number>` | Show that many frames |

## Search

History only.

| Command | Effect |
| --- | --- |
| `/search <text>` | Search History, like the search field |
| `/search` | Clear the search |

## Filters

These apply to the current tab. See [Filters](../filters/) for the rule syntax.

| Command | Effect |
| --- | --- |
| `/filter list` | List the filters |
| `/filter add ignore <rule>` | Add an ignore rule |
| `/filter add focus <rule>` | Add a focus rule |
| `/filter remove <id>` | Remove a filter |

## Export

| Command | Effect |
| --- | --- |
| `/export entries` | Export all of History as JSON |
| `/export filtered entries` | Export the History rows currently shown |
| `/save intercept filters` | Save the Intercept filters to a text file |
| `/save history filters` | Save the History filters to a text file |

Files are written to the current directory, with a timestamp in their name.

## General

| Command | Effect |
| --- | --- |
| `/help` | Show the commands |
| `/theme` | Switch between dark and light for this run |
| `/clear history` | Delete all captures from the project |
| `/quit` | Quit noxen |

## See also

- [Keyboard shortcuts](../keyboard-shortcuts/)
