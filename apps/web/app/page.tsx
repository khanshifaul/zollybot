"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Text } from "@/components/ui";

const BASE = "https://zollybot.shifaul.dev";

export default function Page() {
  const [version, setVersion] = useState<string | null>(null);

  useEffect(() => {
    fetch("/latest")
      .then((r) => r.text())
      .then((v) => setVersion(v.trim()))
      .catch(() => setVersion(null));
  }, []);

  const assets = version
    ? [
        { label: "AppImage", href: `/releases/${version}/zollybot-gui-${version}-x86_64.AppImage` },
        { label: "Linux tar.gz", href: `/releases/${version}/zollybot-linux-x86_64-${version}.tar.gz` },
        { label: "CLI", href: `/releases/${version}/zollybot-cli-linux-x86_64-${version}` },
        { label: "Android APK", href: `/releases/${version}/zollybot-android-arm64-${version}.apk` },
      ]
    : [];

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Badge>local-first</Badge>
      <Text as="h1" variant="h1" className="mt-4">
        ZollyBot
      </Text>
      <Text variant="lead" className="mt-2">
        One local-first workspace. Offices are repos.
      </Text>
      <Text variant="muted" className="mt-4">
        A local-first multi-agent desktop workspace for Codex, Claude, and Grok.
      </Text>

      <section className="mt-8">
        <Text as="h2" variant="h2">
          Install on Linux
        </Text>
        <pre className="mt-2 rounded-md bg-muted p-4 font-mono text-sm">
          <code>curl -fsSL https://zollybot.shifaul.dev/install.sh | sh</code>
        </pre>
        <Text variant="muted" className="mt-2">
          Installs two binaries into ~/.local/bin, verified against the release checksum.
        </Text>
      </section>

      <section className="mt-8">
        <Text as="h2" variant="h2">
          Download
        </Text>
        <Card className="mt-2">
          <CardContent className="pt-6">
            {version ? (
              <ul className="space-y-2">
                {assets.map((a) => (
                  <li key={a.href}>
                    <a className="text-primary underline" href={a.href}>
                      {a.label} — {version}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Loading release…</p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="mt-8">
        <Text as="h2" variant="h2">
          Platforms
        </Text>
        <table className="mt-2 w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Platform</th>
              <th className="text-left py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b">
              <td className="py-2">Linux x86_64</td>
              <td className="py-2">Supported</td>
            </tr>
            <tr>
              <td className="py-2">Android arm64</td>
              <td className="py-2">Supported</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="mt-8">
        <Text as="h2" variant="h2">
          How it fits together
        </Text>
        <ul className="mt-2 list-disc pl-6 space-y-1">
          <li>Office = repo.</li>
          <li>Files are the truth.</li>
          <li>Local first.</li>
        </ul>
      </section>
    </main>
  );
}
