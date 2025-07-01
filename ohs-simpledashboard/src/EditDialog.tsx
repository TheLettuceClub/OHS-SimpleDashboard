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

				cUName: "",
				cPass: "",
				oPass: "null",
				mPass: "",
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
										<Input type="password" {...field} />
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
										<Input type="password" {...field} />
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
									<Input type="password" {...field} />
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
									<Input type="password" {...field} />
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
