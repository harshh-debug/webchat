"use client";
import { useAppData, user_service, User } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { toast } from "sonner";
import Loading from "@/components/Loading";
import { ArrowLeft, Loader2, Pencil, Save, User as UserIcon, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UpdateUserApiResponse {
  token: string;
  message: string;
  user: User;
}

const AVATAR_COLORS = [
  "bg-violet-500", "bg-blue-500", "bg-emerald-500", "bg-rose-500",
  "bg-amber-500", "bg-cyan-500", "bg-pink-500", "bg-indigo-500",
];

const getAvatarColor = (id: string) =>
  AVATAR_COLORS[
    id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length
  ];

const getInitials = (name: string) =>
  name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

const ProfilePage = () => {
  const { user, isAuth, loading, setUser } = useAppData();

  const [isEdit, setIsEdit] = useState(false);
  const [name, setName] = useState<string | undefined>("");
  const [isSaving, setIsSaving] = useState(false);

  const router = useRouter();

  const editHandler = () => {
    setIsEdit(!isEdit);
    setName(user?.name);
  };

  const submitHandler = async (e: any) => {
    e.preventDefault();
    const token = Cookies.get("token");
    setIsSaving(true);
    try {
      const { data } = await axios.post<UpdateUserApiResponse>(
        `${user_service}/api/v1/update/user`,
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Cookies.set("token", data.token, { expires: 15, secure: false, path: "/" });
      toast.success(data.message);
      setUser(data.user);
      setIsEdit(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!isAuth && !loading) router.push("/login");
  }, [isAuth, router, loading]);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0d0f13] flex flex-col">

      {/* ── Top nav bar ── */}
      <header className="sticky top-0 z-10 flex items-center gap-3 px-5 py-3.5 bg-white dark:bg-[#111318] border-b border-zinc-200 dark:border-white/[0.06]">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/[0.06]"
          onClick={() => router.push("/chat")}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-[14px] font-semibold text-zinc-800 dark:text-zinc-100 leading-none">
            Profile Settings
          </h1>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Manage your account information
          </p>
        </div>
      </header>

      {/* ── Page body ── */}
      <main className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-md space-y-4">

          {/* Avatar card */}
          <div className={cn(
            "rounded-xl border border-zinc-200 dark:border-white/[0.06]",
            "bg-white dark:bg-[#16181d] overflow-hidden"
          )}>
            {/* Color strip */}
            <div className={cn(
              "h-20",
              user ? getAvatarColor(user._id) : "bg-blue-500",
              "opacity-20 dark:opacity-10"
            )} />

            <div className="px-6 pb-6 -mt-10">
              <div className="flex items-end justify-between">
                <Avatar className="w-16 h-16 ring-4 ring-white dark:ring-[#16181d] shadow-sm">
                  <AvatarFallback className={cn(
                    user ? getAvatarColor(user._id) : "bg-blue-500",
                    "text-white text-[18px] font-semibold"
                  )}>
                    {user ? getInitials(user.name) : "U"}
                  </AvatarFallback>
                </Avatar>

                {/* Online dot */}
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[12px] text-emerald-500 font-medium">Active</span>
                </div>
              </div>

              <h2 className="mt-3 text-[16px] font-semibold text-zinc-800 dark:text-zinc-100">
                {user?.name ?? "User"}
              </h2>
              <p className="text-[12px] text-zinc-400 mt-0.5">
                Personal account
              </p>
            </div>
          </div>

          {/* Edit card */}
          <div className={cn(
            "rounded-xl border border-zinc-200 dark:border-white/[0.06]",
            "bg-white dark:bg-[#16181d] px-6 py-5"
          )}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[13px] font-semibold text-zinc-700 dark:text-zinc-200">
                  Display Name
                </p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  This is how others will see you
                </p>
              </div>
              {!isEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 rounded-lg text-[12px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-white/[0.06]"
                  onClick={editHandler}
                >
                  <Pencil className="w-3 h-3 mr-1.5" />
                  Edit
                </Button>
              )}
            </div>

            {isEdit ? (
              <form onSubmit={submitHandler} className="space-y-3">
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  autoFocus
                  className={cn(
                    "h-9 text-[13px] rounded-lg",
                    "bg-zinc-100 dark:bg-white/[0.05] border-transparent",
                    "text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400",
                    "focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:bg-white dark:focus-visible:bg-white/[0.08]",
                    "transition-all duration-150"
                  )}
                />
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSaving || !name?.trim()}
                    className="h-8 px-4 rounded-lg text-[12px] bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40"
                  >
                    {isSaving ? (
                      <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                    ) : (
                      <Save className="w-3 h-3 mr-1.5" />
                    )}
                    {isSaving ? "Saving…" : "Save changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 rounded-lg text-[12px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-white/[0.06]"
                    onClick={editHandler}
                  >
                    <X className="w-3 h-3 mr-1.5" />
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className={cn(
                "px-3.5 py-2.5 rounded-lg",
                "bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/[0.06]"
              )}>
                <span className="text-[13px] font-medium text-zinc-700 dark:text-zinc-200">
                  {user?.name ?? "Not set"}
                </span>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default ProfilePage;