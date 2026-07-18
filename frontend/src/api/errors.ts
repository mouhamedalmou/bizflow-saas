import axios from "axios";
import type { ApiErrorBody } from "../types";

export class ApiClientError extends Error { constructor(message: string, readonly status: number, readonly details?: unknown) { super(message); this.name = new.target.name; } }
export class ValidationError extends ApiClientError { constructor(message = "I dati inseriti non sono validi.", details?: unknown) { super(message, 422, details); } }
export class NotFoundError extends ApiClientError { constructor(message = "La risorsa richiesta non è stata trovata.") { super(message, 404); } }
export class UnauthorizedError extends ApiClientError { constructor(message = "La sessione è scaduta. Accedi nuovamente.", status = 401) { super(message, status); } }
export class ServerError extends ApiClientError { constructor(message = "Il server non è al momento disponibile.", status = 500) { super(message, status); } }

const fallbackByStatus: Record<number, string> = { 400: "Richiesta non valida.", 401: "La sessione è scaduta. Accedi nuovamente.", 403: "Non hai i permessi necessari.", 404: "La risorsa richiesta non è stata trovata.", 409: "L'operazione è in conflitto con i dati esistenti.", 422: "I dati inseriti non sono validi.", 500: "Si è verificato un errore del server." };

export function normalizeApiError(error: unknown, fallback = "Si è verificato un errore imprevisto."): ApiClientError {
  if (error instanceof ApiClientError) return error;
  if (!axios.isAxiosError<ApiErrorBody>(error)) return new ApiClientError(error instanceof Error ? error.message : fallback, 0);
  const status = error.response?.status ?? 0;
  const validationMessage = error.response?.data?.errors?.find((item) => item.msg || item.message);
  const message = validationMessage?.msg
    ?? validationMessage?.message
    ?? error.response?.data?.message
    ?? error.response?.data?.error
    ?? (error.code === "ECONNABORTED"
      ? "La richiesta ha impiegato troppo tempo."
      : error.code === "ERR_NETWORK"
        ? "Backend non raggiungibile. Verifica che il server API sia avviato."
        : fallbackByStatus[status] ?? fallback);
  if (status === 401 || status === 403) return new UnauthorizedError(message, status);
  if (status === 404) return new NotFoundError(message);
  if (status === 400 || status === 409 || status === 422) return new ValidationError(message, error.response?.data);
  if (status >= 500) return new ServerError(message, status);
  return new ApiClientError(message, status, error.response?.data);
}
