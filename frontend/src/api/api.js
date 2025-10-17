const BASE = import.meta.env.VITE_API_BASE || "http://127.0.0.1:8000";

export async function createJob({ file, algoritmo }) {
  const form = new FormData();
  form.append("algoritmo", algoritmo);
  form.append("archivo", file);
  const res = await fetch(`${BASE}/jobs`, { method: "POST", body: form });
  if (!res.ok) throw new Error((await res.json()).detail || "No se pudo crear el job");
  return res.json(); // { job_id, status: "pending" }
}

export async function getJob(jobId) {
  const res = await fetch(`${BASE}/jobs/${jobId}`);
  if (!res.ok) throw new Error((await res.json()).detail || "No se pudo consultar el job");
  return res.json(); // { job_id, status, ... }
}

export async function cancelJob(jobId) {
  const res = await fetch(`${BASE}/jobs/${jobId}/cancel`, { method: "POST" });
  if (!res.ok) throw new Error((await res.json()).detail || "No se pudo cancelar el job");
  return res.json(); // { job_id, status: "cancelled" }
}

export function buildDownloadUrl(download_path_or_fileId) {
  const base = BASE.replace(/\/$/, "");
  // acepta "/download/{file_id}" o directamente un file_id
  const path = download_path_or_fileId.startsWith("/download/")
    ? download_path_or_fileId
    : `/download/${download_path_or_fileId}`;
  return `${base}${path}`;
}
