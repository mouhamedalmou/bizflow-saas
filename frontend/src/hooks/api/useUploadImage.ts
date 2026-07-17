import { useCallback, useState } from "react";
import api from "../../api/axios";
import { normalizeApiError } from "../../api/errors";

interface UploadResult { url: string }
export function useUploadImage(file: File | null) { const [loading, setLoading] = useState<boolean>(false); const [progress, setProgress] = useState<number>(0); const [error, setError] = useState<string | null>(null); const mutate = useCallback(async (): Promise<UploadResult> => { if (!file) throw new Error("Seleziona un'immagine da caricare."); setLoading(true); setProgress(0); setError(null); const form = new FormData(); form.append("image", file); try { const { data } = await api.post<{ imageUrl: string }>("/upload/image", form, { onUploadProgress: (event) => { if (event.total) setProgress(Math.round((event.loaded / event.total) * 100)); } }); setProgress(100); return { url: data.imageUrl }; } catch (reason: unknown) { setError(normalizeApiError(reason, "Caricamento immagine non riuscito.").message); throw reason; } finally { setLoading(false); } }, [file]); return { mutate, loading, progress, error }; }
