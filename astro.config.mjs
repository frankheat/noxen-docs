import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  site: "https://frankheat.github.io",
  base: "/noxen-docs",
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
          label: "Start here",
          items: [
            { label: "Overview", slug: "index" },
            { label: "Installation", slug: "installation" },
            { label: "Quick start", slug: "quick-start" },
            { label: "noxen playground", slug: "noxen-playground" },
          ],
        },
        {
          label: "Using noxen",
          items: [
            { label: "The interface", slug: "running-noxen" },
            { label: "Intercepting and modifying", slug: "intercepting-and-modifying" },
            { label: "Filters", slug: "filters" },
            { label: "History and projects", slug: "history-and-projects" },
            { label: "Commands", slug: "commands" },
          ],
        },
        {
          label: "Reliability",
          items: [
            { label: "Troubleshooting", slug: "troubleshooting" },
            { label: "Android behavior and limits", slug: "android-behavior-and-limits" },
          ],
        },
        {
          label: "Advanced",
          items: [
            { label: "Hook configuration", slug: "hook-configuration" },
            { label: "APK analysis", slug: "apk-analysis" },
            { label: "Frida compatibility", slug: "frida-compatibility" },
          ],
        },
      ],
      customCss: ["./src/styles/custom.css"],
    }),
  ],
});
