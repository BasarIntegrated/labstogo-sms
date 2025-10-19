import Layout from "@/components/layout/Layout";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Providers } from "@/components/providers/Providers";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Message Blasting App",
  description: "Professional SMS and email campaign management platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <QueryProvider>
            <Layout>{children}</Layout>
          </QueryProvider>
        </Providers>
      </body>
    </html>
  );
}
