import type React from "react";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/providers/auth-provider";
import { Navbar } from "@/components/navbar/navbar";
import { TanstackProvider } from "@/providers/tanstack-provider";

export const metadata: Metadata = {
  title: "OVA System | Occupational Violence and Aggression",
  description:
    "A system for reporting and managing occupational violence and aggression incidents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`flex flex-col min-h-screen overflow-x-hidden`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
          <AuthProvider>
            <TanstackProvider>
              <Navbar />
              <div className="flex-1 flex flex-col pt-16">{children}</div>
              <Toaster />
            </TanstackProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
