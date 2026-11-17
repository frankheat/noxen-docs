---
title: "Filters"
description: Rules that choose which Intents Intercept holds and which captures History shows.
---

Filters are rules that match captured Intents. Intercept and History each have their
own set, saved in the project:

- **Intercept filters** choose which Intents are held. An Intent that does not pass is
  forwarded automatically, and still recorded in History.
- **History filters** choose which captures are shown and exported with
  `/export filtered entries`. They never affect the app.

Add rules from **Filters** in either tab, or with [`/filter`](../commands/#filters).

## Rule types

| Type | Effect |
| --- | --- |
| `focus` | Only matching Intents pass |
| `ignore` | Matching Intents do not pass |

If any `focus` rule is enabled, an Intent must match one to pass, and `ignore` rules are
not used.

## Syntax

A rule is one or more `key=value` pairs. An Intent must match every pair.

```text
/filter add ignore class=*ContextThemeWrapper
/filter add ignore class=com.example.MainActivity method=getIntent
```

| Key | Matches |
| --- | --- |
| `class` | The hooked class |
| `method` | The hooked method |
| `action` | The action |
| `data` | The data URI |
| `flags` | The flags |
| `category` | Any of the categories |
| `component` | The component of the Intent, not where Android delivered it |

Values are glob patterns: `*` matches any text.

```text
/filter add focus action=android.intent.action.*
```

### Presence

`set` matches a field that has a value, and `unset` one that does not. For
`component`, `explicit` and `implicit` are the same as `set` and `unset`.

```text
/filter add focus data=set
/filter add focus component=explicit
```

`implicit` only means that the Intent names no component. An Intent whose selector
names one, and a null Intent, are both `implicit`.

Rules do not look into the selector, ClipData or extras; use History search for those.

## Examples

| Goal | Rule |
| --- | --- |
| Skip framework wrapper noise | `ignore class=*ContextThemeWrapper` |
| Hold only broadcasts | `focus method=sendBroadcast` |
| Hold only Intents with a data URI | `focus data=set` |
| Hold only explicit Intents | `focus component=explicit` |

## Save filters to a file

`/save intercept filters` and `/save history filters` write the rules to a text file,
one per line. Lines starting with `#` are comments.

```text
ignore class=*ContextThemeWrapper
focus method=sendBroadcast
```
