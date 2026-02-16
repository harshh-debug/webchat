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
import { ArrowRight, Mail } from "lucide-react";

const Page = () => {
	return (
		<div className="min-h-screen flex justify-center items-center px-4">
			<Card className="w-full max-w-sm">
				<CardHeader className="text-center space-y-2">
					<div className="flex justify-center">
						<Mail size={50} className="text-primary" />
					</div>

					<CardTitle className="text-xl">
						Welcome to WebChat
					</CardTitle>

					<CardDescription className="text-sm">
						Enter your email below to continue
					</CardDescription>
				</CardHeader>

				<CardContent>
					<form className="space-y-4">
						<div className="grid gap-1.5">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="m@example.com"
								required
							/>
						</div>

						<Button type="submit" className="w-full">
							Send Verification code
							<ArrowRight className="ml-2 h-4 w-4" />
						</Button>
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


