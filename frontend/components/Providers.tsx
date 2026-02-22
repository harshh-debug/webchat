"use client";

import { SessionProvider } from "next-auth/react";
import { AppProvider } from "@/context/AppContext";
import OAuthTokenSync from "@/components/OAuthTokenSync";

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AppProvider>
        <OAuthTokenSync />
        {children}
      </AppProvider>
    </SessionProvider>
  );
}