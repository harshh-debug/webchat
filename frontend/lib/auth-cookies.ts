import { cookies } from "next/headers";

const nextAuthSessionCookieNames = [
	"__Secure-next-auth.session-token",
	"next-auth.session-token",
];

/** Check for either WebChat's backend JWT or a NextAuth session cookie. */
export async function hasAuthCookie() {
	const cookieStore = await cookies();
	if (cookieStore.get("token")?.value) return true;

	return cookieStore.getAll().some(({ name, value }) =>
		Boolean(value) && nextAuthSessionCookieNames.some(
			(cookieName) => name === cookieName || name.startsWith(`${cookieName}.`),
		),
	);
}
