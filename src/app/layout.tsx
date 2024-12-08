import "../styles/main.scss";
import React, { ReactNode } from "react";
import type { Metadata } from "next";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blind Tasting App",
};

export type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta name="description" content="A fun app for wine enthusiasts!" />
      </head>
      <body>
        {/*       <Header /> */}
        {children}
        {/*    <Footer /> */}
      </body>
    </html>
  );
}
