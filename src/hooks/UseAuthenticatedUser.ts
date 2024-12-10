import { AuthenticatedUser } from "../services/server/IAuthService";
import {
  AuthContextValue,
  useAuthProvider,
} from "../components/auth/AuthProvider";

export type UseAuthenticatedUser<
  T extends AuthenticatedUser = AuthenticatedUser
> = Pick<AuthContextValue, "isLoading" | "isInitialLoading"> & {
  user: T | null;
};

export default function useAuthenticatedUser<
  T extends AuthenticatedUser = AuthenticatedUser
>(): UseAuthenticatedUser<T> {
  const authContext = useAuthProvider();

  return {
    user: (authContext?.user as T) ?? null,
    isLoading: authContext?.isLoading ?? false,
    isInitialLoading: authContext?.isInitialLoading ?? false,
  };
}
