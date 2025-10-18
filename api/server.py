# api/server.py (mejorado con metadatos descriptivos)
import os, uuid, asyncio, time, datetime
from typing import Literal, List, Dict, Any, Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from utils import leer_entrada
from algoritmos.fuerza_bruta import rocFB
from algoritmos.voraz import rocV
from algoritmos.p_dinamica import rocPD

# --- Configuración base ---
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUTPUT_DIR = os.path.join(BASE_DIR, "api/outputs")
os.makedirs(OUTPUT_DIR, exist_ok=True)

app = FastAPI(title="Asignación de cupos API", version="2.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Algoritmo = Literal["fb", "voraz", "pd"]

# --- Modelo de respuesta de estado ---
class JobStatus(BaseModel):
    job_id: str
    status: Literal["pending", "running", "done", "error", "cancelled"]
    progress: float = 0.0
    message: Optional[str] = None
    file_id: Optional[str] = None
    costo_str: Optional[str] = None
    salida_txt: Optional[str] = None
    asignaciones: Optional[List[Dict[str, Any]]] = None
    algoritmo: Optional[str] = None
    filename: Optional[str] = None
    created_at: Optional[str] = None


# --- Job Manager ---
JOBS: Dict[str, Dict[str, Any]] = {}
JOBS_LOCK = asyncio.Lock()


# --- Utilidades ---
def timestamp_str():
    return datetime.datetime.now().strftime("%Y%m%d_%H%M%S")


def build_output_text(costo: float, A: Dict[str, List[str]]) -> str:
    lines = [f"{costo:.4f}"]
    for ej, materias in A.items():
        lines.append(f"{ej},{len(materias)}")
        for m in materias:
            lines.append(f"{m}")
    return "\n".join(lines) + "\n"


def to_assignments_list(A: Dict[str, List[str]]) -> List[Dict[str, Any]]:
    return [{"estudiante": ej, "cantidad": len(mats), "materias": mats} for ej, mats in A.items()]


def run_algorithm(algoritmo: Algoritmo, k: int, r: int, M, E, cancel_cb=None):
    if algoritmo == "fb":
        return rocFB(k, r, M, E, cancel_cb=cancel_cb)
    elif algoritmo == "voraz":
        return rocV(k, r, M, E, cancel_cb=cancel_cb)
    elif algoritmo == "pd":
        return rocPD(k, r, M, E, cancel_cb=cancel_cb)
    raise HTTPException(status_code=400, detail="Algoritmo no válido (fb|voraz|pd)")


# --- Ejecución asíncrona de jobs ---
async def execute_job(job_id: str, algoritmo: Algoritmo, tmp_in_path: str, filename: str):
    cancel_flag = {"value": False}
    async with JOBS_LOCK:
        JOBS[job_id]["cancel_flag"] = cancel_flag

    def cancel_cb():
        return cancel_flag["value"]

    try:
        async with JOBS_LOCK:
            JOBS[job_id]["status"] = "running"

        # Leer entrada
        k, r, M, E = leer_entrada(tmp_in_path)

        loop = asyncio.get_running_loop()
        A, costo = await loop.run_in_executor(None, run_algorithm, algoritmo, k, r, M, E, cancel_cb)

        salida_txt = build_output_text(costo, A)

        base_name = os.path.splitext(filename)[0].replace(" ", "_")
        time_tag = timestamp_str()
        file_id = f"{algoritmo}_{base_name}_{time_tag}"
        out_path = os.path.join(OUTPUT_DIR, f"{file_id}.txt")

        with open(out_path, "w", encoding="utf-8") as f:
            f.write(salida_txt)

        async with JOBS_LOCK:
            JOBS[job_id].update({
                "status": "done",
                "file_id": file_id,
                "costo_str": f"{costo:.4f}",
                "salida_txt": salida_txt,
                "asignaciones": to_assignments_list(A),
            })
    except RuntimeError as e:
        if "CANCELLED" in str(e):
            async with JOBS_LOCK:
                JOBS[job_id]["status"] = "cancelled"
        else:
            async with JOBS_LOCK:
                JOBS[job_id]["status"] = "error"
                JOBS[job_id]["message"] = str(e)
    except Exception as e:
        async with JOBS_LOCK:
            JOBS[job_id]["status"] = "error"
            JOBS[job_id]["message"] = str(e)


# --- Endpoints ---
@app.get("/algoritmos")
def algoritmos():
    return {"algoritmos": ["fb", "voraz", "pd"]}


@app.post("/jobs", response_model=JobStatus)
async def create_job(algoritmo: Algoritmo = Form(...), archivo: UploadFile = File(...)):
    if not archivo.filename.endswith(".txt"):
        raise HTTPException(status_code=400, detail="El archivo debe ser .txt")

    job_id = str(uuid.uuid4())
    tmp_in_path = os.path.join(OUTPUT_DIR, f"{job_id}_in.txt")

    with open(tmp_in_path, "wb") as f:
        f.write(await archivo.read())

    created_at = timestamp_str()
    async with JOBS_LOCK:
        JOBS[job_id] = {
            "status": "pending",
            "message": None,
            "file_id": None,
            "costo_str": None,
            "salida_txt": None,
            "asignaciones": None,
            "algoritmo": algoritmo,
            "filename": archivo.filename,
            "created_at": created_at,
        }

    asyncio.create_task(execute_job(job_id, algoritmo, tmp_in_path, archivo.filename))
    return JobStatus(
        job_id=job_id,
        status="pending",
        progress=0.0,
        algoritmo=algoritmo,
        filename=archivo.filename,
        created_at=created_at,
    )


@app.get("/jobs/{job_id}", response_model=JobStatus)
async def get_job(job_id: str):
    async with JOBS_LOCK:
        job = JOBS.get(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job no encontrado")
        return JobStatus(
            job_id=job_id,
            status=job["status"],
            message=job.get("message"),
            file_id=job.get("file_id"),
            costo_str=job.get("costo_str"),
            salida_txt=job.get("salida_txt"),
            asignaciones=job.get("asignaciones"),
            algoritmo=job.get("algoritmo"),
            filename=job.get("filename"),
            created_at=job.get("created_at"),
        )


@app.post("/jobs/{job_id}/cancel", response_model=JobStatus)
async def cancel_job(job_id: str):
    async with JOBS_LOCK:
        job = JOBS.get(job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job no encontrado")
        if job["status"] in ("done", "error", "cancelled"):
            return JobStatus(job_id=job_id, status=job["status"], message="No es posible cancelar en este estado.")
        if "cancel_flag" in job:
            job["cancel_flag"]["value"] = True
        job["status"] = "cancelled"
        return JobStatus(job_id=job_id, status="cancelled", message="Cancelación solicitada.")


@app.get("/download/{file_id}", response_class=FileResponse)
def download(file_id: str):
    path = os.path.join(OUTPUT_DIR, f"{file_id}.txt")
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Archivo no encontrado")
    return FileResponse(path, media_type="text/plain", filename=f"respuesta_{file_id}.txt")


@app.get("/health")
def health():
    return {"status": "ok"}
