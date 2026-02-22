"use client";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppData, user_service } from "@/context/AppContext";
import axios from "axios";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
interface LoginResponse {
	message: string;
}

const Page = () => {
	const [email, setEmail] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	const router = useRouter();
	const { isAuth, loading: userLoading } = useAppData();
	const handleSubmit = async (
		e: React.FormEvent<HTMLFormElement>,
	): Promise<void> => {
		e.preventDefault();
		setLoading(true);
		try {
			const { data } = await axios.post<LoginResponse>(
				`${user_service}/api/v1/login`,
				{
					email,
				},
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
		await signIn("google", {
			callbackUrl: "/chat",
		});
	};
	useEffect(() => {
		if (!userLoading && isAuth) {
			router.replace("/chat");
		}
	}, [isAuth, userLoading, router]);

	if (userLoading) {
		return <Loading />;
	}
	return (
		<div className="min-h-screen flex justify-center items-center px-4">
			<Card className="w-full max-w-sm">
				<CardHeader className="text-center space-y-2">
					<div className="flex justify-center">
						<Mail size={50} className="text-primary" />
					</div>

					<CardTitle className="text-xl">Welcome to WebChat</CardTitle>

					<CardDescription className="text-sm">
						Enter your email below to continue
					</CardDescription>
				</CardHeader>

				<CardContent>
					<form className="space-y-4" onSubmit={handleSubmit}>
						<div className="grid gap-1.5">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="m@example.com"
								required
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</div>
						{loading ? (
							<div className="flex items-center justify-center gap-2">
								<Loader2>Sending otp to your mail...</Loader2>
							</div>
						) : (
							<Button type="submit" className="w-full" disabled={loading}>
								Send Verification code
								<ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						)}
					</form>
				</CardContent>

				<CardFooter className="flex-col gap-0.5">
					<Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
						Login with Google
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
};

export default Page;
