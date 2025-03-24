import { Geist, Geist_Mono } from "next/font/google";
import { Fira_Code } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata = {
  title: "Agent & Orchestrator Developer Tool",
  description: "A modern, intuitive developer tool for creating and managing AI agent workflows",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${firaCode.variable} antialiased bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark`}
      >
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
