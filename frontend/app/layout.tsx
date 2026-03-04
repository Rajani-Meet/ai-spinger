import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "AI-Springer | GitHub → Springer LNCS PDF",
    description:
        "Convert any GitHub repository into a publication-ready Springer LNCS formatted academic paper using 5 AI agents.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <head>
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>{children}</body>
        </html>
    );
}
