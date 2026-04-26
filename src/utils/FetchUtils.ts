import FetchUtilsError from "./FectchErrorUtils";
import { RegisterAbortFunction, AbortFunction, AbortType } from "./AbortUtils";
import ErrorUtils from "./ErrorUtils";

export type AbortableRequest<T = Response> = {
  abort: () => void;
  response: Promise<T>;
};

export default class FetchUtils {
  public static execute(
    url: string,
    options?: RequestInit
  ): AbortableRequest<Response> {
    const controller = new AbortController();

    const responsePromise = fetch(url, {
      ...options,
      signal: controller.signal,
    });

    return {
      abort: () => controller.abort(),
      response: new Promise((resolve, reject) => {
        responsePromise
          .then(async (response) => {
            if (response.ok) {
              resolve(response);
            } else {
              try {
                await ErrorUtils.throwJsonApiError(response);
              } catch (error) {
                reject(error);
              }
            }
          })
          .catch(reject);
      }),
    };
  }

  public static get(
    url: string,
    options?: RequestInit
  ): AbortableRequest<Response> {
    return this.execute(url, {
      ...options,
      method: "GET",
      credentials: "same-origin",
    });
  }

  public static post<TBody>(
    url: string,
    body: TBody,
    options?: RequestInit
  ): AbortableRequest<Response> {
    return this.execute(url, {
      ...options,
      method: "POST",
      credentials: "same-origin",
      headers: {
        ...options?.headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  }

  public static getJson<TResponse>(
    url: string,
    options?: RequestInit
  ): AbortableRequest<TResponse> {
    const abortableRequest = this.get(url, {
      ...options,
      headers: {
        ...options?.headers,
        "Content-Type": "application/json",
      },
    });

    return {
      abort: abortableRequest.abort,
      response: abortableRequest.response.then(
        (response) => response.json() as Promise<TResponse>
      ),
    };
  }

  public static postJson<TResponse, TBody = object>(
    url: string,
    body: TBody,
    options?: RequestInit
  ): AbortableRequest<TResponse> {
    const abortableRequest = this.post(url, body, options);

    return {
      abort: abortableRequest.abort,
      response: abortableRequest.response.then(
        (response) => response.json() as Promise<TResponse>
      ),
    };
  }

  public static abortableRequest<TResponse>(
    request: AbortableRequest<TResponse>,
    registerAbort?: RegisterAbortFunction
  ): AbortableRequest<TResponse> {
    let rejectPromise: AbortFunction;

    const abort = () => {
      request.abort();
      rejectPromise?.(AbortType.EXPLICIT);
    };

    const unregisterAbort = registerAbort?.(abort);

    const responsePromise = new Promise<TResponse>((resolve, reject) => {
      request.response
        .then((response) => {
          unregisterAbort?.();
          resolve(response);
        })
        .catch((error) => {
          unregisterAbort?.();
          reject(error);
        });

      rejectPromise = (type: AbortType) =>
        reject(new FetchUtilsError("Aborted", type, 0));
    });

    return {
      response: responsePromise,
      abort,
    };
  }
}
