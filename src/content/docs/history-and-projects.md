---
title: "History and projects"
---

Use History to review the Intents noxen captured, including those it forwarded
automatically or observed with interception off. You can reopen a saved project
and browse its captures without attaching to the app again.

## What History shows

| Outcome | Meaning |
|---|---|
| `forwarded` | Forwarded with no confirmed modification |
| `modified_forwarded` | Forwarded with at least one observed modification |
| `dropped` | The hook suppressed the call or getter result |
| Pending | No final decision was recorded |

After you forward an edited Intent, History shows the original payload and the
result the agent observed. If you see a `!` beside the outcome, open the detail
to check whether an edit failed or noxen could not verify the result. The outcome
records the hook decision. Verify Android delivery or method completion separately.

**Time** shows when the agent observed the Intent, in UTC. Older captures without
an agent timestamp show when the host received the event. If the agent confirms
a release, **Released at** shows when the hook was about to give control back to
the app after any edits. Use **Capture order** to compare the Intent with related
Monitor calls. [Correlating History and Monitor events](../monitor/#correlating-history-and-monitor-events)

Older versions could store zero flags as `null` and collapse an empty MIME string into an absent value. Those distinctions cannot be recovered when reopening an old project.

## Search

To find an Intent, enter part of a class name, action, URI, or extra value.
Search ignores case and includes captured selector and ClipData values. After
an edit, it searches the resulting payload. **Changes** shows the original
values for manual review.

Search skips the base Intent's **Package** field, stack traces, and permission
metadata. Large captures can also exceed the search index's size limit. If a
search returns no matches, check the detail before ruling out the value.

Use `/search <text>` to set the same query or `/search` to clear it. Use [History filters](../filters/) for rules you want to keep in the project.

## Column selection

Use **⊟** to show or hide columns and set widths. Enable **Capture order** to compare session and capture numbers without opening each detail. Column preferences are saved in the project.

## Project files

```bash
noxen --new-project session
noxen --project session.noxen
```

Without either flag, noxen creates a persistent `project_YYYYMMDD_HHMMSS.noxen` file in the working directory.

Projects store History, Monitor events and profiles, filters, table preferences, and paths to the hook configuration and extra script. Info app snapshots, Log messages, search queries, and unforwarded edits are session data. A pending row reopened from a project is a record of the capture. It cannot resume a thread.

### Storage errors

If a capture shows a **Storage warning**, the project may be missing that capture
or its latest changes. Export History before closing noxen to keep the values
from the current session. History does not retry failed writes automatically.

## Clearing history

Clearing History deletes the saved Intent rows in the current project. Resolve any held Intent separately in Intercept.

## Export

Use `/export entries` for the full History or `/export filtered entries` for the current view. JSON exports and project files can contain secrets and personal data. Review them before sharing.
