import { type User } from '@prisma/client';

export enum AuthEvent {
	UserChanged = 'UserChanged',
	FetchingUser = 'FetchingUser',
}

export type AuthenticatedUser = Omit<User, 'password' | 'resetToken' | 'resetTokenExpiry'>;

export interface IAuthService {
	signIn(email: string, password: string): Promise<AuthenticatedUser | null>;

	signUp(displayName: string, email: string, password: string): Promise<void>;

	signOut(): Promise<void>;

	fetchMe(): Promise<AuthenticatedUser | null>;

	updateUser(user: AuthenticatedUser): Promise<AuthenticatedUser>;

	requestPasswordReset(email: string): Promise<void>;

	completePasswordReset(email: string, token: string, password: string): Promise<void>;
}
