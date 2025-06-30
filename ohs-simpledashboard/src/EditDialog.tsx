import { Client, User, Job, EditClient } from "./API";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "./routes/index";

function EditDialog({ editdata }: { editdata: Client | User | Job }) {
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

	const description = document.getElementById("description");

	const FormSchema = z.object({
		cName: z.string().min(2, "Name must be at least 2 characters.").optional(),
		cAddr: z.string().min(2, "Address must be at least 2 characters.").optional(),
		cActive: z.boolean().optional(),

		techName: z.string().min(2, "Name must be at least 2 characters.").optional(),
		jobReason: z.string().min(2, "Reason must be at least 2 characters.").optional(),
		clientID: z.number().gt(0, "Must be greater than 0").optional(),
		jobFin: z.boolean().optional(),

		cPass: z.string().min(2, "Password must be at least 2 characters.").optional(),
		mPass: z.string().min(2, "Password must be at least 2 characters.").optional(),
	});

	const form = useForm<z.infer<typeof FormSchema>>({
		resolver: zodResolver(FormSchema),
		defaultValues: {
			cName: "isActive" in editdata ? editdata.clientName : "null",
			cAddr: "isActive" in editdata ? editdata.clientAddress : "null",
			cActive: "isActive" in editdata ? editdata.isActive : false,

			techName: "techName" in editdata ? editdata.techName : "null",
			jobReason: "techName" in editdata ? editdata.jobReason : "null",
			clientID: "techName" in editdata ? editdata.clientID : 1,
			jobFin: "techName" in editdata ? editdata.jobFinished : false,

			cPass: "null",
			mPass: "null",
		},
	});

	const mutateC = useMutation({
		mutationFn: EditClient,
	});

	//const mutateU = useMutation({
	//	mutationFn: EditClient
	//});

	//const mutateJ = useMutation({
	//	mutationFn: EditClient
	//});

	function onSubmit(data: z.infer<typeof FormSchema>) {
		console.log("submit button clicked");
		console.log(data);
		//TODO: submit data somehow
		if ("username" in editdata) {
			//user
		} else if ("isActive" in editdata) {
			//client
			mutateC.mutate({ queryKey: [editdata.key, data.cName, data.cAddr, data.cActive] });
			if (mutateC.error !== null) {
				//display some error
				description.innerText = "Error: " + mutateC.error.message;
			} else {
				//display some success
				description.innerText = "Success, this window may be closed.";
				queryClient.invalidateQueries({ queryKey: ["getClients"] }).catch(() => {});
			}
		} else if ("techName" in editdata) {
			//job
		}
	}

	function RenderPart1() {
		if ("isActive" in editdata) {
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
		} else if ("username" in editdata) {
			return (
				<>
					<p>Username:&nbsp;{"username" in editdata ? editdata.username : "invalid"}</p>
					<br />
				</>
			);
		} else if ("techName" in editdata) {
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
		if ("isActive" in editdata) {
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
		} else if ("username" in editdata) {
			return (
				<>
					<FormField
						control={form.control}
						name="cPass"
						render={({ field }) => (
							<FormItem className="row">
								<FormLabel>New Password:</FormLabel>
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
		} else if ("techName" in editdata) {
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
		if ("isActive" in editdata) {
			return (
				<>
					<FormField
						control={form.control}
						name="cActive"
						render={({ field }) => (
							<FormItem className="row">
								<FormLabel>Client Active?:</FormLabel>
								<FormControl>
									<Input type="checkbox" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<br />
				</>
			);
		} else if ("username" in editdata) {
			return (
				<>
					<FormField
						control={form.control}
						name="mPass"
						render={({ field }) => (
							<FormItem className="row">
								<FormLabel>Your Password:</FormLabel>
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
		} else if ("techName" in editdata) {
			return (
				<>
					<FormField
						control={form.control}
						name="clientID"
						render={({ field }) => (
							<FormItem className="row">
								<FormLabel>Client ID:</FormLabel>
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

	function RenderPart4() {
		if ("techName" in editdata) {
			return (
				<>
					<FormField
						control={form.control}
						name="jobFin"
						render={({ field }) => (
							<FormItem className="row">
								<FormLabel>Job Finished?:</FormLabel>
								<FormControl>
									<Input type="checkbox" {...field} />
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
	//TODO: fix submit button not doing anything. maybe non-displayed form fields are still required??
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
