import sys  # Importamos el módulo sys para acceder a los argumentos de la línea de comandos
import fitz  # PyMuPDF
import json
import re  # Importamos la biblioteca de expresiones regulares

def extract_section_content(pdf_path, start_phrase, end_phrase):
    doc = fitz.open(pdf_path)
    all_contents = []  # Lista para almacenar todas las secciones extraídas
    content = []  # Inicializamos el contenido para la captura de texto
    capture = False
    for page in doc:
        text_blocks = page.get_text("blocks")
        for block in text_blocks:
            block_text = block[4]
            if start_phrase in block_text:
                capture = True  # Iniciamos la captura de texto
                content = []  # Reiniciamos el contenido para capturar una nueva sección
            if capture:
                content.append(block_text)
            if end_phrase in block_text and capture:
                content.append(block_text)  # Aseguramos incluir el bloque con la frase final
                all_contents.append("\n".join(content))  # Agregamos la sección capturada
                capture = False  # Finalizamos la captura de esta sección
    return all_contents  # Retornamos todas las secciones extraídas


def extract_information(content):
    extracted_info = {
        "descripcion_general": "",
        "codigo_norma": "",
        "nombre_competencia": "",
        "duracion_maxima": "",
        "resultados_aprendizaje": []
    }

    # Ajuste de la expresión regular para capturar de manera más flexible
    descripcion_general_pattern = re.compile(r"CONTENIDOS CURRICULARES DE LA COMPETENCIA(.*?)4\.1", re.DOTALL | re.IGNORECASE)
    
    codigo_norma_pattern = re.compile(r"(\d{9})")
    
    # Ajustamos la expresión regular para el nombre de la competencia para capturar el texto después de "4.3 NOMBRE DE LA\nCOMPETENCIA\n"
    nombre_competencia_pattern = re.compile(r"4\.3 NOMBRE DE LA\nCOMPETENCIA\n(.+?)\n", re.DOTALL)
    
    duracion_maxima_pattern = re.compile(r"(\d+ horas)")
    resultados_aprendizaje_pattern = re.compile(r"\n(\d{2}\s+.+?)(?=\n\d{2}\s+|$)", re.DOTALL)

    descripcion_general_match = descripcion_general_pattern.search(content)
    if descripcion_general_match:
        # Usamos .strip() para limpiar espacios al inicio y final del texto capturado
        extracted_info["descripcion_general"] = descripcion_general_match.group(1).strip()

    codigo_norma_match = codigo_norma_pattern.search(content)
    if codigo_norma_match:
        extracted_info["codigo_norma"] = codigo_norma_match.group(1)

    nombre_competencia_match = nombre_competencia_pattern.search(content)
    if nombre_competencia_match:
        # Usamos .strip() para eliminar espacios adicionales o saltos de línea al inicio y al final del texto capturado
        extracted_info["nombre_competencia"] = nombre_competencia_match.group(1).strip()

    duracion_maxima_match = duracion_maxima_pattern.search(content)
    if duracion_maxima_match:
        # Extraer solo los dígitos del string obtenido
        solo_numeros = ''.join(re.findall(r'\d+', duracion_maxima_match.group(1)))
        extracted_info["duracion_maxima"] = solo_numeros

    resultados_aprendizaje_matches = resultados_aprendizaje_pattern.findall(content)
    for match in resultados_aprendizaje_matches:
        extracted_info["resultados_aprendizaje"].append(match.strip())

    # Eliminar el primer índice del array de resultados de aprendizaje
    extracted_info["resultados_aprendizaje"] = extracted_info["resultados_aprendizaje"][1:]

    # Ordenar los resultados de aprendizaje
    extracted_info["resultados_aprendizaje"].sort(key=lambda x: int(x.split()[0]))

    return extracted_info

def main():
    pdf_path = sys.argv[1]  # Asegúrate de que el script se llama con un argumento de ruta de archivo
    start_phrase = "4.	CONTENIDOS CURRICULARES DE LA COMPETENCIA"
    end_phrase = "4.6 CONOCIMIENTOS"
    
    all_contents = extract_section_content(pdf_path, start_phrase, end_phrase)
    all_extracted_info = []

    for content in all_contents:
        extracted_info = extract_information(content)
        all_extracted_info.append(extracted_info)
    
    # Convertimos toda la información extraída de las secciones a JSON para visualización
    competencias_json = json.dumps(all_extracted_info, indent=4)
    print(competencias_json)
    
if __name__ == "__main__":
    main()
