import FetchUtilsError from "./FectchErrorUtils";
import { RegisterAbortFunction, AbortFunction, AbortType } from "./AbortUtils";
import ErrorUtils from "./ErrorUtils";

export type AbortableRequest<T = Response> = {
  abort: () => void;
  response: Promise<T>;
};

export default class FetchUtils {
  public static execute(url: string, options?: RequestInit): AbortableRequest {
    const controller = new AbortController();

    const responsePromise = fetch(url, {
      ...options,
      signal: controller.signal,
    });

    return {
      abort: () => controller.abort(),
      response: new Promise((resolve, reject) => {
        return responsePromise
          .then((response) => {
            if (response.ok) {
              resolve(response);
            } else {
              return ErrorUtils.throwJsonApiError(response).catch(reject);
            }
          })
          .catch(reject);
      }),
    };
  }

  public static get(url: string, options?: RequestInit): AbortableRequest {
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
  ): AbortableRequest {
    return this.execute(url, {
      ...options,
      method: "POST",
      credentials: "same-origin",
      headers: {
        ...options?.headers,
        "Content-Type": "application/json",
      },
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  public static put<TBody>(
    url: string,
    body: TBody,
    options?: RequestInit
  ): AbortableRequest {
    return this.execute(url, {
      ...options,
      method: "PUT",
      credentials: "same-origin",
      headers: {
        ...options?.headers,
        "Content-Type": "application/json",
      },
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  public static patch<TBody>(
    url: string,
    body: TBody,
    options?: RequestInit
  ): AbortableRequest {
    return this.execute(url, {
      ...options,
      method: "PATCH",
      credentials: "same-origin",
      headers: {
        ...options?.headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  }

  public static delete(url: string, options?: RequestInit): AbortableRequest {
    return this.execute(url, {
      ...options,
      method: "DELETE",
      credentials: "same-origin",
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
      response: abortableRequest.response.then((response) => response.json()),
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
      response: abortableRequest.response.then((response) => response.json()),
    };
  }

  public static putJson<TResponse, TBody>(
    url: string,
    body: TBody,
    options?: RequestInit
  ): AbortableRequest<TResponse> {
    const abortableRequest = this.put(url, body, options);

    return {
      abort: abortableRequest.abort,
      response: abortableRequest.response.then((response) => response.json()),
    };
  }

  public static patchJson<TResponse, TBody>(
    url: string,
    body: TBody,
    options?: RequestInit
  ): AbortableRequest<TResponse> {
    const abortableRequest = this.patch(url, body, options);

    return {
      abort: abortableRequest.abort,
      response: abortableRequest.response.then((response) => response.json()),
    };
  }

  public static deleteJson<TResponse>(
    url: string,
    options?: RequestInit
  ): AbortableRequest<TResponse> {
    const abortableRequest = this.delete(url, options);
    return {
      abort: abortableRequest.abort,
      response: abortableRequest.response.then((response) => response.json()),
    };
  }

  public static abortableRequest<
    TResponse = unknown,
    TAccessedData = TResponse
  >(
    request: AbortableRequest<TResponse>,
    registerAbort?: RegisterAbortFunction,
    dataAccessor?: (data: TResponse) => TAccessedData
  ): AbortableRequest<TAccessedData> {
    let rejectPromise: AbortFunction;

    const abort: AbortFunction = (type = AbortType.EXPLICIT) => {
      // This will implicitly cancel the query if it's still running
      request.abort();
      rejectPromise(type);
    };
    const unregisterAbort = registerAbort?.(abort);

    const dataPromise = new Promise<TAccessedData>((resolve, reject) => {
      request.response
        .then((response) => {
          unregisterAbort?.();
          resolve(
            dataAccessor
              ? dataAccessor(response)
              : (response as unknown as TAccessedData)
          );
        })
        .catch(reject);

      rejectPromise = (type: AbortType) =>
        reject(new FetchUtilsError("Aborted", type, 0));
    });

    return {
      response: dataPromise,
      abort,
    } as AbortableRequest<TAccessedData>;
  }
}
