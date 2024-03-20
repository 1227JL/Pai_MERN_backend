
import re

# Texto de ejemplo que contiene la información de las competencias
texto_competencias = """
APLICACIÓN DE CONOCIMIENTOS DE LAS CIENCIAS NATURALES DE ACUERDO CON
SITUACIONES DEL CONTEXTO PRODUCTIVO Y SOCIAL41 NORMA / UNIDAD DE
COMPETENCIA
22020150142 CÓDIGO NORMA DE
COMPETENCIA LABORAL
43 NOMBRE DE LA
COMPETENCIAFISICAAPLICAR PRÁCTICAS  DE PROTECCIÓN AMBIENTAL, SEGURIDAD Y SALUD EN EL TRABAJO
DE ACUERDO CON LAS POLÍTICAS ORGANIZACIONALES  Y LA NORMATIVIDAD VIGENTE41 NORMA / UNIDAD DE
COMPETENCIA
22060150142 CÓDIGO NORMA DE
COMPETENCIA LABORAL
43 NOMBRE DE LA
COMPETENCIAPROTECCIÓN PARA LA SALUD Y EL MEDIO AMBIENTE
45 RESULTADOS DE APRENDIZAJE44 DURACIÓN MÁXIMA ESTIMADA PARA EL LOGRO DEL
APRENDIZAJE (Horas)48 horas
"""

# Dividir el texto en bloques de competencia
bloques_competencias = re.split(r'\d+\s+CÓDIGO NORMA DE COMPETENCIA LABORAL', texto_competencias)

# Eliminar elementos vacíos en la lista de bloques
bloques_competencias = [bloque.strip() for bloque in bloques_competencias if bloque.strip()]

# Crear una lista de tuplas (codigo_norma, bloque_competencia)
lista_competencias = []
for bloque in bloques_competencias:
    codigo_norma = re.search(r'\d+\s+', bloque).group().strip()
    lista_competencias.append((codigo_norma, bloque))

# Ordenar la lista de competencias por el código de norma
lista_competencias.sort()

# Imprimir los bloques de competencia ordenados de izquierda a derecha
for codigo_norma, bloque_competencia in lista_competencias:
    print(codigo_norma + bloque_competencia)
