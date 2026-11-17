---
title: "Log"
description: Read connection errors, hook installation results, agent messages and crash reports.
---

The **Log** tab lists what noxen and the Frida agent report: connection errors, which
hooks installed, and messages from the agent. Each line shows its source and level.

## Verbose logs

**Verbose logs** also shows debug messages, such as the result of each hook and when
each hold starts and ends. noxen keeps these messages while the switch is off, so
turning it on also shows earlier ones.

## Crashes

**Crashes** lists the crashes of the target that Frida reported, saved in the project.
Select one to read its report. Each report records the target, device, time and
capture session. Use the session to look for nearby events in History and Monitor;
their order alone does not show what caused the crash.

Reports longer than 32,768 characters are shortened, and marked as such.

## Clear the log

`Ctrl+L` clears the log.

## See also

- [Troubleshooting](../troubleshooting/)
