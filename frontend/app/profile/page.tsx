"use client";
import { useAppData, user_service, User } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { toast } from "sonner";
import Loading from "@/components/Loading";
import { ArrowLeft, Save, User as UserIcon, UserCircle } from "lucide-react";

// ✅ shadcn/ui imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

// ✅ API response type
interface UpdateUserApiResponse {
  token: string;
  message: string;
  user: User;
}

const ProfilePage = () => {
  const { user, isAuth, loading, setUser } = useAppData();

  const [isEdit, setIsEdit] = useState(false);
  const [name, setName] = useState<string | undefined>("");

  const router = useRouter();

  const editHandler = () => {
    setIsEdit(!isEdit);
    setName(user?.name);
  };

  const submitHandler = async (e: any) => {
    e.preventDefault();
    const token = Cookies.get("token");
    try {
      const { data } = await axios.post<UpdateUserApiResponse>(
        `${user_service}/api/v1/update/user`,
        { name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Cookies.set("token", data.token, {
        expires: 15,
        secure: false,
        path: "/",
      });

      toast.success(data.message);
      setUser(data.user);
      setIsEdit(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Failed to update profile");
    }
  };

  useEffect(() => {
    if (!isAuth && !loading) {
      router.push("/login");
    }
  }, [isAuth, router, loading]);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-2xl mx-auto pt-8">

        {/* Back button + heading */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            size="icon"
            className="bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-300"
            onClick={() => router.push("/chat")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
            <p className="text-gray-400 mt-1">Manage your account information</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700 shadow-lg">

          {/* Avatar banner */}
          <div className="bg-gray-700 p-8 border-b border-gray-600">
            <div className="flex items-center gap-6">
              <div className="relative">
                {/* ✅ shadcn Avatar — UserCircle as fallback (no profilePic on User) */}
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="bg-gray-600">
                    <UserCircle className="w-12 h-12 text-gray-300" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-800" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">
                  {user?.name || "User"}
                </h2>
                <p className="text-gray-300 text-sm">Active now</p>
              </div>
            </div>
          </div>

          <Separator className="bg-gray-600" />

          {/* Form area */}
          <div className="p-8">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-3">
                  Display Name
                </label>

                {isEdit ? (
                  <form onSubmit={submitHandler} className="space-y-4">
                    {/* ✅ shadcn Input with icon */}
                    <div className="relative">
                      <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pr-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus-visible:ring-blue-500 focus-visible:ring-1"
                        placeholder="Enter your name"
                      />
                      <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>

                    <div className="flex gap-3">
                      {/* ✅ shadcn Button — save */}
                      <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>

                      {/* ✅ shadcn Button — cancel */}
                      <Button
                        type="button"
                        variant="secondary"
                        className="bg-gray-600 hover:bg-gray-700 text-white font-semibold"
                        onClick={editHandler}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-gray-700 rounded-lg border border-gray-600">
                    <span className="text-white font-medium text-lg">
                      {user?.name || "Not set"}
                    </span>
                    {/* ✅ shadcn Button — edit */}
                    <Button
                      variant="secondary"
                      className="bg-gray-600 hover:bg-gray-700 text-white font-semibold"
                      onClick={editHandler}
                    >
                      Edit
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfilePage;