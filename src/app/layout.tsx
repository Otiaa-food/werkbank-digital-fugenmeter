import type { Metadata, Viewport } from "next";
import { Fraunces, DM_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const display = Fraunces({
  variable: "--font-display",
  weight: ["600", "700", "800"],
  subsets: ["latin"],
});
const body = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});
const mono = IBM_Plex_Mono({
  variable: "--font-mono",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Maßwerk",
  description: "Digitales Aufmaß für Handwerksbetriebe",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Maßwerk",
  },
};

export const viewport: Viewport = {
  themeColor: "#1F6B58",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="de"
      className={`${display.variable} ${body.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#E3EEE7] font-[family-name:var(--font-body)] text-[#12261D]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
