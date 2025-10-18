def insatisfaccion_general(M, E, A):
    r = len(E)
    total = 0
    for ej, msj in E:
        asignadas = set(A.get(ej, []))
        num_solicitadas = len(msj)
        gamma = 3 * num_solicitadas - 1
        suma_no_asignadas = sum(p for (m, p) in msj if m not in asignadas)
        fj = (1 - len(asignadas) / num_solicitadas) * (suma_no_asignadas / gamma)
        total += fj
    return total / r

def leer_entrada(ruta):
    with open(ruta, "r") as f:
        lineas = [line.strip() for line in f if line.strip()]

    idx = 0
    k = int(lineas[idx]); idx += 1
    M = []
    for _ in range(k):
        codigo, cupo = lineas[idx].split(",")
        M.append((codigo, int(cupo)))
        idx += 1

    r = int(lineas[idx]); idx += 1
    E = []
    for _ in range(r):
        cod_est, s = lineas[idx].split(",")
        s = int(s); idx += 1
        materias = []
        for __ in range(s):
            m, p = lineas[idx].split(",")
            materias.append((m, int(p)))
            idx += 1
        E.append((cod_est, materias))

    return k, r, M, E

def escribir_salida(ruta, A, costo):
    with open(ruta, "w") as f:
        f.write(f"{costo:.4f}\n")
        for ej, materias in A.items():
            f.write(f"{ej},{len(materias)}\n")
            for m in materias:
                f.write(f"{m}\n")
