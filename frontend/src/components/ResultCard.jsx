import { buildDownloadUrl } from "../api/api";

export default function ResultCard({ job }) {
  if (!job) return null;

  const { status, message, costo_str, salida_txt, file_id, asignaciones } = job;

  const toneClasses = {
    gray: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/40 dark:text-gray-200 dark:border-gray-700",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
    blue: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
    green: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
    red: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
  };

  const Badge = ({ children, tone = "gray" }) => (
    <span
      className={[
        "px-2 py-1 rounded-lg text-xs border",
        "transition-colors",
        toneClasses[tone] || toneClasses.gray,
      ].join(" ")}
    >
      {children}
    </span>
  );

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-soft rounded-2xl p-6 transition-colors">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold">Estado de la ejecución</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            ID: <span className="font-mono">{job.job_id}</span>
          </p>
        </div>
        <div>
          {status === "pending" && <Badge tone="yellow">Pendiente</Badge>}
          {status === "running" && <Badge tone="blue">En ejecución</Badge>}
          {status === "done" && <Badge tone="green">Completado</Badge>}
          {status === "error" && <Badge tone="red">Error</Badge>}
          {status === "cancelled" && <Badge tone="gray">Cancelado</Badge>}
        </div>
      </div>

      {/* Mensajes o resultado */}
      {(status === "pending" || status === "running") && (
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Procesando… (actualizando cada ~1–2s)
        </div>
      )}

      {status === "error" && (
        <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3 dark:text-red-300 dark:bg-red-900/20 dark:border-red-800">
          {message || "Falló la ejecución."}
        </div>
      )}

      {status === "cancelled" && (
        <div className="mt-4 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl p-3 dark:text-gray-300 dark:bg-gray-900/30 dark:border-gray-800">
          Ejecución cancelada por el usuario.
        </div>
      )}

      {status === "done" && (
        <div className="mt-5 grid md:grid-cols-2 gap-6">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Insatisfacción general</div>
            <div className="text-2xl font-bold tracking-tight">{costo_str}</div>

            <h4 className="font-medium text-gray-700 dark:text-gray-200 mt-4 mb-2">Asignaciones</h4>
            <div className="space-y-3 max-h-[360px] overflow-auto pr-1">
              {asignaciones?.map((a) => (
                <div
                  key={a.estudiante}
                  className="border border-gray-200 dark:border-gray-800 rounded-xl p-3 bg-white dark:bg-gray-950/40 transition-colors"
                >
                  <div className="text-sm text-gray-500 dark:text-gray-400">Estudiante</div>
                  <div className="font-semibold">{a.estudiante}</div>
                  <div className="text-sm mt-1 text-gray-600 dark:text-gray-300">
                    Materias asignadas: <span className="font-medium">{a.cantidad}</span>
                  </div>
                  {a.materias.length > 0 ? (
                    <ul className="list-disc pl-5 text-sm mt-1">
                      {a.materias.map((m) => (
                        <li key={m} className="font-mono">
                          {m}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">— Sin materias —</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-200 mb-3">Salida exacta (.txt)</h4>
            <pre className="bg-gray-50 dark:bg-gray-950/60 border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-sm max-h-[360px] overflow-auto transition-colors">
              {salida_txt}
            </pre>

            {!!file_id && (
              <a
                href={buildDownloadUrl(file_id)}
                className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-xl bg-gray-900 text-white hover:opacity-90 dark:bg-gray-100 dark:text-gray-900 dark:hover:opacity-80 transition-colors"
                download
              >
                Descargar .txt
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
