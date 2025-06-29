import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoginAuth } from "../API";
import { hashCode, delay } from "../util";
import "./popup.css";

export const Route = createFileRoute("/login")({
	component: Login,
});

function Login() {
	const navigate = useNavigate();

	const FormSchema = z.object({
		username: z.string().min(2, {
			message: "Username must be at least 2 characters.",
		}),
		password: z.string().min(2, {
			message: "Password must be at least 2 characters.",
		}),
	});

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			username: "",
			password: "",
		},
	});

	type LoginReturn = {
		validLogin: boolean;
		userID: number;
		errorCode: number;
	};

	function onSubmit(data: z.infer<typeof FormSchema>) {
		console.log("submit button clicked");
		//console.log(data);

		LoginAuth(data.username, hashCode(data.password))
			.then(async (ret) => {
				const rdata: LoginReturn = JSON.parse(ret) as LoginReturn;
				//console.log(data);
				if (rdata.validLogin) {
					//show toast, set session storage, redirect
					sessionStorage.setItem("login", "true");
					sessionStorage.setItem("userID", rdata.userID.toString());
					toast("You have successfully logged in.");
					await delay(550); //wait a bit so it's less jarring
					navigate({ to: "/" }).catch(() => {});
				} else {
					sessionStorage.setItem("login", "true");
					sessionStorage.setItem("userID", rdata.userID.toString());
					toast("Invalid credentials.");
				}
			})
			.catch(() => {});
	}

	return (
		<>
			<Toaster />
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
					<FormField
						control={form.control}
						name="username"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Username</FormLabel>
								<FormControl>
									<Input placeholder="shadcn" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Password</FormLabel>
								<FormControl>
									<Input placeholder="password" type="password" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit">Submit</Button>
				</form>
			</Form>
		</>
	);
}
