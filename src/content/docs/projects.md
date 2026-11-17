---
title: "Projects"
description: Keep a session's captures and settings in a .noxen file and reopen it later.
---

A project is a `.noxen` file that keeps what you capture and how you set up the
session. noxen always works in a project.

## Create or open a project

| Command | Effect |
| --- | --- |
| `noxen` | Create `project_YYYYMMDD_HHMMSS.noxen` in the current directory |
| `noxen --new-project session` | Create `session.noxen` |
| `noxen --project session.noxen` | Open an existing project |

You can open a project without a device to review what it holds.

## What a project keeps

| Saved in the project | Not saved |
| --- | --- |
| History | Info app snapshots |
| Monitor events and profiles | Log messages |
| Sender requests and runs | Search queries |
| Intercept and History filters | Edits not yet forwarded |
| Column choices | |
| Paths to the hook config and extra script | |
| Crash reports | |

The project stores the paths of the hook config and extra script, not their content:
keep the files where they are. Preferences such as the theme belong to
[Settings](../settings/) and apply to every project.

A capture that was pending when noxen closed stays pending: it is a record, and cannot
resume the thread it held.

## Sharing a project

A project can contain secrets and personal data from the target app. Review it before
sharing.
