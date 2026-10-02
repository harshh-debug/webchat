"use client";

import { SessionProvider } from "next-auth/react";
import { AppProvider } from "@/context/AppContext";
import { SocketProvider } from "@/context/SocketContext";
import { TooltipProvider } from "./ui/tooltip";
import { ThemeProvider } from "next-themes";

export default function Providers({ children }: { children: React.ReactNode }) {
	return (
		<SessionProvider>
			<ThemeProvider
				attribute="class"
				defaultTheme="system"
				enableSystem
				disableTransitionOnChange
			>
				<AppProvider>
					<TooltipProvider>
						<SocketProvider>{children}</SocketProvider>
					</TooltipProvider>
				</AppProvider>
			</ThemeProvider>
		</SessionProvider>
	);
}
