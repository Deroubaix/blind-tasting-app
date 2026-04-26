"use client";

import FetchUtils from "../../utils/FetchUtils";
import { TastingData } from "../../types/TastingData";

export type TastingResponse = {
  message: string;
  tasting: TastingData;
};

export default class ClientTastingService {
  public saveTasting(data: TastingData) {
    const request = FetchUtils.postJson<TastingResponse>("/api/tastings", data);
    return FetchUtils.abortableRequest(request);
  }

  public async getTastings(): Promise<TastingData[]> {
    const request = FetchUtils.getJson<{ tastings: TastingData[] }>(
      "/api/tastings"
    );
    const response = await request.response;
    console.log("Response from GET /api/tastings:", response);

    return response.tastings;
  }
}
