"use client";

import FetchUtils from "../../utils/FetchUtils";
import { AuthenticatedUser } from "../../services/server/IAuthService";

export default class ClientAuthService {
  public async login(
    email: string,
    password: string
  ): Promise<AuthenticatedUser> {
    const request = FetchUtils.postJson<AuthenticatedUser>("/api/auth/login", {
      email,
      password,
    });
    return await request.response;
  }

  public async signup(
    name: string,
    email: string,
    password: string
  ): Promise<void> {
    const request = FetchUtils.post("/api/auth/signup", {
      displayName: name,
      email,
      password,
    });

    await request.response;
  }
}
