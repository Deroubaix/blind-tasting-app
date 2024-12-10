import { User } from "@prisma/client";

export enum AuthEvent {
  UserChanged = "UserChanged",
  FetchingUser = "FetchingUser",
}

export type AuthenticatedUser = Omit<User, "password">;

export interface IAuthService {
  signIn(email: string, password: string): Promise<AuthenticatedUser | null>;
  signOut(): Promise<void>;
  fetchMe(): Promise<AuthenticatedUser | null>;
  updateUser(user: AuthenticatedUser): Promise<AuthenticatedUser>;
}
