import type { Metadata, Viewport } from "next";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";
import { profile } from "@/content/profile";
import Nav from "@/components/Nav";
import ChatBot from "@/components/ChatBot";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const description = `${profile.role} in ${profile.location}. ${profile.tagline}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${profile.name} — ${profile.role}`,
    template: `%s · ${profile.name}`,
  },
  description,
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: profile.name,
    description,
    type: "website",
    url: "/",
  },
  twitter: { card: "summary", title: profile.name, description },
};

export const viewport: Viewport = {
  themeColor: "#07090a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Nav />
        <main id="main">{children}</main>
        <ChatBot />
      </body>
    </html>
  );
}
