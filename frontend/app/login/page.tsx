"use client";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppData, user_service } from "@/context/AppContext";
import axios from "axios";
import { ArrowRight, Loader2, MessageSquare } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LoginResponse {
  message: string;
}

const Page = () => {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const { isAuth, loading: userLoading } = useAppData();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post<LoginResponse>(
        `${user_service}/api/v1/login`,
        { email }
      );
      toast.success(data.message);
      router.push(`/verify?email=${email}`);
    } catch (error: any) {
      toast.error(error.response?.data.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    await signIn("google", { callbackUrl: "/chat" });
  };

  useEffect(() => {
    if (!userLoading && isAuth) router.replace("/chat");
  }, [isAuth, userLoading, router]);

  if (userLoading) return <Loading />;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-zinc-50 dark:bg-[#0d0f13]">
      <div className="w-full max-w-[380px] space-y-3">

        {/* Card */}
        <div className={cn(
          "rounded-2xl border border-zinc-200 dark:border-white/[0.06]",
          "bg-white dark:bg-[#16181d] px-8 py-8 shadow-sm"
        )}>
          {/* Logo + heading */}
          <div className="flex flex-col items-center text-center mb-7">
            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm mb-4">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-[18px] font-semibold text-zinc-800 dark:text-zinc-100 tracking-tight">
              Welcome back
            </h1>
            <p className="text-[13px] text-zinc-400 mt-1">
              Enter your email to continue
            </p>
          </div>

          {/* Form */}
          <form className="space-y-3" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-[12px] font-medium text-zinc-600 dark:text-zinc-400">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn(
                  "h-9 text-[13px] rounded-lg",
                  "bg-zinc-100 dark:bg-white/[0.05] border-transparent",
                  "text-zinc-800 dark:text-zinc-100 placeholder:text-zinc-400",
                  "focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:bg-white dark:focus-visible:bg-white/[0.08]",
                  "transition-all duration-150"
                )}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-9 rounded-lg text-[13px] font-medium bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-all duration-150"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Sending code…
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-zinc-200 dark:bg-white/[0.06]" />
            <span className="text-[11px] text-zinc-400 font-medium">or</span>
            <div className="flex-1 h-px bg-zinc-200 dark:bg-white/[0.06]" />
          </div>

          {/* Google */}
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full h-9 rounded-lg text-[13px] font-medium",
              "border-zinc-200 dark:border-white/[0.08]",
              "bg-white dark:bg-white/[0.03] hover:bg-zinc-50 dark:hover:bg-white/[0.06]",
              "text-zinc-700 dark:text-zinc-300",
              "transition-all duration-150"
            )}
            onClick={handleGoogleLogin}
          >
            {/* Google SVG icon */}
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>
        </div>

        {/* Footer note */}
        <p className="text-center text-[11px] text-zinc-400 px-4">
          By continuing, you agree to our{" "}
          <span className="text-zinc-500 dark:text-zinc-300 font-medium cursor-pointer hover:underline">
            Terms of Service
          </span>{" "}
          and{" "}
          <span className="text-zinc-500 dark:text-zinc-300 font-medium cursor-pointer hover:underline">
            Privacy Policy
          </span>
        </p>
      </div>
    </div>
  );
};

export default Page;