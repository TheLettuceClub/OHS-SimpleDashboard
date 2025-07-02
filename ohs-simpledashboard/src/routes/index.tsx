/**
 * This page will kinda do double duty. When not logged in, will display minimal info and request login.
 * When logged in will show all the data and queries and such.
 */

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, QueryClientProvider } from "@tanstack/react-query";
import { Client, GetAllClients, GetAllJobs, Job, GetUserList, User } from "../API";
import { ClientColumns, JobColumns, UserColumns } from "../ColDef";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
//import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
//import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { queryClient } from "../util";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import EditDialog from "../EditDialog";

export const Route = createFileRoute("/")({
	component: Index,
});

//saves but doesn't effectively load
//const persister = createAsyncStoragePersister({
//	storage: window.localStorage,
//});

/**
 * Primary component that hosts all the others.
 * Sets up login checking and TSQuery stuff as well.
 * @returns component
 */
function Index() {
	const [login, setLogin] = useState(sessionStorage.getItem("login"));

	if (login === "false" || login == null) {
		return (
			<div className="p-2">
				<h3 className="text-3x1 font-bold underline">You are not logged in. Please click the "Login" button.</h3>
			</div>
		);
	}

	function logout() {
		sessionStorage.removeItem("login");
		sessionStorage.removeItem("userID");
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
				<br />
				<br />
				<JobManagementPage />
				<br />
				<br />
				<UserManagementPage />
			</QueryClientProvider>
		</div>
	);
}

/**
 * Basic type-agnostic button and dialog component.
 * @param type 1-3 integer that has the same meaning as EditDialog's type property.
 * @returns component
 */
function NuCreateButton({ type }: { type: number }) {
	function getName(): string {
		if (type == 1) {
			return " User";
		} else if (type == 2) {
			return " Client";
		} else if (type == 3) {
			return " Job";
		} else {
			return " invalid";
		}
	}

	return (
		<>
			<Dialog>
				<DialogTrigger asChild>
					<Button>Create new {getName()}</Button>
				</DialogTrigger>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create new {getName()}:</DialogTitle>
						<DialogDescription id="description"></DialogDescription>
					</DialogHeader>
					<EditDialog editdata={null} newP={true} type={type} />
				</DialogContent>
			</Dialog>
		</>
	);
}

/**
 * DataTable host for Clients
 * @returns component
 */
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
			<h4>Clients:</h4>
			<NuCreateButton type={2} />
			<DataTable columns={ClientColumns} data={data} />
		</div>
	);
}

/**
 * DataTable host for Jobs
 * @returns component
 */
function JobManagementPage() {
	const { isPending, error, data, isFetching } = useQuery({
		queryKey: ["getJobs"],
		queryFn: async () => {
			return JSON.parse(await GetAllJobs()) as Job[];
		},
	});

	if (isPending || isFetching) return "Loading...";

	if (error) return "An error has occurred: " + error.message;

	return (
		<div className="container mx-auto py-10">
			<h4>Jobs:</h4>
			<NuCreateButton type={3} />
			<DataTable columns={JobColumns} data={data} />
		</div>
	);
}

/**
 * DataTable host for Users
 * @returns component
 */
function UserManagementPage() {
	const { isPending, error, data, isFetching } = useQuery({
		queryKey: ["getUsers"],
		queryFn: async () => {
			return JSON.parse(await GetUserList()) as User[];
		},
	});

	if (isPending || isFetching) return "Loading...";

	if (error) return "An error has occurred: " + error.message;

	return (
		<div className="container mx-auto py-10">
			<h4>Users:</h4>
			<NuCreateButton type={1} />
			<DataTable columns={UserColumns} data={data} />
		</div>
	);
}
