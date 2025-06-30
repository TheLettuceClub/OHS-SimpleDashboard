/**
 * This file will serve at the mock "API" (service layer) that the frontend of the site will call to CRUD data.
 * Per spec, these functions must be Promise-based and have a small delay to simulate network latency.
 * Reminder: All functions must be exported to be visible in the rest of the project!!
 *
 * API Notes:
 * Things that will be stored in the "DB" that is accessible thru the "API":
 * Jobs
 * Clients
 * Users
 *
 * All functions will return a Promise that will eventually fulfil into a JSON string representing the result of the request.
 * "get" methods will return data, "set" methods will return a status message. Status values of 0 indicate the operation succeeded; negative values indicate failure.
 * These error codes are global to the entire API to assist in identifying where in a given "endpoint" the failure occurred.
 */

import { hashCode } from "./util";
import { type ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import EditDialog from "./EditDialog";

/**
 * Jobs:
 * Representative of a technician fulfilling a Client request to fix something in their home.
 * Would have CRU access in UI, cannot Delete but can mark complete.
 *
 * Fields:
 * ID of job (number, unique within the job DB)
 * Technician name (string)
 * Reason for job (string)
 * ID of relevant client (number, used to separately get client data from another "endpoint")
 * Is job finished (bool)
 *
 * Access methods:
 * create new job => CreateNewJob
 * get list of jobs (incl. completed ones) => GetAllJobs
 * edit specific job (incl. mark completed) => EditJob
 */

let jobUniqueID = 1;

export class Job {
	key: number;
	techName: string;
	jobReason: string;
	clientID: number;
	jobFinished: boolean;

	constructor(inName: string, inReason: string, inClient: number) {
		this.techName = inName;
		this.jobReason = inReason;
		this.clientID = inClient;
		this.jobFinished = false;
		this.key = jobUniqueID;
		jobUniqueID++;
	}
}

const jobsDB: Job[] = [];

function findJobByID(id: number): Job | undefined {
	for (let i = 0; i < jobsDB.length; i++) {
		if (jobsDB[i].key == id) {
			return jobsDB[i];
		}
	}
	return;
}

export async function GetAllJobs(): Promise<string> {
	return new Promise<string>((resolve) =>
		setTimeout(() => {
			resolve(JSON.stringify(jobsDB));
			return;
		}, 1000),
	);
}

export async function CreateNewJob(inName: string, inReason: string, inClient: number): Promise<string> {
	return new Promise<string>((resolve) =>
		setTimeout(() => {
			// ensure the client ID is a valid, active one, then add it to the jobs DB
			if (ValidateClientID(inClient)) {
				jobsDB.push(new Job(inName, inReason, inClient));
				resolve(JSON.stringify(0));
				return;
			}
			resolve(JSON.stringify(-1));
			return;
		}, 1500),
	);
}

export async function EditJob(id: number, inName: string | undefined, inReason: string | undefined, inClient: number | undefined, inFin: boolean | undefined): Promise<string> {
	return new Promise<string>((resolve) =>
		setTimeout(() => {
			const editJob = findJobByID(id);
			if (editJob == undefined) {
				resolve(JSON.stringify(-2));
				return;
			}
			if (inClient !== undefined) {
				if (ValidateClientID(inClient)) {
					editJob.clientID = inClient;
				} else {
					resolve(JSON.stringify(-3));
					return;
				}
			}
			if (inName !== undefined) {
				editJob.techName = inName;
			}
			if (inReason !== undefined) {
				editJob.jobReason = inReason;
			}
			if (inFin !== undefined) {
				editJob.jobFinished = inFin;
			}
			resolve(JSON.stringify(0));
			return;
		}, 1200),
	);
}

/**
 * Clients:
 * The (non-employee) users of the service who need their houses repaired.
 * UI has full CRUD access. Deletion request doesn't actually delete, just marks them as inactive.
 *
 * Fields:
 * ID of client (number, unique within client DB)
 * Client name (string)
 * Address (string)
 * Is active client (boolean, false when Deleted from UI)
 *
 * Access methods:
 * Create new client => CreateNewClient
 * get list of clients => GetAllClients
 * edit specific client => EditClient
 */

let clientUniqueID = 1;

export class Client {
	key: number;
	clientName: string;
	clientAddress: string;
	isActive: boolean;

	constructor(inName: string, inAddr: string) {
		this.clientAddress = inAddr;
		this.clientName = inName;
		this.isActive = true;
		this.key = clientUniqueID;
		clientUniqueID++;
	}
}

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
						<EditDialog editdata={row.original} />
					</DialogContent>
				</Dialog>
			);
		},
	},
];

