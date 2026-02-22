	import NextAuth from "next-auth";
	import GoogleProvider from "next-auth/providers/google";
	import axios from "axios";


	interface AuthUser {
		_id: string;
		name: string;
		email: string;
	}
	interface OauthResponse {
		message: string;
		token: string;
		user: AuthUser;
	}

	const handler = NextAuth({
		providers: [
			GoogleProvider({
				clientId: process.env.GOOGLE_CLIENT_ID!,
				clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			}),
		],

		callbacks: {
			async signIn({ account,user }) {
				try {
					const idToken = account?.id_token;

					if (!idToken) return false;

					const response = await axios.post<OauthResponse>(`${process.env.USER_SERVICE}/api/v1/oauth`, {
						idToken,
					});

					// Attach your backend JWT
					user.backendToken = response.data.token;
					user.authUser=response.data.user

					return true;
				} catch (error) {
					console.log("OAuth backend error:", error);
					return false;
				}
			},

			async jwt({ token, user }) {
				if (user?.backendToken && user?.authUser) {
					token.backendToken = user.backendToken;
					token.authUser=user.authUser
				}
				return token;
			},

			async session({ session, token }) {
				session.backendToken = token.backendToken;
				session.authUser=token.authUser
				return session;
			},
		},
	});

	export { handler as GET, handler as POST };
