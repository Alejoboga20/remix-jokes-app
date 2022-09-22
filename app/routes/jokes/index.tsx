import type { LoaderFunction } from '@remix-run/node';
import type { Joke } from '@prisma/client';
import { json } from '@remix-run/node';
import { useLoaderData, Link } from '@remix-run/react';
import { db } from '~/utils/db.server';

export const loader: LoaderFunction = async () => {
	const count = await db.joke.count();
	const randomRowNumber = Math.floor(Math.random() * count);

	const [randomJoke] = await db.joke.findMany({
		take: 1,
		skip: randomRowNumber,
	});

	const data: LoaderData = { randomJoke };
	return json(data);
};

const JokesIndexRoute = () => {
	const { randomJoke } = useLoaderData<LoaderData>();
	return (
		<div>
			<p>Here's a random joke:</p>
			<p>{randomJoke.content}</p>
			<Link to={randomJoke.id}>"{randomJoke.name}" Permalink</Link>
		</div>
	);
};

export default JokesIndexRoute;

type LoaderData = {
	randomJoke: Joke;
};
