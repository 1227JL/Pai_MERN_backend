import sys
import re
import PyPDF2
import json

def extraer_tabla_desde_pdf(archivo_pdf):
    # Abrir el archivo PDF
    with open(archivo_pdf, 'rb') as archivo:
        lector_pdf = PyPDF2.PdfReader(archivo)
        
        # Texto extraído de la tabla
        contenido_tabla = ""

        # Iterar sobre cada página del PDF
        for num_pagina in range(len(lector_pdf.pages)):
            pagina = lector_pdf.pages[num_pagina]
            texto_pagina = pagina.extract_text()

            # Dividir el texto de la página en líneas
            lineas_pagina = texto_pagina.split('\n')

            # Encontrar el índice de la primera línea que contiene 'COMPETENCIAS QUE DESARROLLARÁ'
            for i, linea in enumerate(lineas_pagina):
                if 'COMPETENCIAS QUE DESARROLLARÁ' in linea:
                    inicio_tabla_index = i + 2
                    break
            else:
                if 'COMPETENCIAS QUE DESARROLLARÁ' not in contenido_tabla:
                    continue  # Si no se encontró la línea, continuar con la siguiente página

            # Agregar las líneas relevantes al contenido de la tabla
            contenido_tabla += '\n'.join(lineas_pagina[inicio_tabla_index:]) + '\n'
            
            # Eliminar la última línea que indica la página del PDF
            contenido_tabla = contenido_tabla.rsplit('\n', 2)[0]

        # Eliminar los puntos del texto extraído
        contenido_tabla = contenido_tabla.replace('.', '')

        # Dividir las líneas en entradas de la tabla
        lineas_divididas = contenido_tabla.split('\n')

        # Generar un salto de línea antes y después del número de serie
        contenido_formateado = []
        i = 0
        while i < len(lineas_divididas):
            linea = lineas_divididas[i]
            # Buscar un patrón numérico al final de la línea
            match = re.search(r'(\d+)$', linea)
            if match:
                # Dividir la línea en el número serial
                partes = re.split(r'(\d+)$', linea)
                # Agregar un salto de línea antes del número serial
                contenido_formateado.append({'nombre': partes[0].strip(), 'serial': match.group(), 'estado': 'Pendiente'})
                i += 1
            else:
                # Si no hay un número serial, combinar esta línea con la siguiente
                if i < len(lineas_divididas) - 1:
                    lineas_divididas[i+1] = linea + ' ' + lineas_divididas[i+1]
                i += 1

        # Juntar las líneas formateadas en un solo texto
    contenido_final = json.dumps(contenido_formateado, ensure_ascii=True)

        
    print(contenido_final, file=sys.stdout)

if __name__ == "__main__":
    # Ruta del archivo PDF que deseas leer
    archivo_pdf = 'test\Diseno_curricular.pdf'

    # Extraer la tabla desde el PDF y guardarla en un archivo de texto
    extraer_tabla_desde_pdf(archivo_pdf)
