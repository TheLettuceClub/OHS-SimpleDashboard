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

import { hashCode } from "./util.ts";

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

const jobsDB: Job[] = [new Job("James Murphy", "Fridge is broken", 1), new Job("Michael Madsen", "HVAC pump not in place", 2), new Job("Maria Quiroz", "Lightbulb replacement", -1)];

function findJobByID(id: number): Job | undefined {
	for (let i = 0; i < jobsDB.length; i++) {
		if (jobsDB[i].key == id) {
			return jobsDB[i];
		}
	}
	return;
}

function SaveJobsDB() {
	//TODO: make sure this doesn't run more than once at a time to prevent overwriting
	localStorage.setItem("JobsDB", JSON.stringify(jobsDB));
}

function LoadJobsDB() {
	const item = localStorage.getItem("JobsDB");
	if (item !== null) {
		const data = JSON.parse(item) as Job[];
		//then merge the DBs
		data.forEach((job) => {
			const edit = findJobByID(job.key);
			if (edit !== undefined) {
				edit.techName = job.techName;
				edit.clientID = job.clientID;
				edit.jobFinished = job.jobFinished;
				edit.jobReason = job.jobReason;
			} else {
				const nJob = new Job(job.techName, job.jobReason, job.clientID);
				nJob.jobFinished = job.jobFinished;
				jobsDB.push(nJob);
			}
		});
		console.log("merged LS and in-memory (jobs):");
		console.log(jobsDB);
	}
}

export async function GetAllJobs(): Promise<string> {
	return new Promise<string>((resolve) =>
		setTimeout(() => {
			LoadJobsDB();
			resolve(JSON.stringify(jobsDB));
			return;
		}, 1000),
	);
}

export async function CreateNewJob({ queryKey }: { queryKey: string[] }): Promise<string> {
	const [inName, inReason, inClientS] = queryKey;
	return new Promise<string>((resolve, reject) =>
		setTimeout(() => {
			// ensure the client ID is a valid, active one, then add it to the jobs DB
			const inClient = parseInt(inClientS);
			if (ValidateClientID(inClient)) {
				jobsDB.push(new Job(inName, inReason, inClient));
				SaveJobsDB();
				resolve(JSON.stringify(0));
				return;
			}
			reject(new Error(JSON.stringify(-1)));
			return;
		}, 1500),
	);
}

