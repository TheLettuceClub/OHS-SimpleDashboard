import { createRootRoute, Link, Outlet } from "@tanstack/react-router";

//This only creates the top-of-page bar with the routes on it. Add another Link if more pages are added

export const Route = createRootRoute({
	component: () => (
		<>
			<div className="p-2 flex gap-2">
				<Link to="/" className="[&.active]:font-bold">
					Home
				</Link>{" "}
				<Link to="/about" className="[&.active]:font-bold">
					About
				</Link>{" "}
				<Link to="/login" className="[&.active]:font-bold">
					Login
				</Link>
			</div>
			<hr />
			<Outlet />
		</>
	),
});
