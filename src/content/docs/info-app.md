---
title: "Info app"
---

Info app shows what Android reports about the connected app, including its
signers, permissions, and manifest components. noxen requests this snapshot when
you connect and clears it when you disconnect. Select **Refresh** to update the
snapshot after an app state change or to retry a failed lookup.

- **Overview** shows app identity, build settings, signing, and component counts.
- **Permissions** distinguishes requested permissions and their grant state from permissions the app defines. **Defined by** identifies the declaring package when Android reports it.
- **Components** lists manifest activities, services, receivers, and providers. Select a row to see full permission names and provider-specific details. Search also matches read, write, and path permission names.

The inventory covers manifest declarations. Dynamically registered receivers and intent filters are outside its scope.

noxen queries Android's package manager from the target process. If a permission,
component detail, or signer hash is missing, the lookup may have failed or the
information may be unavailable to the app. Use the APK or other device evidence
to verify signing lineage. The displayed hashes identify the current APK signers.

## Access

noxen classifies exported components by the base protection level of their guarding permissions.

| Access | Permission guarding the component |
|---|---|
| `open` | None, `normal`, `unresolved`, or `unknown` |
| `weak` | `dangerous` |
| `protected` | `signature`, `signatureOrSystem`, or `internal` |

**Exposed only** keeps exported components classified as `open`, including disabled components. **Enabled** reflects the component's own setting, with runtime overrides taking precedence over the manifest default. Check caller permissions, app state, and platform restrictions separately before concluding that a component is reachable.

This classification uses the base protection level. Permission flags, caller-specific grants, and checks in app code can change effective access.

### Providers

noxen evaluates reads and writes separately and considers weaker permissions on
individual paths. For example, the table shows `open` if writes are open and
reads require a signature permission. Open the component detail to see the read,
write, and path permissions and the URI grant configuration. Android can grant
access to individual URIs even on a non-exported provider. [Android provider documentation](https://developer.android.com/guide/topics/manifest/provider-element)

### Unresolved permissions

`unresolved` means Android could not look up the permission from the target app. The permission may be undefined, or the declaring package may be hidden by package visibility. noxen includes both cases in `open` for review. `unknown` means noxen did not recognize the reported protection level.

To check what is defined on the device, inspect the declaring package and protection level in the output:

```bash
adb shell pm list permissions -f
```
