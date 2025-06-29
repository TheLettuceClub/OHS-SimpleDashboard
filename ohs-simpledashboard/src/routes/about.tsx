import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
	component: About,
});

//I don't really need this page, I'm just keeping it around as reference in case I do need it.

function About() {
	return <div className="p-2">Hello from About!</div>;
}
