import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ClientLayoutWrapper } from "@/components/layout/ClientLayoutWrapper";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata = {
  title: "Lalbaug Roti House Admin",
  description: "Admin Dashboard for Lalbaug Roti House",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased min-h-screen bg-[var(--background)]`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ClientLayoutWrapper>
            {children}
          </ClientLayoutWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
