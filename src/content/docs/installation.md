---
title: "Installation"
description: Install noxen on the host and run frida-server on the Android device.
---

noxen runs on your computer and connects to `frida-server` on an Android device or
emulator.

## Requirements

- Python 3.10 or later.
- A terminal with true color and Unicode support. On Windows, use
  [Windows Terminal](https://apps.microsoft.com/detail/9n0dx20hk701); the classic
  console does not render the interface correctly.
- An Android device or emulator running `frida-server`.

## Install noxen

Create and activate a virtual environment:

```bash
python -m venv .venv
source .venv/bin/activate
```

On Windows PowerShell, activate it with `.\.venv\Scripts\Activate.ps1`.

Install the Frida Python package with the same version as `frida-server` on the
device, then install noxen:

```bash
pip install frida==17.7.3
git clone https://github.com/frankheat/noxen.git
cd noxen
pip install .
```

Frida is installed separately so that you can pin the version that matches your
device. noxen has been tested with Frida 16.6.6 and 17.7.3.

To also install [`noxen-analyze`](../apk-analysis/), add the analysis extra:

```bash
pip install ".[analyze]"
```

## Start noxen

```bash
noxen
```

noxen opens a new project in the current directory. To name the project or reopen
one, see [Projects](../projects/).

## See also

- [Quick start](../quick-start/)
- [Troubleshooting](../troubleshooting/)
