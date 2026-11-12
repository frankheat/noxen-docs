---
title: "Filters"
---

Use filters to decide which events to stop during a test or which captures to
show in History. Each tab has its own set of rules.

- Intercept filters decide whether a captured intent stops in the Intercept tab.
- History filters decide which stored rows are displayed in the History tab.

You can add rules from the **Filters** dialog or enter the commands below.

## Rule types

| Type | Meaning |
|---|---|
| `ignore` | Hide or auto-forward matching intents |
| `focus` | Show only matching intents |

Focus rules take precedence. If at least one focus rule is active, an intent must match
a focus rule to be shown. Ignore rules do not matter in that case.

## Rule format

A rule contains one or more `key=value` pairs. The last example matches only
calls to `getIntent` on `com.example.MainActivity`, because an event must satisfy
every pair in a rule.

```text
/filter add ignore class=*ContextThemeWrapper
/filter add focus method=sendBroadcast
/filter add ignore class=com.example.MainActivity method=getIntent
```

## Valid keys

| Key | Matches |
|---|---|
| `class` | Hooked Java class |
| `method` | Hooked Java method |
| `action` | Intent action |
| `data` | Intent data URI |
| `flags` | Intent flags |
| `category` | Any category in the intent |
| `component` | Component field of the base captured Intent, not a resolved destination |

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

These aliases test only whether the base Intent has a Component. They do not
classify the selector or predict Android routing. An Intent with no base Component
but a selector naming a component still matches `component=implicit`. A recorded
null Intent also has no Component, so it matches `component=unset` / `implicit`.

Structured rules do not inspect selector fields, ClipData, or nested extras. Use
History search to find captured values in those structures. MIME type and package
are not dedicated filter keys.

## Intercept filter behavior

When an Intercept filter hides an intent, the tool auto-forwards it. The intent is still
stored in History before the filter decision is applied.

## History filter behavior

History filters never affect the target app. They only change the rows shown in the UI
and the result of `/export filtered entries`.

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
