import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "RSL Cards - The Dealer App for Card Shows",
  description:
    "Scan comps, buy and sell in seconds, track your profit. RSL Cards Pro is built for card shows and multi-channel selling.",
  icons: {
    icon: [
      { url: "/rslicon.jpeg", type: "image/jpeg" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/rslicon.jpeg",
    apple: "/rslicon.jpeg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="icon" href="/rslicon.jpeg" type="image/jpeg" />
        <link rel="shortcut icon" href="/rslicon.jpeg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/rslicon.jpeg" />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            style: {
              background: "#111111",
              border: "1px solid #2a2a2a",
              color: "#ffffff",
            },
          }}
        />
      </body>
    </html>
  );
}
