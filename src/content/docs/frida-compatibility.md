---
title: "Frida compatibility"
---

Match the host Python `frida` version to `frida-server` on Android. noxen has been tested with Frida 16.6.6 and 17.7.3. Hook behavior also depends on the Android runtime, the device's OEM changes, and the Java bridge.

## Runtime bundle

Normal installs ship the required agent bundles. Frida 17 needs the bundled Java bridge. If noxen reports a missing bundle, see [Troubleshooting](../troubleshooting/).

Updating the Python `frida` package does not change the Java bridge embedded in noxen's bundle. Verify any hook critical to your analysis with a known call, even when Log reports that it registered.

## Extra scripts

Extra scripts can use the `Java` bridge provided by the agent. See the [extra script contract](../running-noxen/#extra-script-contract) for startup timing, script formats, and error handling.

## Developer builds

After editing the agent, rebuild its JavaScript bundles and packaged copies. See [Developer-only bundle rebuild](../installation/#developer-only-bundle-rebuild).
