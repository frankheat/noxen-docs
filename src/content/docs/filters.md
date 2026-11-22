---
title: "Filters"
description: Choose which Android calls Intercept holds and which captures History shows.
---

Open **Filters** in Intercept or History. Each tab saves its own rules in the
project. Intercept forwards calls excluded by its rules and still records them
in History. History filters only affect the results shown in its table.

## Create a rule

Choose **Focus** or **Ignore**, then add one or more conditions. An event must
match every condition in a rule. If any **Focus** rules are active, matching any
one of them is enough and **Ignore** rules have no effect. Otherwise an event
that matches any **Ignore** rule is excluded.

To hold incoming queries to a particular provider, add a **Focus** rule with
**Event** set to **Provider**, **Direction** to **Incoming**, **Method** to
`query`, and **Authority** to the provider's authority. Calls already held
keep the filter decision made for their request.

| Condition | Matches |
| --- | --- |
| **Event** | Intent or Provider |
| **Class**, **Method** | The hooked class or method |
| **Direction** | Incoming or outgoing provider calls |
| **Authority**, **URI** | The provider authority or URI in the captured request |
| **Action**, **Component**, **Data**, **Flags**, **Category** | Intent fields. Existing **Data** rules also match provider URIs. |

In text conditions, `*` matches any text and `?` matches one character.
`set` and `unset` match the presence or absence of a value. In **Component**,
`explicit` and `implicit` match whether the Intent itself names a component.

Use the **Active** column to toggle a rule. **Edit** replaces its conditions.
**Copy to History** or **Copy to Intercept** adds an independent copy in the other
tab. Use History search to look for specific data inside an event.
