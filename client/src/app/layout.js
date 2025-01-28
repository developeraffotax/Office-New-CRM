"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/authContext";
import SocketHandler from "./context/SocketHandler";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} w-full min-h-screen bg-white text-black`}
      >
        <AuthProvider>
          <main className="overflow-x-hidden">{children}</main>
          <Toaster />
          <SocketHandler />
        </AuthProvider>
      </body>
    </html>
  );
}
