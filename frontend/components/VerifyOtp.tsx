"use client";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import Cookies from "js-cookie";
import { Label } from "@/components/ui/label";
import { ArrowRight, ChevronLeft, Loader2, Lock } from "lucide-react";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAppData, user_service } from "@/context/AppContext";
import Loading from "./Loading";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface VerifyResponse {
	message: string;
	token: string;
	user:User
}

const VerifyOtp = () => {
	const{isAuth,setIsAuth,setUser,loading:userLoading}=useAppData()
	const [loading, setLoading] = useState(false);
	const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
	const [error, setError] = useState<string>("");
	const [resendLoading, setResendLoading] = useState(false);
	const [timer, setTimer] = useState(60);
	const inpuRef = useRef<Array<HTMLInputElement | null>>([]);
	const router = useRouter();
	const params = useSearchParams();

	const email: string = params.get("email") || "";

	useEffect(() => {
		if (timer > 0) {
			const interval = setInterval(() => {
				setTimer((prev) => prev - 1);
			}, 1000);
			return () => clearInterval(interval);
		}
	}, [timer]);

	const handleInputChange = (index: number, value: string): void => {
		if (value.length > 1) return;
		const newOtp = [...otp];
		newOtp[index] = value;
		setOtp(newOtp);
		setError("");
		if (value && index < 5) {
			inpuRef.current[index + 1]?.focus();
		}
	};

	const handleKeyDown = (
		index: number,
		e: React.KeyboardEvent<HTMLElement>,
	): void => {
		if (e.key === "Backspace" && !otp[index] && index > 0) {
			inpuRef.current[index - 1]?.focus();
		}
	};

	const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>): void => {
		e.preventDefault();
		const pastedData = e.clipboardData.getData("text");
		const digits = pastedData.replace(/\D/g, "").slice(0, 6);
		if (digits.length === 6) {
			const newOtp = digits.split("");
			setOtp(newOtp);
			inpuRef.current[5]?.focus();
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
				{
					email,
					otp: otpString,
				},
			);
			alert(data.message);
			Cookies.set("token", data.token, {
				expires: 15,
				secure: false,
				path: "/",
			});
			setOtp(["", "", "", "", "", ""]);
			inpuRef.current[0]?.focus();
			setUser(data.user)
			setIsAuth(true)
		} catch (error: any) {
			setError(error.response.data.message);
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
				{
					email
				},
			);
			alert(data.message);
			setTimer(60);
		} catch (error: any) {
			setError(error.response.data.message);
		} finally {
			setResendLoading(false);
		}
	};

	if(userLoading){
		return <Loading></Loading>
	}

	if(isAuth){
		router.push("/chat")
	}
	return (
		<div className="min-h-screen flex justify-center items-center px-4">
			<Card className="w-full max-w-sm">
				<CardHeader className="relative text-center space-y-2">
					<button
						type="button"
						onClick={() => router.push("/login")}
						className="absolute left-4 top-4 p-2 rounded-full hover:bg-gray-200 transition"
					>
						<ChevronLeft className="w-5 h-5 text-gray-700" />
					</button>

					<div className="flex justify-center">
						<Lock size={50} className="text-primary" />
					</div>

					<CardTitle className="text-xl">Verify Your Email</CardTitle>

					<CardDescription className="text-sm">
						We have sent a 6-digit code to
						<p className="text-blue-400 font-medium">{email}</p>
					</CardDescription>
				</CardHeader>

				<CardContent>
					<form className="space-y-4" onSubmit={handleSubmit}>
						<div className="grid gap-1.5">
							<Label className="text-center">Enter your 6 digit otp here</Label>
							<div className="flex justify-center in-checked:space-x-3">
								{otp.map((digit, index) => (
									<input
										key={index}
										ref={(el: HTMLInputElement | null) => {
											inpuRef.current[index] = el;
										}}
										type="text"
										maxLength={1}
										value={digit}
										onChange={(e) => handleInputChange(index, e.target.value)}
										onKeyDown={(e) => handleKeyDown(index, e)}
										onPaste={index === 0 ? handlePaste : undefined}
										className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-600 rounded-lg bg-gray-100 text-black mr-2"
									/>
								))}
							</div>
						</div>
						{error && (
							<div className="bg-red-900 border-red-700 rounded-lg p-3">
								<p className="text-red-300 text-sm text-center">{error}</p>
							</div>
						)}

						<Button type="submit" className="w-full" disabled={loading}>
							{loading ? (
								<div className="flex items-center justify-center gap-2">
									<Loader2>Verifying...</Loader2>
								</div>
							) : (
								<div className="flex align-baseline">
									Verify
									<ArrowRight className="ml-2 h-4 w-4" />
								</div>
							)}
						</Button>
					</form>
					<div className="mt-6 text-center">
						<p className="text-gray-700 text-sm mb-4">
							Didn't receive the code?
						</p>
						{timer > 0 ? (
							<p className="text-sm">Resend code in {timer} seconds</p>
						) : (
							<Button disabled={resendLoading} onClick={handleResendOtp}>
								{resendLoading ? "Sending.." : "Resend Code"}
							</Button>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default VerifyOtp;
