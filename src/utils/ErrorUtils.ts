import FetchUtilsError from "./FectchErrorUtils";
import { AbortType } from "./AbortUtils";

export interface IJsonApiError {
  error: string;
  message: string | string[];
  statusCode?: number;
}

export class JsonApiError extends Error implements IJsonApiError {
  constructor(
    public readonly error: string,
    public readonly message: string,
    public readonly statusCode?: number
  ) {
    super(message);
  }

  public static create(error: unknown) {
    if (this.isJsonApiError(error)) {
      if (error instanceof JsonApiError) {
        return error;
      } else {
        return new JsonApiError(
          error.error,
          typeof error.message == "string"
            ? error.message
            : error.message.join("\n"),
          error.statusCode
        );
      }
    } else {
      if (error instanceof Error) {
        return new JsonApiError(error.name, error.message);
      } else {
        return new JsonApiError("Unknown", `${error}`);
      }
    }
  }

  public static isJsonApiError(error: unknown): error is IJsonApiError {
    if (error !== null && error !== undefined && typeof error === "object") {
      return "message" in error && "statusCode" in error;
    }
    return false;
  }

  public static toJson(error: IJsonApiError) {
    return {
      error: error.error,
      message: error.message,
      statusCode: error.statusCode,
    };
  }
}

export default class ErrorUtils {
  public static isUnmountError(error: unknown): boolean {
    if (error instanceof FetchUtilsError) {
      return error.type === AbortType.UNMOUNT;
    }
    if (error instanceof DOMException) {
      return (
        error.code === DOMException.ABORT_ERR || error.name === "AbortError"
      );
    }
    return false;
  }

  public static async throwJsonApiError(response: Response) {
    if (!response.bodyUsed) {
      const responseData = await response.json();
      if (JsonApiError.isJsonApiError(responseData)) {
        throw JsonApiError.create(responseData);
      } else {
        throw new FetchUtilsError(
          `Request failed with status code ${response.status}`,
          AbortType.UNKNOWN,
          response.status,
          responseData
        );
      }
    } else {
      throw new FetchUtilsError(
        `Request failed with status code ${response.status}`,
        AbortType.UNKNOWN,
        response.status
      );
    }
  }
}
