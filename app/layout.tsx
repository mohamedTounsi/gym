import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TITAN IRON | Brotherhood Gym & Machine Leaderboards",
  description: "Track your gym days, charge weight on machines, compete on leaderboards, and encourage your gym bros.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased bg-[#050507] text-white">
      <body className="min-h-full flex flex-col bg-[#050507] text-white gym-grid-pattern selection:bg-red-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
