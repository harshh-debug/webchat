import { redirect } from "next/navigation";
import { hasAuthCookie } from "@/lib/auth-cookies";
import LoginClient from "./LoginClient";

export default async function LoginPage() {
	if (await hasAuthCookie()) redirect("/chat");
	return <LoginClient />;
}
