import { redirect } from "next/navigation";
import { hasAuthCookie } from "@/lib/auth-cookies";
import ChatClient from "./ChatClient";

export default async function ChatPage() {
	if (!(await hasAuthCookie())) redirect("/login");
	return <ChatClient />;
}
