---
title: "Filters"
---

Filters reduce noise without changing the data stored in History. noxen has two
independent filter sets:

- Intercept filters decide whether a captured intent stops in the Intercept tab.
- History filters decide which stored rows are displayed in the History tab.

Filters can be managed from the UI or from the command input. The examples below use
commands because they are compact and easy to copy.

## Rule types

| Type | Meaning |
|---|---|
| `ignore` | Hide or auto-forward matching intents |
| `focus` | Show only matching intents |

Focus rules take precedence. If at least one focus rule is active, an intent must match
a focus rule to be shown. Ignore rules do not matter in that case.

## Rule format

Each rule is made of one or more `key=value` pairs:

```text
/filter add ignore class=*ContextThemeWrapper
/filter add focus method=sendBroadcast
/filter add ignore class=com.example.MainActivity method=getIntent
```

Multiple key/value pairs in the same rule are AND-ed together.

## Valid keys

| Key | Matches |
|---|---|
| `class` | Hooked Java class |
| `method` | Hooked Java method |
| `action` | Intent action |
| `data` | Intent data URI |
| `flags` | Intent flags |
| `category` | Any category in the intent |
| `component` | Target component |

Values use glob matching through `fnmatch`, so `*` is supported:

```text
/filter add ignore class=*ContextThemeWrapper
/filter add focus action=android.intent.action.*
```

## Presence checks

Use `set` and `unset` to match whether a field exists:

```text
/filter add focus data=set
/filter add ignore action=unset
```

For `component`, these aliases are also supported:

```text
explicit = set
implicit = unset
```

Examples:

```text
/filter add focus component=explicit
/filter add focus component=implicit
```

## Intercept filter behavior

When an Intercept filter hides an intent, the tool auto-forwards it. The intent is still
stored in History before the filter decision is applied.

This design preserves the audit trail while keeping the active Intercept tab focused.

## History filter behavior

History filters never affect the target app. They only change the rows shown in the UI
and the result of `/export filtered entries`.

## Filter count indicator

The footer bar on the Intercept and History tabs shows the number of active filters on
the right side. The count reflects the filter set of the current tab:

- `Filters: 3` — three enabled filters
- `Filters: 2/3` — two of three filters are enabled (one is toggled off)

The indicator is hidden on other tabs.

## Saving filters

Use:

```text
/save intercept filters
/save history filters
```

The exported format is text-based and uses one rule per line.

## Common filter recipes

Ignore framework wrapper noise:

```text
/filter add ignore class=*ContextThemeWrapper
```

Focus on broadcasts:

```text
/filter add focus method=sendBroadcast
```

Focus on intents with a data URI:

```text
/filter add focus data=set
```

Focus on explicit intents:

```text
/filter add focus component=explicit
```

Hide intents without a component:

```text
/filter add ignore component=implicit
```
