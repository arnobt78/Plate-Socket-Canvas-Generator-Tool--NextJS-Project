import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "R24 - Plate & Socket Generator",
  description:
    "Interactive German plate and socket generator with drag-and-drop positioning, real-time validation, and responsive design. Build custom electrical plate configurations with precise centimeter-based measurements.",
  keywords: [
    "plate generator",
    "socket generator",
    "electrical plates",
    "Rückwand",
    "Steckdose",
    "socket positioning",
    "drag and drop",
    "electrical design",
    "interactive canvas",
    "responsive design",
    "touch interaction",
    "plate configuration",
    "R24",
  ],
  authors: [
    {
      name: "Arnob Mahmud",
      url: "https://arnob-mahmud.vercel.app/",
    },
  ],
  creator: "Arnob Mahmud",
  publisher: "Arnob Mahmud",
  applicationName: "R24 - Plate & Socket Generator",
  category: "Electrical Design Tools",
  openGraph: {
    title: "R24 - Plate & Socket Generator",
    description:
      "Interactive German plate and socket generator with drag-and-drop positioning and real-time validation",
    url: "https://arnob-mahmud.vercel.app/",
    siteName: "Plate & Socket Generator",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "R24 - Plate & Socket Generator",
    description:
      "Interactive German plate and socket generator with drag-and-drop positioning",
    creator: "@arnob_t78",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
