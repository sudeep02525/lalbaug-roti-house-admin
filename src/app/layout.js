import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ClientLayoutWrapper } from "@/components/layout/ClientLayoutWrapper";
import NotificationListener from "@/components/NotificationListener";
import { Toaster } from "react-hot-toast";

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
            <Toaster 
              position="top-center" 
              reverseOrder={false}
              toastOptions={{
                className: '',
                style: {
                  background: '#114D3C',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  padding: '16px 24px',
                  borderRadius: '16px',
                  boxShadow: '0 10px 30px rgba(17,77,60,0.3)',
                },
              }}
            />
            <NotificationListener />
            {children}
          </ClientLayoutWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
