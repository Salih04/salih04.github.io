import "@fontsource-variable/inter";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/source-serif-4";
import "@/styles/base.css";
import "@/styles/shell.css";
import "@/styles/lab.css";
import "@/styles/editorial.css";

import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/AppShell";
import { LabProvider } from "@/components/shell/LabProvider";
import { modePairs, site } from "@/content/site";

export const metadata: Metadata = {
  title: { default: `${site.mark} — ${site.labName}`, template: `%s · ${site.mark}` },
  description: site.description,
  applicationName: site.mark,
  openGraph: { title: `${site.mark} — ${site.labName}`, description: site.description, type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#0a0c0f",
  colorScheme: "dark",
};

/*
 * Sets the route's mode before first paint so a case-study route never
 * flashes the lab. Mode is derived from the route only (see modeForRoute);
 * nothing is read from storage, so unrelated pages never inherit it.
 */
const modeScript = `(function(){try{var p=location.pathname.replace(/\\/?$/,"/");var pairs=${JSON.stringify(modePairs)};var m="lab";for(var i=0;i<pairs.length;i++){if(p===pairs[i].caseStudy)m="case";}document.documentElement.dataset.mode=m;}catch(e){document.documentElement.dataset.mode="lab";}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-mode="lab" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: modeScript }} />
      </head>
      <body>
        <LabProvider>
          <AppShell>{children}</AppShell>
        </LabProvider>
      </body>
    </html>
  );
}
