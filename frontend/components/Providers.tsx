"use client";

import { SessionProvider } from "next-auth/react";
import { AppProvider } from "@/context/AppContext";
import OAuthTokenSync from "@/components/OAuthTokenSync";
import { SocketProvider } from "@/context/SocketContext";
import { TooltipProvider } from "./ui/tooltip";

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<SessionProvider>
			<AppProvider>
				<OAuthTokenSync />
				<TooltipProvider>
					<SocketProvider>{children}</SocketProvider>
				</TooltipProvider>
			</AppProvider>
		</SessionProvider>
	);
}
