from utils import insatisfaccion_general

def rocV(k, r, M, E):
    cupos_restantes = dict(M)
    A = {}

    E_ordenados = sorted(E, key=lambda x: sum(p for (_, p) in x[1]), reverse=True)

    for ej, msj in E_ordenados:
        asignadas = []
        for (m, p) in sorted(msj, key=lambda x: -x[1]):
            if cupos_restantes[m] > 0:
                asignadas.append(m)
                cupos_restantes[m] -= 1
        A[ej] = asignadas

    costo = insatisfaccion_general(M, E, A)
    return A, costo
