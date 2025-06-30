import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { QueryClient, QueryClientProvider, useQuery, useMutation } from "@tanstack/react-query";
import { Client, ClientColumns, GetAllClients, CreateNewClient } from "../API";
import { DataTable } from "@/components/ui/data-table";
import Popup from "reactjs-popup";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export const Route = createFileRoute("/")({
	component: Index,
});

export const queryClient = new QueryClient();

/**
 * This page will kinda do double duty. When not logged in, will display minimal info and request login.
 * When logged in will show all the data and queries and such.
 */

function Index() {
	const [login, setLogin] = useState(sessionStorage.getItem("login"));

	if (login == "false" || login == null) {
		return (
			<div className="p-2">
				<h3 className="text-3x1 font-bold underline">You are not logged in. Please click the "Login" button.</h3>
			</div>
		);
	}

	function logout() {
		sessionStorage.removeItem("login");
		setLogin("false");
	}

	return (
		<div className="p-2">
			<h3 className="text-3x1 font-bold underline">Welcome Home!</h3>
			<Button
				onClick={() => {
					logout();
				}}
			>
				Log Out
			</Button>
			<QueryClientProvider client={queryClient}>
				<ClientManagementPage />
				<ReactQueryDevtools initialIsOpen={false} />
			</QueryClientProvider>
		</div>
	);
}

//header w/popup buttons
function HeaderWithPopupButtons() {
	const FormSchema = z.object({
		cName: z.string().min(2, {
			message: "Name must be at least 2 characters.",
		}),
		cAddr: z.string().min(2, {
			message: "Address must be at least 2 characters.",
		}),
	});

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			cName: "",
			cAddr: "",
		},
	});

	const mutation = useMutation({
		mutationFn: CreateNewClient,
	});

	function onSubmit(data: z.infer<typeof FormSchema>) {
		console.log("submit button clicked");
		//console.log(data);
		//TODO: add tanstack stuff? unknown if would work, need info on params
		//CreateNewClient(data.cName, data.cAddr).catch(() => {});
		mutation.mutate({ queryKey: [data.cName, data.cAddr] });
		queryClient.invalidateQueries({ queryKey: ["getClients"] }).catch(() => {});
	}

	return (
		<>
			<h4>Clients:</h4>
			<Popup trigger={<Button>Create new Client</Button>} modal>
				<div className="modal">
					<div className="header">Client Creation:</div>
					<div className="content">
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)}>
								<FormField
									control={form.control}
									name="cName"
									render={({ field }) => (
										<FormItem className="row">
											<FormLabel>Client Name:</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<br />
								<FormField
									control={form.control}
									name="cAddr"
									render={({ field }) => (
										<FormItem className="row">
											<FormLabel>Client Address:</FormLabel>
											<FormControl>
												<Input {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<br />
								<Button type="submit">Submit</Button>
							</form>
						</Form>
					</div>
				</div>
			</Popup>
		</>
	);
}

function ClientManagementPage() {
	const { isPending, error, data, isFetching } = useQuery({
		queryKey: ["getClients"],
		queryFn: async () => {
			return JSON.parse(await GetAllClients()) as Client[];
		},
	});

	if (isPending || isFetching) return "Loading...";

	if (error) return "An error has occurred: " + error.message;

	return (
		<div className="container mx-auto py-10">
			<HeaderWithPopupButtons />
			<DataTable columns={ClientColumns} data={data} />
		</div>
	);
}
