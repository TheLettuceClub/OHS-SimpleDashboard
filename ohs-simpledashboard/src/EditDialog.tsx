/**
 * The multipurpose edit dialog.
 * The primary component in this file is the EditDialog, a dynamic popup component that allows the user to edit and create Users, Clients and Jobs.
 * The visible UI elements are generated dynamically, based on the requested type passed in by other code.
 * It can also create new elements if the newP flag is set. Otherwise, a valid Client, User, or Job must be passed so it can display it's data to allow editing.
 * All 6 possible paths (new and not, Client/User/Job) use TSQuery mutators to modify the data in the API.
 */

import { Client, User, Job, EditClient, EditJob, CreateNewClient, CreateNewJob, UpdateUserPassword, CreateNewUser } from "./API";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { queryClient, hashCode } from "./util";

/**
 * The primary component. Meant to be displayed as part of a Dialog or Popup (i.e. modal and above other content).
 * @param editdata Either a Client, User, or Job. If newP is false, this must be non-null, as its data will be displayed to the UI and potentially edited by the user. If newP is true, it can be null or undef, as it is totally ignored.
 * @param newP Whether the component is being summoned to create a new Client/User/Job or to edit an existing one. Changes some display behavior and which mutator path is used when data is submitted.
 * @param type A 1-3 integer used to determine the type of editdata. 1=User, 2=Client, 3=Job. This must be set or else things break.
 * @returns the component to be rendered
 */
