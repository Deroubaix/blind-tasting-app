import FetchUtils from "../../utils/FetchUtils";
import { AuthenticatedUser } from "./IAuthService";

export class SessionAuthService {
  async signIn(
    email: string,
    password: string
  ): Promise<AuthenticatedUser | null> {
    try {
      const request = FetchUtils.postJson<AuthenticatedUser>(
        "/api/auth/login",
        { email, password }
      );
      return await request.response;
    } catch (err) {
      console.error("Sign-in failed:", err);
      throw err;
    }
  }

  async signOut(): Promise<void> {
    try {
      await FetchUtils.get("/api/auth/logout", { credentials: "include" })
        .response;
    } catch (err) {
      console.error("Sign-out failed:", err);
    }
  }

  async fetchMe(): Promise<AuthenticatedUser | null> {
    try {
      const request = FetchUtils.getJson<AuthenticatedUser>("/api/user/me", {
        credentials: "include",
      });
      return await request.response;
    } catch (err) {
      console.warn("Fetch user failed:", err);
      return null;
    }
  }

  async updateUser(user: AuthenticatedUser): Promise<AuthenticatedUser> {
    try {
      const request = FetchUtils.postJson<AuthenticatedUser>(
        "/api/user/me",
        user
      );
      return await request.response;
    } catch (err) {
      console.error("Update user failed:", err);
      throw err;
    }
  }
}
