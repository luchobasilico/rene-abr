import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Escriba Médico Ambiental",
  description: "Automatización de documentación clínica con IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans antialiased`} style={{ minHeight: "100vh", margin: 0 }}>
        <Providers>
          <noscript>
            <div style={{ padding: "2rem", textAlign: "center", fontFamily: "sans-serif" }}>
              Escriba Médico requiere JavaScript. Activálo para usar la app.
            </div>
          </noscript>
          {children}
        </Providers>
      </body>
    </html>
  );
}
