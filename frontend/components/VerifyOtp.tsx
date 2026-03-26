"use client";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
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

          {/* Back */}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="flex items-center gap-1.5 mb-6 text-[12px] font-medium text-white/30 hover:text-white/60 transition-colors duration-150"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to login
          </button>

          {/* Heading */}
          <div className="flex flex-col items-center text-center mb-7">
 <div className="w-11 h-11 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center mb-4">
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.75">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </svg>
</div>
            <h1 className="text-xl font-semibold text-white tracking-tight">
              Check your email
            </h1>
            <p className="text-[13px] text-white/40 mt-1.5 leading-relaxed">
              We sent a 6-digit code to{" "}
              <span className="text-white/70 font-medium">{email}</span>
            </p>
          </div>

          {/* OTP inputs */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                    "w-11 h-12 text-center text-lg font-semibold rounded-xl outline-none",
                    "border transition-all duration-150",
                    "bg-white/[0.05] text-white caret-white",
                    digit
                      ? "border-white/30 bg-white/[0.08]"
                      : "border-white/[0.08]",
                    "focus:border-white/30 focus:bg-white/[0.08]",
                    error ? "border-red-500/50 bg-red-500/[0.06]" : ""
                  )}
                />
              ))}
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg bg-red-500/[0.08] border border-red-500/20 px-3.5 py-2.5">
                <p className="text-[12px] text-red-400 text-center">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-9 rounded-lg text-[13px] font-semibold bg-white text-[#0a0a0a] hover:bg-white/90 disabled:opacity-40 transition-all duration-150"
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
              <p className="text-[12px] text-white/25">
                Resend code in{" "}
                <span className="font-semibold text-white/50 tabular-nums">
                  {timer}s
                </span>
              </p>
            ) : (
              <div className="flex items-center justify-center gap-1.5">
                <p className="text-[12px] text-white/30">Didn't receive it?</p>
                <button
                  type="button"
                  disabled={resendLoading}
                  onClick={handleResendOtp}
                  className="text-[12px] font-semibold text-white/60 hover:text-white disabled:opacity-40 transition-colors duration-150"
                >
                  {resendLoading ? "Sending…" : "Resend code"}
                </button>
              </div>
            )}
          </div>
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

export default VerifyOtp;