const clientsDB: Client[] = [
	new Client("Daniel Silverstein", "3053 N Southport"),
	new Client("Adam Meyer", "Somewhere, Utah"),
	new Client("Worcester Polytechnic Institute", "100 Institute rd, Worcester, MA, 01609"),
];

function getClientByID(id: number): Client | undefined {
	for (let i = 0; i < clientsDB.length; i++) {
		if (clientsDB[i].key == id) {
			return clientsDB[i];
		}
	}
	return;
}

function ValidateClientID(id: number): boolean {
	return getClientByID(id) !== undefined ? true : false;
}

export async function GetAllClients(): Promise<string> {
	return new Promise<string>((resolve) =>
		setTimeout(() => {
			//console.log("clientsDB is of length " + clientsDB.length);
			resolve(JSON.stringify(clientsDB));
			return;
		}, 1002),
	);
}

export async function CreateNewClient({ queryKey }: { queryKey: string[] }): Promise<string> {
	console.log(queryKey);
	const [inName, inAddr] = queryKey;
	return new Promise<string>((resolve) =>
		setTimeout(() => {
			clientsDB.push(new Client(inName, inAddr));
			//console.log("clientsDB is now of length " + clientsDB.length);
			resolve(JSON.stringify(0));
			return;
		}, 560),
	);
}

export async function EditClient({ queryKey }: { queryKey: string[] }): Promise<string> {
	const [idS, inName, inAddr, inActiveS] = queryKey;
	const id = parseInt(idS);
	const inActive = inActiveS === "true" ? true : false;
	return new Promise<string>((resolve) =>
		setTimeout(() => {
			const editClient = getClientByID(id);
			if (editClient == undefined) {
				resolve(JSON.stringify(-4));
				return;
			}
			if (inName !== undefined) {
				editClient.clientName = inName;
			}
			if (inAddr !== undefined) {
				editClient.clientAddress = inAddr;
			}
			if (inActive !== undefined) {
				editClient.isActive = inActive;
			}
			resolve(JSON.stringify(0));
			return;
		}, 500),
	);
}

/**
 * Users:
 * The admin users that can log in to this UI.
 * UI has full CRUD access for users other than themselves.
 *
 * Fields:
 * ID of user (number, unique within users DB)
 * username (string, stored unencrypted, must be unique among users)
 * password (number, hash of the text password entered in the UI)
 *
 * Access methods:
 * user authentication at login (comparing username and encrypted password)
 * Create new user
 * Update user password
 * get list of users
 * Delete other user (can't delete self)
 *
 * "Encryption":
 * In a production setting, real ecryption would be used to ensure user passwords are never transmitted in the clear across the internet.
 * In this exersise, this is less important, but I'm still going to emulate this behavior by only sending and storing the hashes of passwords.
 * The UI will use string.hash() to generate this and the DB here will store and compare against them as necessary, so only the user knows their plaintext password.
 */

let userUniqueID = 1;

export class User {
	key: number;
	username: string;
	password: number;

	constructor(inUName: string, inPass: number) {
		this.username = inUName;
		this.password = inPass;
		this.key = userUniqueID;
		userUniqueID++;
	}
}

const usersDB: User[] = [new User("shadcn", hashCode("password"))];

function getUserByID(id: number): User | undefined {
	for (let i = 0; i < usersDB.length; i++) {
		if (usersDB[i].key == id) {
			return usersDB[i];
		}
	}
	return;
}

