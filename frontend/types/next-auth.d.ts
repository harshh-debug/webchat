import { DefaultSession } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";
interface AuthUser {
  _id: string;
  name: string;
  email: string;
}

declare module "next-auth" {
  interface User {
    backendToken?: string;
    authUser?
  }

  interface Session {
    backendToken?: string;
    authUser?
    user: DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    backendToken?: string;
    authUser?
  }
}