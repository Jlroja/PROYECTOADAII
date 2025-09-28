import itertools
from functools import lru_cache
from utils import insatisfaccion_general

def rocPD(k, r, M, E):
    materias_dict = dict(M)
    cupos_iniciales = tuple(materias_dict[m] for m, _ in M)
    codigos_materias = [m for m, _ in M]
    mat_index = {m: i for i, m in enumerate(codigos_materias)}

    @lru_cache(maxsize=None)
    def dp(i, cupos):
        if i == r:
            return 0, {}

        ej, msj = E[i]
        best_val = float("inf")
        best_asig = None

        opciones = []
        for l in range(len(msj) + 1):
            for subset in itertools.combinations(msj, l):
                opciones.append(subset)

        for subset in opciones:
            cupos_list = list(cupos)
            valido = True
            for (m, _) in subset:
                idx = mat_index[m]
                if cupos_list[idx] <= 0:
                    valido = False
                    break
                cupos_list[idx] -= 1
            if not valido:
                continue

            asignadas = [m for (m, _) in subset]
            fj = insatisfaccion_general(M, [E[i]], {ej: asignadas})
            val_rest, asig_rest = dp(i + 1, tuple(cupos_list))
            total_val = fj + val_rest

            if total_val < best_val:
                best_val = total_val
                best_asig = {ej: asignadas, **asig_rest}

        return best_val, best_asig

    costo, A = dp(0, cupos_iniciales)
    return A, costo / r
