"use client";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppData, user_service } from "@/context/AppContext";
import axios from "axios";
import { ArrowRight, Loader2 } from "lucide-react";
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
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0a0a0a]">
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 35% at 50% 0%, rgba(255,255,255,0.04) 0%, transparent 100%)",
        }}
      />

      <div className="relative z-10 w-full max-w-[360px] flex flex-col gap-4">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M2 3.5C2 2.67 2.67 2 3.5 2h7C11.33 2 12 2.67 12 3.5v5c0 .83-.67 1.5-1.5 1.5H8l-3 3v-3H3.5C2.67 10 2 9.33 2 8.5v-5z"
                fill="#0a0a0a"
              />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">WebChat</span>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-md px-7 py-8">
          {/* Heading */}
          <div className="flex flex-col items-center text-center mb-7">
            <h1 className="text-xl font-semibold text-white tracking-tight">
              Welcome back
            </h1>
            <p className="text-[13px] text-white/40 mt-1.5">
              Enter your email to continue
            </p>
          </div>

          {/* Form */}
          <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-medium text-white/40 tracking-wide uppercase">
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
                  "h-9 text-[13px] rounded-lg border-white/[0.08]",
                  "bg-white/[0.05] text-white placeholder:text-white/20",
                  "focus-visible:ring-1 focus-visible:ring-white/20 focus-visible:bg-white/[0.07]",
                  "transition-all duration-150"
                )}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-9 rounded-lg text-[13px] font-semibold bg-white text-[#0a0a0a] hover:bg-white/90 disabled:opacity-40 transition-all duration-150 mt-1"
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
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-white/[0.07]" />
            <span className="text-[11px] text-white/25 font-medium">or</span>
            <div className="flex-1 h-px bg-white/[0.07]" />
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className={cn(
              "w-full h-9 rounded-lg text-[13px] font-medium flex items-center justify-center gap-2.5",
              "bg-white/[0.04] border border-white/[0.08]",
              "text-white/70 hover:bg-white/[0.07] hover:text-white",
              "transition-all duration-150"
            )}
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-white/20 px-4">
          By continuing, you agree to our{" "}
          <span className="text-white/40 font-medium cursor-pointer hover:text-white/70 transition-colors">
            Terms of Service
          </span>{" "}
          and{" "}
          <span className="text-white/40 font-medium cursor-pointer hover:text-white/70 transition-colors">
            Privacy Policy
          </span>
        </p>
      </div>
    </div>
  );
};

export default Page;