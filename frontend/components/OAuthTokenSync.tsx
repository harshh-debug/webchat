"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import Cookies from "js-cookie";
import { useAppData } from "@/context/AppContext";

const OAuthTokenSync = () => {
  const { data: session } = useSession();
  const { setIsAuth, setUser, fetchChats, fetchUsers } = useAppData();

  useEffect(() => {
    if (session?.backendToken) {
      Cookies.set("token", session.backendToken, {
        expires: 15,
        path: "/",
      });
      async function syncUser() {
        try {
          await fetchUsers();
          await fetchChats();
          setIsAuth(true);
          setUser(session?.authUser);
        } catch (err) {
          console.log(err);
        }
      }

      syncUser();
    }
  }, [session]);

  return null;
};

export default OAuthTokenSync;