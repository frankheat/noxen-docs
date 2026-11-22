import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  site: "https://frankheat.github.io",
  base: "/noxen-docs",
  // Pages renamed to match the interface: old links keep working.
  redirects: {
    "/running-noxen": "/noxen-docs/home/",
    "/intercepting-and-modifying": "/noxen-docs/intercept/",
    "/history-and-projects": "/noxen-docs/history/",
    "/frida-compatibility": "/noxen-docs/installation/",
  },
  integrations: [
    starlight({
      title: "noxen",
      description: "Map Android component communication and attack-surface behavior at runtime.",
      favicon: "/favicon.svg",
      logo: {
        src: "./src/assets/logo.svg",
        alt: "noxen",
        replacesTitle: true,
      },
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/frankheat/noxen",
        },
      ],
      sidebar: [
        {
          label: "Getting started",
          items: [
            { label: "Overview", slug: "index" },
            { label: "Installation", slug: "installation" },
            { label: "Quick start", slug: "quick-start" },
            { label: "noxen playground", slug: "noxen-playground" },
          ],
        },
        {
          label: "Tabs",
          items: [
            { label: "Home", slug: "home" },
            { label: "Intercept", slug: "intercept" },
            { label: "History", slug: "history" },
            { label: "Monitor", slug: "monitor" },
            { label: "Providers", slug: "providers" },
            { label: "Sender", slug: "sender" },
            { label: "Info app", slug: "info-app" },
            { label: "MCP", slug: "mcp" },
            { label: "Log", slug: "log" },
            { label: "Settings", slug: "settings" },
          ],
        },
        {
          label: "Reference",
          items: [
            { label: "Commands", slug: "commands" },
            { label: "Keyboard shortcuts", slug: "keyboard-shortcuts" },
            { label: "Filters", slug: "filters" },
            { label: "Hook configuration", slug: "hook-configuration" },
            { label: "APK analysis", slug: "apk-analysis" },
            { label: "Projects", slug: "projects" },
          ],
        },
        {
          label: "Troubleshooting",
          items: [
            { label: "Troubleshooting", slug: "troubleshooting" },
            { label: "Android behavior and limits", slug: "android-behavior-and-limits" },
          ],
        },
      ],
      customCss: ["./src/styles/custom.css"],
    }),
  ],
});
