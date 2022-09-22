import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { db } from '~/utils/db.server';

export const loader: LoaderFunction = async ({ params }) => {
	const joke = await db.joke.findUnique({
		where: { id: params.jokeId },
		select: { id: true, name: true, content: true },
	});
	if (!joke) throw new Error('Joke not found');

	const data: LoaderData = { joke };

	return json(data);
};

const JokeRoute = () => {
	const { joke } = useLoaderData<LoaderData>();
	return (
		<div>
			<p>Here's your hilarious joke:</p>
			<p>{joke.content}</p>
			<Link to='.'>{joke.name} Permalink</Link>
		</div>
	);
};

export default JokeRoute;

type LoaderData = {
	joke: { name: string; content: string; id: string };
};
