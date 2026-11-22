---
title: "Settings"
description: Choose how noxen starts and which theme it uses.
---

The **Settings** tab holds your preferences. They apply to every project.

| Setting | Effect |
| --- | --- |
| Intercept on startup | Start with interception on |
| Stack trace on startup | Show stack traces in Intercept from the start |
| Stack depth | Number of stack frames to show |
| Theme | Dark or Light |
| Capture Cursor previews | Read bounded query results for History and intercepted responses |

**Save** applies the theme at once and stores the rest for the next start. Settings are
saved in your user configuration directory:

| System | File |
| --- | --- |
| Linux | `~/.config/noxen/settings.txt`, or under `$XDG_CONFIG_HOME` |
| macOS | `~/Library/Application Support/noxen/settings.txt` |
| Windows | `%APPDATA%\noxen\settings.txt` |