function EditDialog({ editdata, newP, type }: { editdata: Client | User | Job; newP: boolean; type: number }) {
	//function getName(): string {
	//if ("username" in editdata) {
	//	return " User ";
	//} else if ("isActive" in editdata) {
	//	return " Client ";
	//} else if ("techName" in editdata) {
	//	return " Job ";
	//} else {
	//	return " invalid ";
	//}
	//}

	const description = document.getElementById("description")!;

	/**
	 * These can be made optional, but it causes headaches later so make them required.
	 */
	const FormSchema = z.object({
		cName: z.string().min(2, "Name must be at least 2 characters."),
		cAddr: z.string().min(2, "Address must be at least 2 characters."),
		cActive: z.boolean(),

		techName: z.string().min(2, "Name must be at least 2 characters."),
		jobReason: z.string().min(2, "Reason must be at least 2 characters."),
		clientID: z.string().min(1, "Must be greater than 0"),
		jobFin: z.boolean(),

		cUName: z.string().min(2, "Username must be at least 2 characters."),
		cPass: z.string().min(2, "Password must be at least 2 characters."),
		oPass: z.string().min(2, "Password must be at least 2 characters."),
		mPass: z.string().min(2, "Password must be at least 2 characters."),
	});

	/**
	 * Generates the default values for all possible form types.
	 * If creating a new object, the defaults are different because we can't pull from existing data.
	 * @returns an object that useForm can accept.
	 */
	function createParms() {
		if (newP) {
			return {
				cName: "null",
				cAddr: "null",
				cActive: true,

				techName: "null",
				jobReason: "null",
				clientID: "1",
				jobFin: false,

				cUName: "null",
				cPass: "null",
				oPass: "null",
				mPass: "null",
			};
		} else {
			return {
				cName: "clientName" in editdata ? editdata.clientName : "null",
				cAddr: "clientAddress" in editdata ? editdata.clientAddress : "null",
				cActive: "isActive" in editdata ? editdata.isActive : true,

				techName: "techName" in editdata ? editdata.techName : "null",
				jobReason: "jobReason" in editdata ? editdata.jobReason : "null",
				clientID: "clientID" in editdata ? editdata.clientID.toString() : "1",
				jobFin: "jobFinished" in editdata ? editdata.jobFinished : false,

				cUName: "username" in editdata ? editdata.username : "null",
				cPass: "null",
				oPass: "null",
				mPass: "null",
			};
		}
	}

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: createParms(),
	});

	//edit mutators
	const mutateC = useMutation({
		mutationFn: EditClient,
		mutationKey: ["editClient"],
	});

	const mutateU = useMutation({
		mutationFn: UpdateUserPassword,
		mutationKey: ["editUser"],
	});

	const mutateJ = useMutation({
		mutationFn: EditJob,
		mutationKey: ["editJob"],
	});

	//create mutators
	const mutateCC = useMutation({
		mutationFn: CreateNewClient,
		mutationKey: ["createClient"],
	});

	const mutateUC = useMutation({
		mutationFn: CreateNewUser,
		mutationKey: ["createUser"],
	});

	const mutateJC = useMutation({
		mutationFn: CreateNewJob,
		mutationKey: ["createJob"],
	});

	/**
	 * Handles submitted data. uses type and newP to determine which mutator path to invoke.
	 * @param data a compound struct of all possible fields, see createParms() for fields.
	 * @returns nothing
	 */
	async function onSubmit(data: z.infer<typeof FormSchema>) {
		console.log("submit button clicked");
		console.log(data);

		if (type == 1) {
			//user
			try {
				if (newP) {
					await mutateUC.mutateAsync({ queryKey: [sessionStorage.getItem("userID")!, hashCode(data.mPass).toString(), data.cUName, hashCode(data.cPass).toString()] });
				} else {
					await mutateU.mutateAsync({ queryKey: [parseInt(sessionStorage.getItem("userID")!), hashCode(data.mPass), editdata.key, hashCode(data.oPass), hashCode(data.cPass)] });
				}
			} catch (error) {
				description.innerText = error as string;
				return;
			}
			//display some success
			description.innerText = "Success, this window may be closed.";
			queryClient.invalidateQueries({ queryKey: ["getUsers"] }).catch(() => {});
		} else if (type == 2) {
			//client
			try {
				if (newP) {
					await mutateCC.mutateAsync({ queryKey: [data.cName, data.cAddr] });
				} else {
					await mutateC.mutateAsync({ queryKey: [editdata.key.toString(), data.cName, data.cAddr, data.cActive.toString()] });
				}
			} catch (error) {
				description.innerText = error as string;
				return;
			}
			//display some success
			description.innerText = "Success, this window may be closed.";
			queryClient.invalidateQueries({ queryKey: ["getClients"] }).catch(() => {});
		} else if (type == 3) {
			//job
			try {
				if (newP) {
					await mutateJC.mutateAsync({ queryKey: [data.techName, data.jobReason, data.clientID] });
				} else {
					await mutateJ.mutateAsync({ queryKey: [editdata.key.toString(), data.techName, data.jobReason, data.clientID, data.jobFin.toString()] });
				}
				console.log("mutateasync done");
			} catch (error) {
				//console.log("subjob catch");
				//console.error(error);
				//display some error
				description.innerText = error as string;
				return;
			}
			// else display some success
			//console.log("subjob finally");
			description.innerText = "Success, this window may be closed.";
			queryClient.invalidateQueries({ queryKey: ["getJobs"] }).catch(() => {});
		}
	}

	/**
	 * First render "section". These components will appear in the first row of the Dialog, depending on the type
	 * @returns one of four components.
	 */
	function RenderPart1() {
		if (type == 2) {
			return (
				<>
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
				</>
			);
		} else if (type == 1) {
			if (newP) {
				return (
					<>
						<FormField
							control={form.control}
							name="cUName"
							render={({ field }) => (
								<FormItem className="row">
									<FormLabel>Username:</FormLabel>
									<FormControl>
										<Input placeholder="" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<br />
					</>
				);
			} else {
				return (
					<>
						<p>Username:&nbsp;{"username" in editdata ? editdata.username : "invalid"}</p>
						<br />
					</>
				);
			}
		} else if (type == 3) {
			return (
				<>
					<FormField
						control={form.control}
						name="techName"
						render={({ field }) => (
							<FormItem className="row">
								<FormLabel>Tech Name:</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<br />
				</>
			);
		} else {
			return;
		}
	}

	/**
	 * Second render "section". These components will appear in the second row of the Dialog, depending on the type
	 * @returns one of four components.
	 */
	function RenderPart2() {
		if (type == 2) {
			return (
				<>
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
				</>
			);
		} else if (type == 1) {
			if (newP) {
				return (
					<>
						<FormField
							control={form.control}
							name="cPass"
							render={({ field }) => (
								<FormItem className="row">
									<FormLabel>Password:</FormLabel>
									<FormControl>
										<Input type="password" placeholder="" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<br />
					</>
				);
			} else {
				return (
					<>
						<FormField
							control={form.control}
							name="oPass"
							render={({ field }) => (
								<FormItem className="row">
									<FormLabel>Old Password:</FormLabel>
									<FormControl>
										<Input type="password" placeholder="" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<br />
					</>
				);
			}
		} else if (type == 3) {
			return (
				<>
					<FormField
						control={form.control}
						name="jobReason"
						render={({ field }) => (
							<FormItem className="row">
								<FormLabel>Reason for Job:</FormLabel>
								<FormControl>
									<Input {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<br />
				</>
			);
		} else {
			return;
		}
	}

	/**
	 * Third render "section". These components will appear in the third row of the Dialog, depending on the type
	 * @returns one of three components.
	 */
	function RenderPart3() {
		if (type == 2 && !newP) {
			return (
				<>
					<FormField
						control={form.control}
						name="cActive"
						render={({ field }) => (
							<FormItem className="row">
								<FormLabel>Client Active?:</FormLabel>
								<FormControl>
									<Checkbox
										checked={field.value}
										onCheckedChange={() => {
											form.setValue("cActive", !field.value);
										}}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<br />
				</>
			);
		} else if (type == 1 && !newP) {
			return (
				<>
					<FormField
						control={form.control}
						name="cPass"
						render={({ field }) => (
							<FormItem className="row">
								<FormLabel>New Password:</FormLabel>
								<FormControl>
									<Input type="password" placeholder="" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<br />
				</>
			);
		} else if (type == 3) {
			return (
				<>
					<FormField
						control={form.control}
						name="clientID"
						render={({ field }) => (
							<FormItem className="row">
								<FormLabel>Client ID:</FormLabel>
								<FormControl>
									<Input type="number" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<br />
				</>
			);
		} else {
			return;
		}
	}

	/**
	 * Fourth render "section". These components will appear in the fourth row of the Dialog, depending on the type
	 * @returns one of two components.
	 */
	function RenderPart4() {
		if (type == 3 && !newP) {
			return (
				<>
					<FormField
						control={form.control}
						name="jobFin"
						render={({ field }) => (
							<FormItem className="row">
								<FormLabel>Job Finished?:</FormLabel>
								<FormControl>
									<Checkbox
										checked={field.value}
										onCheckedChange={() => {
											form.setValue("jobFin", !field.value);
										}}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<br />
				</>
			);
		} else if (type == 1) {
			return (
				<>
					<FormField
						control={form.control}
						name="mPass"
						render={({ field }) => (
							<FormItem className="row">
								<FormLabel>Your Password:</FormLabel>
								<FormControl>
									<Input type="password" placeholder="" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<br />
				</>
			);
		} else {
			return;
		}
	}

	return (
		<>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					{RenderPart1()}
					{RenderPart2()}
					{RenderPart3()}
					{RenderPart4()}
					<Button type="submit">Submit</Button>
				</form>
			</Form>
		</>
	);
}

export default EditDialog;
