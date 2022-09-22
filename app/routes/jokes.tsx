import { Outlet } from '@remix-run/react';

const JokesRoute = () => {
	return (
		<div>
			<h1>J🤪KES</h1>
			<main>
				<Outlet />
			</main>
		</div>
	);
};

export default JokesRoute;
