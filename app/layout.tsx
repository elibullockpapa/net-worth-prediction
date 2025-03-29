import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";

import { Providers } from "./providers";

import { fontSans } from "@/config/fonts";

export const metadata: Metadata = {
    title: "Net Worth Calculator | Advanced Financial Projection Tool",
    description:
        "Advanced net worth projection with 150+ years of real S&P 500 data. Toggle dividends, set custom salary steps. Run historical backtests for robust analysis.",
    keywords:
        "net worth calculator, financial planning, investment calculator, S&P 500 returns, historical returns, financial projection, retirement planning, wealth calculator",
    authors: [{ name: "Eli Bullock-Papa" }],
    creator: "Eli Bullock-Papa",
    publisher: "Eli Bullock-Papa",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL("https://net-worth-calculator.com"),
    openGraph: {
        type: "website",
        locale: "en_US",
        url: "https://net-worth-calculator.com",
        title: "Net Worth Calculator | Advanced Financial Backtesting Tool",
        description:
            "Advanced net worth projection with 150+ years of real S&P 500 data. Toggle dividends, set custom salary steps. Run historical backtests for robust analysis.",
        siteName: "Net Worth Calculator",
        images: [
            {
                url: "/og-image.png", // You'll need to create this image
                width: 1200,
                height: 630,
                alt: "Net Worth Calculator Preview",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Net Worth Calculator | Advanced Financial Backtesting Tool",
        description:
            "Advanced net worth projection with 150+ years of real S&P 500 data. Toggle dividends, set custom salary steps. Run historical backtests for robust analysis.",
        images: ["/og-image.png"], // Same image as OpenGraph
        creator: "@networthcalc",
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
    verification: {
        google: "your-google-site-verification", // Add your Google verification code
    },
    icons: {
        icon: "/favicon.ico",
        apple: "/apple-touch-icon.png", // You'll need to create this icon
    },
    manifest: "/manifest.json", // You'll need to create this manifest file
};

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "white" },
        { media: "(prefers-color-scheme: dark)", color: "black" },
    ],
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html suppressHydrationWarning lang="en">
            <head />
            <body
                className={clsx(
                    "min-h-screen bg-background font-sans antialiased",
                    fontSans.variable,
                )}
            >
                <Providers
                    themeProps={{ attribute: "class", defaultTheme: "dark" }}
                >
                    {children}
                </Providers>
            </body>
        </html>
    );
}
