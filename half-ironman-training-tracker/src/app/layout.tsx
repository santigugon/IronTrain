import type { Metadata } from "next";
import { Caveat_Brush, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@schedule-x/theme-shadcn/dist/index.css";
import { Toaster } from "@/components/ui/sonner";

const caveatBrush = Caveat_Brush({
  variable: "--font-caveat-brush",
  subsets: ["latin"],
  weight: "400",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Half IronMan Tracker",
  description: "Mobile training calendar and streak tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${caveatBrush.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
