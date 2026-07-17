import { useCallback, useState } from "react";
import { normalizeApiError } from "../../api/errors";
export interface MutationResult<Input, Output> { mutate: (input: Input) => Promise<Output>; loading: boolean; error: string | null }
export function useMutation<Input, Output>(mutation: (input: Input) => Promise<Output>): MutationResult<Input, Output> { const [loading, setLoading] = useState<boolean>(false); const [error, setError] = useState<string | null>(null); const mutate = useCallback(async (input: Input): Promise<Output> => { setLoading(true); setError(null); try { return await mutation(input); } catch (reason: unknown) { setError(normalizeApiError(reason).message); throw reason; } finally { setLoading(false); } }, [mutation]); return { mutate, loading, error }; }
