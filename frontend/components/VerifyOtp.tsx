"use client";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import { ArrowLeft, ArrowRight, Loader2, MessageSquare, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAppData, user_service } from "@/context/AppContext";
import Loading from "./Loading";
import axios from "axios";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface VerifyResponse {
  message: string;
  token: string;
  user: User;
}

const VerifyOtp = () => {
  const { isAuth, setIsAuth, setUser, loading: userLoading, fetchChats, fetchUsers } = useAppData();
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string>("");
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputRef = useRef<Array<HTMLInputElement | null>>([]);
  const router = useRouter();
  const params = useSearchParams();
  const email: string = params.get("email") || "";

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  useEffect(() => {
    if (isAuth) router.push("/chat");
  }, [isAuth, router]);

  const handleInputChange = (index: number, value: string): void => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");
    if (value && index < 5) inputRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLElement>): void => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>): void => {
    e.preventDefault();
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (digits.length === 6) {
      setOtp(digits.split(""));
      inputRef.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { data } = await axios.post<VerifyResponse>(
        `${user_service}/api/v1/verify`,
        { email, otp: otpString }
      );
      toast.success(data.message);
      Cookies.set("token", data.token, { expires: 15, secure: false, path: "/" });
      setOtp(["", "", "", "", "", ""]);
      inputRef.current[0]?.focus();
      setUser(data.user);
      setIsAuth(true);
      fetchChats();
      fetchUsers();
    } catch (error: any) {
      setError(
        error?.response?.data?.message || error?.message || "Unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    setError("");
    try {
      const { data } = await axios.post<VerifyResponse>(
        `${user_service}/api/v1/login`,
        { email }
      );
      toast.success(data.message);
      setTimer(60);
    } catch (error: any) {
      setError(
        error?.response?.data?.message || error?.message || "Unexpected error occurred"
      );
    } finally {
      setResendLoading(false);
    }
  };

  if (userLoading) return <Loading />;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-zinc-50 dark:bg-[#0d0f13]">
      <div className="w-full max-w-[380px] space-y-3">

        {/* Card */}
        <div className={cn(
          "rounded-2xl border border-zinc-200 dark:border-white/[0.06]",
          "bg-white dark:bg-[#16181d] px-8 py-8 shadow-sm"
        )}>

          {/* Back */}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className={cn(
              "flex items-center gap-1.5 mb-6",
              "text-[12px] font-medium text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200",
              "transition-colors duration-150"
            )}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to login
          </button>

          {/* Logo + heading */}
          <div className="flex flex-col items-center text-center mb-7">
            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm mb-4">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-[18px] font-semibold text-zinc-800 dark:text-zinc-100 tracking-tight">
              Check your email
            </h1>
            <p className="text-[13px] text-zinc-400 mt-1.5 leading-relaxed">
              We sent a 6-digit code to{" "}
              <span className="text-blue-500 font-medium">{email}</span>
            </p>
          </div>

          {/* OTP inputs */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el: HTMLInputElement | null) => { inputRef.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className={cn(
                    "w-11 h-12 text-center text-[18px] font-semibold rounded-lg",
                    "border transition-all duration-150 outline-none",
                    "bg-zinc-100 dark:bg-white/[0.05]",
                    "text-zinc-800 dark:text-zinc-100",
                    digit
                      ? "border-blue-500 ring-1 ring-blue-500/30"
                      : "border-zinc-200 dark:border-white/[0.08]",
                    "focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30",
                    error ? "border-red-400 dark:border-red-500" : ""
                  )}
                />
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-3.5 py-2.5">
                <p className="text-[12px] text-red-600 dark:text-red-400 text-center">
                  {error}
                </p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-9 rounded-lg text-[13px] font-medium bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 transition-all duration-150"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Verifying…
                </>
              ) : (
                <>
                  Verify code
                  <ArrowRight className="w-3.5 h-3.5 ml-2" />
                </>
              )}
            </Button>
          </form>

          {/* Resend */}
          <div className="mt-5 text-center">
            {timer > 0 ? (
              <p className="text-[12px] text-zinc-400">
                Resend code in{" "}
                <span className="font-semibold text-zinc-600 dark:text-zinc-300 tabular-nums">
                  {timer}s
                </span>
              </p>
            ) : (
              <div className="flex items-center justify-center gap-1.5">
                <p className="text-[12px] text-zinc-400">Didn't receive it?</p>
                <button
                  type="button"
                  disabled={resendLoading}
                  onClick={handleResendOtp}
                  className={cn(
                    "text-[12px] font-semibold text-blue-500 hover:text-blue-600",
                    "disabled:opacity-50 transition-colors duration-150"
                  )}
                >
                  {resendLoading ? "Sending…" : "Resend code"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Branding footer */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-5 h-5 rounded-md bg-blue-600 flex items-center justify-center">
            <MessageSquare className="w-3 h-3 text-white" />
          </div>
          <span className="text-[12px] font-medium text-zinc-400">ChatRoom</span>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;