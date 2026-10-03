import { redirect } from "next/navigation";
import { hasAuthCookie } from "@/lib/auth-cookies";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
	if (!(await hasAuthCookie())) redirect("/login");
	return <ProfileClient />;
}
