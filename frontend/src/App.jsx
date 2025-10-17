import { useEffect, useRef, useState } from "react";
import UploadPanel from "./components/UploadPanel";
import ResultCard from "./components/ResultCard";
import { createJob, getJob, cancelJob } from "../src/api/api";
import ThemeToggle from "./components/ThemeToggle";

export default function App() {
  const [job, setJob] = useState(null);
  const [jobRunning, setJobRunning] = useState(false);
  const pollRef = useRef(null);
  const POLL_MS = 1500;

  const startPolling = (jobId) => {
    stopPolling();
    pollRef.current = setInterval(async () => {
      try {
        const data = await getJob(jobId);
        setJob(data);
        if (["done", "error", "cancelled"].includes(data.status)) {
          setJobRunning(false);
          stopPolling();
        }
      } catch {
        stopPolling();
      }
    }, POLL_MS);
  };

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  useEffect(() => () => stopPolling(), []);

  const onStartJob = async ({ file, algoritmo }) => {
    stopPolling();
    setJob(null);
    setJobRunning(true);
    try {
      const created = await createJob({ file, algoritmo });
      setJob({ ...created });
      startPolling(created.job_id);
    } catch (e) {
      setJobRunning(false);
      setJob({
        job_id: "N/A",
        status: "error",
        message: e.message || "Error creando el job",
      });
    }
  };

  const onCancel = async () => {
    if (!job?.job_id) return;
    try { await cancelJob(job.job_id); } catch {}
  };

  const onClear = () => {
    stopPolling();
    setJob(null);
    setJobRunning(false);
  };

  const showCancel = jobRunning && job && ["pending", "running"].includes(job.status);

  return (
    <div
      className={[
        "min-h-dvh antialiased",
        "bg-white text-gray-900",
        "dark:bg-gray-950 dark:text-gray-100",
        "motion-safe:transition-colors",
        "[color-scheme:light] dark:[color-scheme:dark]",
        "selection:bg-gray-900 selection:text-white",
        "dark:selection:bg-gray-200 dark:selection:text-gray-900",
      ].join(" ")}
    >
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="mb-6 flex items-center justify-between gap-3 border-b border-gray-200 dark:border-gray-800 pb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Asignación de cupos</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Carga un archivo <span className="font-mono">.txt</span> y elige el algoritmo.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {showCancel && (
              <button
                onClick={onCancel}
                className={[
                  "px-4 py-2 rounded-xl border",
                  "border-gray-300 text-gray-700 hover:bg-gray-100",
                  "dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800",
                  "focus-visible:outline-none",
                  "focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
                  "dark:focus-visible:ring-gray-600 dark:focus-visible:ring-offset-gray-950",
                  "transition-colors cursor-pointer"
                ].join(" ")}
              >
                Cancelar
              </button>
            )}
          </div>
        </header>

        <div className="rounded-2xl p-1 supports-[backdrop-filter]:backdrop-blur-sm bg-transparent">
          <div className="space-y-6">
            <UploadPanel onStartJob={onStartJob} onClear={onClear} jobRunning={jobRunning} />
            <ResultCard job={job} />
          </div>
        </div>
      </div>
    </div>
  );
}
