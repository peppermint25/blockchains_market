import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Blockchain-based Secondhand Market",
  description: "Blockchain-based Secondhand Market, the second hand market built for your peace of mind.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body
        className="antialiased"
        style={{ fontFamily: 'var(--font-montserrat), sans-serif' }}
      >
        {children}
      </body>
    </html>
  );
}
