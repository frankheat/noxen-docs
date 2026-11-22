---
title: "Content providers"
description: Inspect and modify provider requests and Cursor responses in Intercept and History.
---

Use **Intercept** to pause a content provider call and **History** to review
its request and outcome, including calls that continued without pausing.
Outgoing calls use `ContentResolver`. Incoming calls reach a provider in the
attached process and use the transport signatures available on Android 12
and later.

## Requests

When a request pauses, **Forward** runs it as captured. Use **Edit** and
**Apply & Forward** to run it with changes. **Drop** skips the operation and
throws `OperationCanceledException` to the caller. Use [Filters](../filters/)
to choose which calls pause.

- For a query, you can edit the URI, projection and supported selection
  arguments. If the query Bundle is already unpacked, you can edit its
  selection, selection arguments and sort order. Other Bundle keys are preserved.
- For insert and update, you can edit fully captured `ContentValues` containing
  strings, integers, longs or booleans. Use decimal strings for long values to
  preserve all 64 bits.
- For file opens, you can edit the URI and the mode or MIME type, depending on
  the method. For `call()`, you can edit the authority or URI, method and string
  argument. The extras Bundle is read-only.

Opaque or partially captured arguments keep their original values. Keep the
editable keys and use `null` to clear a nullable value. If an edit is invalid,
the request stays paused so you can correct it.

## Cursor responses

To record query results without pausing the app for a decision, enable
**Settings → Capture Cursor previews** and save. The change applies to
subsequent queries in the current session. Queries that
proceed without a response hold show their preview in History. noxen reads up
to 100 rows and 32 columns within 64 KiB, restores the original position and
returns the original Cursor. History marks truncated results and omitted
cells as partial. This option is off by default because moving the Cursor can
load data and add latency.

When a query you forwarded returns a Cursor, Intercept pauses again before the
caller receives it. History records both phases in one entry. The query has
already run by this point, so dropping the response cannot undo its effects.

With **Capture Cursor previews** enabled, the response hold automatically
shows the captured rows. A complete supported capture enables **Edit** immediately.
Partial captures show their limit and remain read-only. With automatic previews
disabled, **Read Cursor** reads the table first.
**Edit** opens the columns and typed cells. Change a cell
and choose **Apply & Forward** to return a new MatrixCursor. Forward without
changes returns the original Cursor. Turning interception off releases the
original response without applying the editor draft.

A snapshot must be complete: at most 100 rows, 32 uniquely named columns and
64 KiB of serialized UTF-8 JSON. Supported cells are null, string, signed 64-bit
integer and finite floating-point values; strings are limited to 8,192 UTF-16
code units. Integers use decimal strings. Blob cells, duplicate columns,
unsupported values, read failures and oversized tables prevent replacement.
No partial table is presented as an editable complete response.

Reading can load data or run code in a custom Cursor implementation, even when
noxen restores the original position. A replacement carries the table's rows
and types. Features such as notifications, lazy loading and custom Cursor
behavior require the original Cursor.
Bundles, streams and file descriptors remain opaque; noxen does not read their
contents or replace them. Null Cursors and original exceptions are recorded
without an extra response hold.

## MIME type responses

With interception enabled, forwarding a `getType()` request stops again before
the MIME type reaches the caller. Select **Edit** to change `{"value": "text/plain"}`.
The value accepts a string, including an empty string, or `null`.
**Apply & Forward** delivers the edited value. History keeps the original
value and the sent value when they differ. A provider exception is recorded
and propagated directly.

## Boundaries

Outgoing edits happen before the ContentResolver operation. Incoming edits
happen before the Transport method, which still performs its Android checks.
Caller identity is never edited. Incoming events record Binder's calling UID;
internal calls can have the app's own UID. Android can deny access before the
Transport hook is reached, producing no captured call.

Providers and Intents share one hold slot. Other calls continue while that slot
is occupied. Nested provider calls on the same thread are represented by the
outer hooked operation. Holds can still trigger Android timeouts. Capture uses
a bounded queue; under sustained load, non-held provider events can be lost.
Held calls use a separate control queue so they remain releasable.

The former Content Resolver and Incoming Provider built-in Monitor profiles are
replaced by this capture path. Historical Monitor events remain available.
Custom hooks or extra scripts on the same overload can still conflict and
require reconnecting with the overlap removed.

## Playground

Open **Provider requests** in noxen playground. Calls run on worker threads and
the result or exception appears at the top of the screen.

To test a filename traversal:

1. Select **Import file · unsafe metadata filename**.
2. Forward the query request unchanged.
3. At its response, select **Read Cursor**, then **Edit**.
4. Change the `_display_name` string from `report.txt` to
   `../files/provider-proof.txt` and apply the response.
5. Forward the subsequent stream-open request. The app reports the actual
   destination and whether it is outside the cache.
6. Use **Check traversal proof** to verify the file. Repeat with
   **Import file · checked metadata filename** to observe rejection, and use
   **Reset traversal proof** to remove the demo file.

This demonstrates the consumer's behavior under modified metadata. An externally
exploitable issue also requires a reachable entry point and a provider/URI the
attacker can supply; in-process modification alone does not establish that.

Other cases exercise legacy and Bundle queries, empty/null/error results,
cancellation, insert/update/delete, file modes, concurrent calls, typed Cursor
cells, Blob rejection and a result exceeding the snapshot row limit.

The three **getType** buttons exercise an expected MIME type, an unknown type
and a null response. The playground shows how it interprets each value. In
noxen, select the corresponding call in History and read **Response → Value**
to see what Android returned.

For an incoming call from the emulator's shell UID:

```bash
adb -s emulator-5554 shell content query --uri content://dev.noxen.playground.providers/metadata
```

The signature-protected fixture denies the shell caller and may do so before
any provider event is captured:

```bash
adb -s emulator-5554 shell content query --uri content://dev.noxen.playground.providers.protected/notes
```

## MCP

**To Sender** in History copies complete query, getType, insert, update,
delete and call requests. A call with an opaque extras Bundle cannot be
reconstructed. File-descriptor opens in mode `r`, incoming `openFile` reads and
`openInputStream` captures become Sender file-read requests. Sender reads
through `openFileDescriptor` and uses its own capture limits. Write modes,
typed asset opens and partially captured query Bundles require a request
authored in Sender.

Query Bundles containing only SQL selection, selection arguments and sort
order can be copied to Sender when noxen confirms that all keys and types
were captured. Sender expresses these as its selection fields. Bundles with
additional keys and older captures without this completeness information
require a request authored in Sender.

`get_interception` and `wait_for_interception` include provider holds.
`set_intercept` controls the common interception state. `get_provider_interception`
returns the current provider connection and hold. `resolve_provider_interception`
accepts the exact provider connection and phase-specific decision ID: use
`inspect` to read a held Cursor, `forward` with the complete argument object or
Cursor table to apply edits, or `drop`. An active TUI draft must be finished or
cancelled first. `list_history` includes provider entries;
`list_provider_calls` also reads the persisted provider records.