function getUserByUName(inUName: string): User | undefined {
	for (let i = 0; i < usersDB.length; i++) {
		if (usersDB[i].username === inUName) {
			return usersDB[i];
		}
	}
	return;
}

function ValidateUserName(inUName: string): boolean {
	return getUserByUName(inUName) !== undefined ? true : false;
}

function ValidateUser(id: number, inPass: number): boolean {
	const user = getUserByID(id);
	return user !== undefined && user.password == inPass;
}

export async function LoginAuth(inUName: string, inPass: number): Promise<string> {
	return new Promise<string>((resolve) =>
		setTimeout(() => {
			//will compare params to userDB, returning JSON struct of form: {validLogin: boolean, userID: number, errCode: number}
			const userByUName = getUserByUName(inUName);
			if (userByUName !== undefined) {
				//then we know the username and pass exist in the db, now check if referencing same user
				if (userByUName.password === inPass) {
					// now we know that it's also the same user for both bc keys are unique
					//console.log("login success");
					resolve(JSON.stringify({ validLogin: true, userID: userByUName.key, errCode: 0 }));
					return;
				} else {
					//console.log("invalid password");
					resolve(JSON.stringify({ validLogin: false, userID: -1, errCode: -6 }));
					return;
				}
			} else {
				//console.log("invalid username");
				resolve(JSON.stringify({ validLogin: false, userID: -1, errCode: -7 }));
				return;
			}
		}, 750),
	);
}

export async function GetUserList(): Promise<string> {
	return new Promise<string>((resolve) =>
		setTimeout(() => {
			resolve(JSON.stringify(usersDB));
			return;
		}, 1000),
	);
}

export async function CreateNewUser(myID: number, myPassword: number, inUName: string, inPassword: number): Promise<string> {
	return new Promise<string>((resolve) =>
		setTimeout(() => {
			// verifies that uname is unique in the DB, then adds if so. Also verifies creating user is valid
			if (ValidateUser(myID, myPassword)) {
				if (!ValidateUserName(inUName)) {
					// then we know no other users have that name, so we're good
					usersDB.push(new User(inUName, inPassword));
					resolve(JSON.stringify(0));
					return;
				}
				resolve(JSON.stringify(-8));
				return;
			}
			resolve(JSON.stringify(-9));
			return;
		}, 457),
	);
}

export async function UpdateUserPassword(myID: number, myPassword: number, editID: number, oldPassword: number, inPassword: number): Promise<string> {
	return new Promise<string>((resolve) =>
		setTimeout(() => {
			// verifies that editID's pass matches oldPass and that inPass is unique in the DB.
			if (ValidateUser(myID, myPassword)) {
				const user = getUserByID(editID);
				if (user !== undefined) {
					// user exists, check old password
					if (user.password === oldPassword) {
						// it's correct, change it
						user.password = inPassword;
						resolve(JSON.stringify(0));
						return;
					}
					resolve(JSON.stringify(-10));
					return;
				}
				resolve(JSON.stringify(-11));
				return;
			}
			resolve(JSON.stringify(-12));
			return;
		}, 1000),
	);
}

export async function DeleteUser(myID: number, myPassword: number, editID: number): Promise<string> {
	return new Promise<string>((resolve) =>
		setTimeout(() => {
			//verifies that myID!=editID, myID's pass == myPassword, and that editID exists before doing anything.
			if (ValidateUser(myID, myPassword)) {
				if (myID !== editID) {
					// delete somehow
					for (let i = 0; i < usersDB.length; i++) {
						if (usersDB[i].key == editID) {
							usersDB.splice(i, 1);
							resolve(JSON.stringify(0));
							return;
						}
					}
					resolve(JSON.stringify(-13));
					return;
				}
				resolve(JSON.stringify(-14));
				return;
			}
			resolve(JSON.stringify(-15));
			return;
		}, 1200),
	);
}

/*export async function FunctionTemplate(): Promise<string> {
	return new Promise<string>(resolve => setTimeout(() => {
		resolve("");
		return;
	}, 1000));
}*/
