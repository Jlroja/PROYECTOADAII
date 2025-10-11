import sys
from utils import leer_entrada, escribir_salida, insatisfaccion_general
from algoritmos.fuerza_bruta import rocFB
from algoritmos.voraz import rocV
from algoritmos.p_dinamica import rocPD

def main():
    if len(sys.argv) != 4:
        print("Uso: python main.py <archivo_entrada> <archivo_salida> <algoritmo>")
        print("Algoritmos: fb | voraz | pd")
        sys.exit(1)

    archivo_entrada = sys.argv[1]
    archivo_salida = sys.argv[2]
    algoritmo = sys.argv[3]

    # Lee la entrada
    k, r, M, E = leer_entrada(archivo_entrada)

    # Selecciona el algoritmo
    if algoritmo == "fb":
        A, costo = rocFB(k, r, M, E)
    elif algoritmo == "voraz":
        A, costo = rocV(k, r, M, E)
    elif algoritmo == "pd":
        A, costo = rocPD(k, r, M, E)
    else:
        print("Algoritmo no válido: usa fb | voraz | pd")
        sys.exit(1)

    # Guarda la salida
    escribir_salida(archivo_salida, A, costo )

if __name__ == "__main__":
    main()
