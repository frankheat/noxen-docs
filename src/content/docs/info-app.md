---
title: "Info app"
description: Review the connected app's identity, signers, permissions and manifest components.
---

The **Info app** tab shows what Android reports about the connected app: its identity,
signers, permissions and manifest components. noxen reads it when you connect.
**Refresh** (`Ctrl+G`) reads it again.

| View | Shows |
| --- | --- |
| Overview | Package, version, build flags, signer hashes and component counts |
| Permissions | Permissions the app requests, with their grant state, and permissions it defines. **Defined by** names the declaring package |
| Components | Activities, services, receivers and providers from the manifest, with their access |

Select a component to see its full permissions and, for a provider, its authority and
URI grant settings. **To Sender** (`Ctrl+R`) prepares a [Sender](../sender/) request for
the selected component.

Info app covers the manifest. Receivers registered at runtime are not listed. If a
value is missing, the app may not be allowed to read it.

## Access

noxen classifies each exported component by the protection level of the permission
that guards it.

| Access | Permission |
| --- | --- |
| `open` | None, `normal`, `unresolved` or `unknown` |
| `weak` | `dangerous` |
| `protected` | `signature`, `signatureOrSystem` or `internal` |

**Exposed only** shows the exported components classified `open`, including disabled
ones. **Enabled** shows the component's state, including changes made at runtime.

The classification uses the base protection level. Permission flags, grants to specific
callers and checks in the app's code can change who can actually reach a component.

### Providers

A provider is classified by its weaker direction: if writes are open and reads need a
signature permission, it is `open`. A path permission counts as an alternative grant.
Android can also grant access to single URIs of a provider that is not exported. See
[`<provider>`](https://developer.android.com/guide/topics/manifest/provider-element).

### Unresolved permissions

`unresolved` means the app could not look the permission up: no package defines it, or
the defining package is hidden from the app by package visibility. Both are classified
`open` so that you review them. `unknown` is a protection level noxen does not
recognize.

To see which package defines a permission on the device:

```bash
adb shell pm list permissions -f
```
