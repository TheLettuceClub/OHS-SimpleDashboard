import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import EditDialog from "./EditDialog";
import { Job, Client, User } from "./API";

export const JobColumns: ColumnDef<Job>[] = [
	{ accessorKey: "techName", header: "Name" },
	{ accessorKey: "jobReason", header: "Reason" },
	{ accessorKey: "clientID", header: "Client ID" },
	{ accessorKey: "jobFinished", header: "Job finished?" },
	{
		header: "Actions",
		enableHiding: false,
		cell: ({ row }) => {
			return (
				<Dialog>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="h-8 w-8 p-0">
								<span className="sr-only">Open menu</span>
								<MoreHorizontal />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DialogTrigger asChild>
								<DropdownMenuItem>Edit Job</DropdownMenuItem>
							</DialogTrigger>
						</DropdownMenuContent>
					</DropdownMenu>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Edit Job:</DialogTitle>
							<DialogDescription id="description"></DialogDescription>
						</DialogHeader>
						<EditDialog editdata={row.original} newP={false} type={3} />
					</DialogContent>
				</Dialog>
			);
		},
	},
];

export const ClientColumns: ColumnDef<Client>[] = [
	{ accessorKey: "clientName", header: "Name" },
	{ accessorKey: "clientAddress", header: "Address" },
	{ accessorKey: "isActive", header: "Active" },
	{
		header: "Actions",
		enableHiding: false,
		cell: ({ row }) => {
			return (
				<Dialog>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="h-8 w-8 p-0">
								<span className="sr-only">Open menu</span>
								<MoreHorizontal />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DialogTrigger asChild>
								<DropdownMenuItem>Edit Client</DropdownMenuItem>
							</DialogTrigger>
						</DropdownMenuContent>
					</DropdownMenu>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Edit Client:</DialogTitle>
							<DialogDescription id="description"></DialogDescription>
						</DialogHeader>
						<EditDialog editdata={row.original} newP={false} type={2} />
					</DialogContent>
				</Dialog>
			);
		},
	},
];

export const UserColumns: ColumnDef<User>[] = [
	{ accessorKey: "key", header: "ID" },
	{ accessorKey: "username", header: "Username" },
	{
		header: "Actions",
		enableHiding: false,
		cell: ({ row }) => {
			return (
				<Dialog>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" className="h-8 w-8 p-0">
								<span className="sr-only">Open menu</span>
								<MoreHorizontal />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end">
							<DialogTrigger asChild>
								<DropdownMenuItem>Edit User</DropdownMenuItem>
							</DialogTrigger>
						</DropdownMenuContent>
					</DropdownMenu>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Edit User:</DialogTitle>
							<DialogDescription id="description"></DialogDescription>
						</DialogHeader>
						<EditDialog editdata={row.original} newP={false} type={1} />
					</DialogContent>
				</Dialog>
			);
		},
	},
];
