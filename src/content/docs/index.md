---
title: "Overview"
description: noxen hooks Java methods in a running Android app to show how its components communicate.
---

noxen is a tool for inspecting how the components of an Android app communicate at
runtime. It uses [Frida](https://frida.re) to hook Java methods in the target process,
so you can see each Intent as it is sent or received, change it before the app
continues, or drop it.

## What you can do

- **Hold and edit Intents.** Stop an Intent at a hook, inspect its action, data and
  extras, change any field and let the app continue. See [Intercept](./intercept/).
- **Review every capture.** Search all captured Intents, including those that were
  never held. See [History](./history/).
- **Follow a value.** Record related Java calls, such as SQL queries, file opens and
  WebView loads, without stopping them. See [Monitor](./monitor/).
- **Send your own requests.** Start activities, send broadcasts and call content
  providers from an app already running on the device. See [Sender](./sender/).
- **Inspect the app.** Review its signers, permissions and exported components.
  See [Info app](./info-app/).
- **Drive noxen from an AI client.** Share the session with an MCP client. See
  [MCP](./mcp/).

## How noxen fits a test

Manifest review and static analysis tell you which entry points exist. noxen shows
what reaches them at runtime: suppose an exported activity reads its Intent with
`getIntent()`. You can see the values that arrive, change one, and observe how the app
responds.

noxen observes only the methods it hooks. To learn what the app does with a captured
value, compare the Intent with related calls in Monitor; see
[Correlating History and Monitor events](./monitor/#correlating-history-and-monitor-events).

## The interface

| Tab | Use it to |
| --- | --- |
| [Home](./home/) | Choose a device and a target, and connect |
| [Intercept](./intercept/) | Forward, edit or drop the held Intent |
| [History](./history/) | Search and inspect captured Intents |
| [Monitor](./monitor/) | Record Java calls without stopping them |
| [Sender](./sender/) | Send requests from an app on the device |
| [Info app](./info-app/) | Inspect permissions and manifest components |
| [MCP](./mcp/) | Share the session with an MCP client |
| [Log](./log/) | Read connection, hook and crash reports |
| [Settings](./settings/) | Set startup preferences and the theme |

## See also

- [Installation](./installation/)
- [Quick start](./quick-start/)
- [noxen playground](./noxen-playground/), a target app for controlled tests
