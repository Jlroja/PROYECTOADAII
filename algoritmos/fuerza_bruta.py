import itertools
from utils import insatisfaccion_general

def rocFB(k, r, M, E):
    materias_dict = dict(M)
    best_A = None
    best_cost = float("inf")

    todas_opciones = []
    for ej, msj in E:
        opciones = []
        for l in range(len(msj) + 1):
            for subset in itertools.combinations([m for (m, _) in msj], l):
                opciones.append(list(subset))
        todas_opciones.append((ej, opciones))

    for combo in itertools.product(*[opciones for _, opciones in todas_opciones]):
        A = {}
        cupos_restantes = dict(materias_dict)
        valido = True

        for idx, (ej, _) in enumerate(todas_opciones):
            asignadas = combo[idx]
            for m in asignadas:
                if cupos_restantes[m] <= 0:
                    valido = False
                    break
                cupos_restantes[m] -= 1
            if not valido:
                break
            A[ej] = asignadas

        if valido:
            costo = insatisfaccion_general(M, E, A)
            if costo < best_cost:
                best_cost = costo
                best_A = A

    # 🔹 Garantizar que todos los estudiantes estén presentes
    A_final = {}
    for ej, _ in E:
        if best_A and ej in best_A:
            A_final[ej] = best_A[ej]
        else:
            A_final[ej] = []

    return A_final, best_cost
