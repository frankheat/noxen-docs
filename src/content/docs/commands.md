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

| Command | Meaning |
|---|---|
| `action <value>` | Set the intent action |
| `data <uri>` | Set the data URI |
| `+cat <value>` | Add a category |
| `-cat <value>` | Remove a category |
| `+flag <int>` | Add an integer flag |
| `-flag <int>` | Remove an integer flag |
| `+x [type] <key> <value>` | Add or replace an extra |
| `-x <key>` | Remove an extra |

Supported extra types:

```text
int
bool
float
long
double
string
```

If no extra type is specified, `string` is used.

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

