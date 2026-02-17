"use client";
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
import axios from "axios";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
interface LoginResponse {
	message: string;
}

const Page = () => {
	const [email, setEmail] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	const router = useRouter();
	const handleSubmit = async (
		e: React.FormEvent<HTMLFormElement>,
	): Promise<void> => {
		e.preventDefault();
		setLoading(true);
		try {
			const { data } = await axios.post<LoginResponse>(
				`http://localhost:5000/api/v1/login`,
				{
					email,
				},
			);
			alert(data.message);
			router.push(`/verify?email=${email}`);
		} catch (error: any) {
			alert(error.response?.data.message || "Something went wrong");
		} finally {
			setLoading(false);
		}
	};
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
								<Loader2>
									Sending otp to your mail...
								</Loader2>
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
					<Button variant="outline" className="w-full">
						Login with Google
					</Button>
				</CardFooter>
			</Card>
		</div>
	);
};

export default Page;
