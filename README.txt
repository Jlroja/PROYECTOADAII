PROYECTOADAII

Este proyecto está dividido en dos partes principales:

- api/ → Contiene la lógica del backend en Python, incluyendo los algoritmos y los endpoints que consume el frontend.
- frontend/ → Contiene la aplicación web desarrollada con React para la interfaz de usuario.

─────────────────────────────
ESTRUCTURA DEL PROYECTO
─────────────────────────────

PROYECTOADAI/
│
├── api/
│   ├── algoritmos/               # Algoritmos de programación dinámica, voraz y fuerza bruta
│   ├── data/                     # Datos de entrada o ejemplos
│   ├── main.py                   # Archivo principal para ejecutar el programa localmente
│   ├── server.py                 # Archivo con los endpoints de la API
│   ├── utils.py                  # Funciones auxiliares
│   ├── requirements.txt          # Dependencias del backend
│   ├── Dockerfile                 # Imagen Docker del backend
│   └── .dockerignore             # Archivos ignorados al construir la imagen
│
├── frontend/
│   ├── public/                   # Archivos estáticos
│   ├── src/
│   │   ├── api/                  # Funciones para consumir la API
│   │   ├── assets/               # Recursos estáticos (imágenes, etc.)
│   │   ├── components/           # Componentes de la UI
│   │   ├── hooks/                # Hooks personalizados
│   │   ├── App.jsx               # Componente raíz
│   │   ├── App.css               # Estilos principales
│   │   └── main.jsx              # Punto de entrada
│   ├── package.json              # Dependencias y scripts de React
│   ├── Dockerfile                 # Imagen Docker del frontend
│   ├── vite.config.js             # Configuración de Vite
│   └── .dockerignore             # Archivos ignorados por Docker
│
├── docker-compose.yml            # Orquestador de contenedores
├── README.md / README.txt        # Documentación del proyecto
└── .gitignore                    # Archivos ignorados por Git

─────────────────────────────
INSTRUCCIONES DE EJECUCIÓN
─────────────────────────────

- Opción 1: Ejecución con Docker (Recomendada) 

1. Tener docker instalado.
2. Desde la raíz del proyecto, ejecutar:
   docker-compose up --build
3. Se crearán dos contenedores:
   - API en el puerto 8000
   - Frontend en el puerto 5173
4. Acceder desde el navegador:
   http://localhost:5173

─────────────────────────────

- Opción 2: Ejecutar sin Docker

Backend (API)
1. cd api
2. python -m venv venv
3. source venv/bin/activate  (en Windows: venv\Scripts\activate)
4. pip install -r requirements.txt
5. python server.py
6. API disponible en http://localhost:8000

Frontend (React)
1. cd frontend
2. npm install
3. npm run dev
4. Accede a http://localhost:5173

─────────────────────────────
AUTORES
─────────────────────────────
Proyecto desarrollado por el equipo 15 

- Javier Andres Lasso Rojas - 2061149
- Juan Esteban Guerrero Camacho - 2040798
- Dylan Farkas Quiza - 2183118