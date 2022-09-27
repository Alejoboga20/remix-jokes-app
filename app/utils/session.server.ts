import { createCookieSessionStorage, redirect } from '@remix-run/node';
import bcrypt from 'bcryptjs';
import { db } from './db.server';

const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
	throw new Error('SESSION_SECRET must be set');
}

export const login = async ({ username, password }: LoginForm) => {
	const user = await db.user.findUnique({ where: { username } });

	if (!user) return null;

	const isCorrectPassword = await bcrypt.compare(password, user.passwordHash);

	if (!isCorrectPassword) return null;

	return { id: user.id, username };
};

const storage = createCookieSessionStorage({
	cookie: {
		name: 'RJ_session',
		// normally you want this to be `secure: true`
		// but that doesn't work on localhost for Safari
		// https://web.dev/when-to-use-local-https/
		secure: process.env.NODE_ENV === 'production',
		secrets: [sessionSecret],
		sameSite: 'lax',
		path: '/',
		maxAge: 60 * 60 * 24 * 30,
		httpOnly: true,
	},
});

const getUserSession = (request: Request) => {
	return storage.getSession(request.headers.get('Cookie'));
};

export const getUserId = async (request: Request) => {
	const session = await getUserSession(request);
	const userId = session.get('userId');
	if (!userId || typeof userId !== 'string') return null;
	return userId;
};

export const requireUserId = async (
	request: Request,
	redirectTo: string = new URL(request.url).pathname
) => {
	const session = await getUserSession(request);
	const userId = session.get('userId');
	if (!userId || typeof userId !== 'string') {
		const searchParams = new URLSearchParams([['redirectTo', redirectTo]]);
		throw redirect(`/login?${searchParams}`);
	}
	return userId;
};

export const createUserSession = async (userId: string, redirectTo: string) => {
	const session = await storage.getSession();
	session.set('userId', userId);

	return redirect(redirectTo, {
		headers: {
			'Set-Cookie': await storage.commitSession(session),
		},
	});
};

type LoginForm = {
	username: string;
	password: string;
};