export async function EditJob({ queryKey }: { queryKey: string[] }): Promise<string> {
	console.log(queryKey);
	const [id, inName, inReason, inClientS, inFin] = queryKey;
	return new Promise<string>((resolve, reject) =>
		setTimeout(() => {
			const editJob = findJobByID(id as unknown as number);
			if (editJob == undefined) {
				reject(new Error(JSON.stringify(-2)));
				//resolve();
				return;
			}
			if (inClientS !== undefined) {
				const inClient = parseInt(inClientS);
				if (ValidateClientID(inClient)) {
					editJob.clientID = inClient;
				} else {
					reject(new Error(JSON.stringify(-3)));
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
				editJob.jobFinished = inFin as unknown as boolean;
			}
			SaveJobsDB();
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

function SaveClientsDB() {
	//TODO: make sure this doesn't run more than once at a time to prevent overwriting
	localStorage.setItem("ClientsDB", JSON.stringify(clientsDB));
}

function LoadClientsDB() {
	const item = localStorage.getItem("ClientsDB");
	if (item !== null) {
		const data = JSON.parse(item) as Client[];
		//then merge the DBs
		data.forEach((client) => {
			const edit = getClientByID(client.key);
			if (edit !== undefined) {
				edit.clientAddress = client.clientAddress;
				edit.clientName = client.clientName;
				edit.isActive = client.isActive;
			} else {
				const nClient = new Client(client.clientName, client.clientAddress);
				nClient.isActive = client.isActive;
				clientsDB.push(nClient);
			}
		});
		console.log("merged LS and in-memory (client):");
		console.log(clientsDB);
	}
}

export async function GetAllClients(): Promise<string> {
	return new Promise<string>((resolve) =>
		setTimeout(() => {
			//console.log("clientsDB is of length " + clientsDB.length);
			LoadClientsDB();
			resolve(JSON.stringify(clientsDB));
			return;
		}, 1002),
	);
}

export async function CreateNewClient({ queryKey }: { queryKey: string[] }): Promise<string> {
	//console.log(queryKey);
	const [inName, inAddr] = queryKey;
	return new Promise<string>((resolve) =>
		setTimeout(() => {
			clientsDB.push(new Client(inName, inAddr));
			//console.log("clientsDB is now of length " + clientsDB.length);
			SaveClientsDB();
			resolve(JSON.stringify(0));
			return;
		}, 560),
	);
}

export async function EditClient({ queryKey }: { queryKey: string[] }): Promise<string> {
	//console.log(queryKey);
	const [id, inName, inAddr, inActive] = queryKey;
	return new Promise<string>((resolve, reject) =>
		setTimeout(() => {
			const editClient = getClientByID(id as unknown as number);
			if (editClient == undefined) {
				reject(new Error(JSON.stringify(-4)));
				return;
			}
			if (inName !== undefined) {
				editClient.clientName = inName;
			}
			if (inAddr !== undefined) {
				editClient.clientAddress = inAddr;
			}
			if (inActive !== undefined) {
				editClient.isActive = inActive as unknown as boolean;
			}
			SaveClientsDB();
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

const usersDB: User[] = [new User("shadcn", hashCode("password")), new User("disilverstein", hashCode("testpass!"))];

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

function SaveUsersDB() {
	//TODO: make sure this doesn't run more than once at a time to prevent overwriting
	localStorage.setItem("UsersDB", JSON.stringify(usersDB));
}

function LoadUsersDB() {
	const item = localStorage.getItem("UsersDB");
	if (item !== null) {
		const data = JSON.parse(item) as User[];
		//then merge the DBs
		data.forEach((user) => {
			const edit = getUserByID(user.key);
			if (edit !== undefined) {
				edit.username = user.username;
				edit.password = user.password;
			} else {
				usersDB.push(new User(user.username, user.password));
			}
		});
		console.log("merged LS and in-memory (user):");
		console.log(usersDB);
	}
}

//bc this function is only called from the login page, it doesn't use the query parameters
export async function LoginAuth(inUName: string, inPass: number): Promise<string> {
	LoadUsersDB();
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
			LoadUsersDB();
			resolve(JSON.stringify(usersDB));
			return;
		}, 1000),
	);
}

export async function CreateNewUser({ queryKey }: { queryKey: string[] }): Promise<string> {
	const [myID, myPassword, inUName, inPassword] = queryKey;
	return new Promise<string>((resolve, reject) =>
		setTimeout(() => {
			// verifies that uname is unique in the DB, then adds if so. Also verifies creating user is valid
			if (ValidateUser(parseInt(myID), parseInt(myPassword))) {
				if (!ValidateUserName(inUName)) {
					// then we know no other users have that name, so we're good
					usersDB.push(new User(inUName, parseInt(inPassword)));
					SaveUsersDB();
					resolve(JSON.stringify(0));
					return;
				}
				reject(new Error(JSON.stringify(-8)));
				return;
			}
			reject(new Error(JSON.stringify(-9)));
			return;
		}, 457),
	);
}

export async function UpdateUserPassword({ queryKey }: { queryKey: number[] }): Promise<string> {
	const [myID, myPassword, editID, oldPassword, inPassword] = queryKey;
	return new Promise<string>((resolve, reject) =>
		setTimeout(() => {
			// verifies that editID's pass matches oldPass and that inPass is unique in the DB.
			if (ValidateUser(myID, myPassword)) {
				const user = getUserByID(editID);
				if (user !== undefined) {
					// user exists, check old password
					if (user.password === oldPassword) {
						// it's correct, change it
						user.password = inPassword;
						SaveUsersDB();
						resolve(JSON.stringify(0));
						return;
					}
					reject(new Error(JSON.stringify(-10)));
					return;
				}
				reject(new Error(JSON.stringify(-11)));
				return;
			}
			reject(new Error(JSON.stringify(-12)));
			return;
		}, 1000),
	);
}

//currently unused.
export async function DeleteUser({ queryKey }: { queryKey: number[] }): Promise<string> {
	const [myID, myPassword, editID] = queryKey;
	return new Promise<string>((resolve, reject) =>
		setTimeout(() => {
			//verifies that myID!=editID, myID's pass == myPassword, and that editID exists before doing anything.
			if (ValidateUser(myID, myPassword)) {
				if (myID !== editID) {
					// delete somehow
					for (let i = 0; i < usersDB.length; i++) {
						if (usersDB[i].key == editID) {
							usersDB.splice(i, 1);
							SaveUsersDB();
							resolve(JSON.stringify(0));
							return;
						}
					}
					reject(new Error(JSON.stringify(-13)));
					return;
				}
				reject(new Error(JSON.stringify(-14)));
				return;
			}
			reject(new Error(JSON.stringify(-15)));
			return;
		}, 1200),
	);
}

/*export async function FunctionTemplate({ queryKey }: { queryKey: string[] }): Promise<string> {
	const [trueParams] = queryKey;
	return new Promise<string>((resolve, reject) => setTimeout(() => {
		if (badness) {
			reject(new Error(""));
			return;
		}
		resolve("");
		return;
	}, 1000));
}*/
