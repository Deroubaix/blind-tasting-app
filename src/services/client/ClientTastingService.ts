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

  public getTastings() {
    const request = FetchUtils.getJson<TastingData[]>("/api/tastings");
    return FetchUtils.abortableRequest(request);
  }
}
