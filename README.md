# noxen documentation

This repository contains the public documentation website for [noxen](https://github.com/frankheat/noxen),
an Android runtime interception tool for mapping component communication and attack-surface behavior.

The documentation also covers [noxen-playground](https://github.com/frankheat/noxen-playground),
the companion Android target app used to validate noxen against known Activity, BroadcastReceiver,
Service, PendingIntent, concurrent broadcast, and attack-surface flows.

The published site is at **https://frankheat.github.io/noxen-docs/**.

## Development

Install dependencies:

```bash
npm install
```

Run the local development server:

```bash
npm run dev
```

Build the static site:

```bash
npm run build
```

## Publishing

The site is built with Astro Starlight and deployed to GitHub Pages through the
workflow in `.github/workflows/pages.yml`.
