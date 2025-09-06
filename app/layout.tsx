import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthenticationContext";
import { ContextProvider } from "@/context/DashboardContext";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Coding Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ContextProvider>
            {children}
            <Toaster />
          </ContextProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
