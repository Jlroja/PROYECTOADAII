import { useRef, useState } from "react";

const ALGOS = [
  { value: "pd", label: "Programación Dinámica" },
  { value: "voraz", label: "Voraz" },
  { value: "fb", label: "Fuerza Bruta" },
];

const PREVIEW_LIMIT = 200 * 1024; // 200 KB máximo para vista previa

export default function UploadPanel({ onStartJob, onClear, jobRunning }) {
  const fileRef = useRef(null);
  const [algoritmo, setAlgoritmo] = useState("pd");
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [truncated, setTruncated] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  // 🔹 Leer y mostrar contenido del archivo
  const readFilePreview = async (file) => {
    try {
      const slice = file.size > PREVIEW_LIMIT ? file.slice(0, PREVIEW_LIMIT) : file;
      const text = await slice.text();
      setPreview(text);
      setTruncated(file.size > PREVIEW_LIMIT);
    } catch {
      setPreview("Error al leer el archivo.");
    }
  };

  const pickFile = async (file) => {
    setError("");
    setPreview("");
    if (!file) return;

    if (!file.name.endsWith(".txt")) {
      setError("El archivo debe ser .txt");
      setSelectedFile(null);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    setSelectedFile(file);
    await readFilePreview(file);
  };

  const onDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    await pickFile(e.dataTransfer?.files?.[0]);
  };

  const onExecute = async () => {
    setError("");
    if (!selectedFile) {
      setError("Primero selecciona un archivo .txt.");
      return;
    }
    await onStartJob({ file: selectedFile, algoritmo });
  };

  const clearAll = () => {
    setSelectedFile(null);
    setPreview("");
    setTruncated(false);
    setError("");
    if (fileRef.current) fileRef.current.value = "";
    onClear?.();
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-soft rounded-2xl p-6 transition-colors">
      <div className="flex flex-col gap-4">
        {/* Selector de algoritmo */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Algoritmo
          </label>
          <div className="flex gap-2">
            {ALGOS.map((a) => (
              <button
                key={a.value}
                className={`px-3 py-2 rounded-xl text-sm border transition-colors cursor-pointer ${
                  algoritmo === a.value
                    ? "bg-gray-900 text-white border-gray-900 dark:bg-gray-100 dark:text-gray-900 dark:border-gray-100"
                    : "bg-white border-gray-300 hover:border-gray-400 text-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:border-gray-500"
                }`}
                onClick={() => setAlgoritmo(a.value)}
                type="button"
                disabled={jobRunning}
              >
                {a.label}
              </button>
            ))}
          </div>
        </div>

        {/* Zona de carga */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${
            dragActive
              ? "border-gray-900 bg-gray-50 dark:border-gray-200 dark:bg-gray-800"
              : "border-gray-300 dark:border-gray-600"
          }`}
        >
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Arrastra y suelta tu archivo{" "}
            <span className="font-mono">.txt</span> aquí
            <span className="mx-1">o</span>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="underline underline-offset-4 text-gray-800 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400 cursor-pointer"
              disabled={jobRunning}
            >
              busca en tu equipo
            </button>
          </p>
          <input
            type="file"
            accept=".txt"
            ref={fileRef}
            onChange={(e) => pickFile(e.target.files?.[0])}
            className="hidden"
            disabled={jobRunning}
          />

          <div className="mt-4">
            {selectedFile ? (
              <div className="inline-flex items-center gap-3 px-3 py-2 rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-800 text-gray-800 dark:text-gray-200">
                <span className="text-sm">
                  Seleccionado: <strong>{selectedFile.name}</strong>{" "}
                  <span className="text-xs text-gray-500">
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </span>
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs px-2 py-1 rounded-lg border border-gray-300 hover:bg-gray-100 dark:border-gray-500 dark:hover:bg-gray-700 dark:text-gray-200"
                  disabled={jobRunning}
                >
                  Quitar
                </button>
              </div>
            ) : (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Ningún archivo seleccionado.
              </span>
            )}
          </div>
        </div>

        {/* Vista previa del contenido de entrada */}
        {selectedFile && preview && (
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contenido del archivo (.txt)
            </h4>
            <pre className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-3 text-sm max-h-[360px] overflow-auto whitespace-pre-wrap font-mono text-gray-800 dark:text-gray-200">
{preview}
            </pre>
            {truncated && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Vista previa truncada a {Math.round(PREVIEW_LIMIT / 1024)} KB.
              </p>
            )}
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onExecute}
            disabled={!selectedFile || jobRunning}
            className="px-4 py-2 rounded-xl bg-gray-900 text-white hover:opacity-90 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:opacity-80 cursor-pointer"
          >
            Ejecutar
          </button>

          <button
            onClick={clearAll}
            className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800 cursor-pointer"
            disabled={jobRunning}
          >
            Limpiar todo
          </button>

          <span className="text-sm text-gray-500 dark:text-gray-400">
            {jobRunning
              ? "Ejecución en curso..."
              : selectedFile
              ? "Listo para ejecutar."
              : "Selecciona un .txt para habilitar 'Ejecutar'."}
          </span>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3 dark:bg-red-950/30 dark:border-red-800 dark:text-red-400">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
