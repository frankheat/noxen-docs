---
title: "Overview"
---

noxen is a tool for inspecting how Android app components communicate at runtime.
It uses Frida to hook selected Java methods. You can inspect an Intent when it
reaches a hook, change its fields before forwarding it, or drop the intercepted
call or result.

## Attack-surface mapping

Suppose an exported activity reads an Intent with `getIntent()`. You can inspect
the action, URI, and extras that reach the activity, then change one value and
observe how the app responds. Use manifest review or static analysis to identify
entry points, and runtime tests to see which code paths the app takes.

noxen observes the methods you hook. To investigate what the app does with a
captured value, compare the Intent with related Java calls in Monitor. You
trace the value yourself across the captured calls.
[Correlating History and Monitor events](./monitor/#correlating-history-and-monitor-events)

## Get started

- [Installation](./installation/) explains how to set up noxen and Frida.
- [Quick start](./quick-start/) walks you through your first interception.
- [noxen playground](./noxen-playground/) provides a target app for controlled tests.
- [Android behavior and limits](./android-behavior-and-limits/) explains when holding an Intent can make the app unresponsive.
