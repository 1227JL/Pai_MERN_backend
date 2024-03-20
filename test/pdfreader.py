import fitz  # PyMuPDF
import json
import re  # Importamos la biblioteca de expresiones regulares

def extract_section_content(pdf_path, start_phrase, end_phrase):
    doc = fitz.open(pdf_path)
    content = []
    capture = False
    for page in doc:
        text_blocks = page.get_text("blocks")
        for block in text_blocks:
            block_text = block[4]
            if start_phrase in block_text:
                capture = True
            if capture:
                content.append(block_text)
            if end_phrase in block_text and capture:
                combined_content = "\n".join(content)
                return combined_content
    combined_content = "\n".join(content)
    return combined_content

def extract_information(content):
    extracted_info = {
        "descripcion_general": "",
        "codigo_norma": "",
        "nombre_competencia": "",
        "duracion_maxima": "",
        "resultados_aprendizaje": []
    }

    descripcion_general_pattern = re.compile(r"CONTENIDOS CURRICULARES DE LA COMPETENCIA.*?(\bAPLICACIÓN DE CONOCIMIENTOS DE LAS CIENCIAS NATURALES DE ACUERDO CON\sSITUACIONES DEL CONTEXTO PRODUCTIVO Y SOCIAL\b)", re.DOTALL | re.IGNORECASE)
    codigo_norma_pattern = re.compile(r"(\d{9})")
    
    # Ajustamos la expresión regular para el nombre de la competencia para capturar el texto después de "4.3 NOMBRE DE LA\nCOMPETENCIA\n"
    nombre_competencia_pattern = re.compile(r"4\.3 NOMBRE DE LA\nCOMPETENCIA\n(.+?)\n", re.DOTALL)
    
    duracion_maxima_pattern = re.compile(r"(\d+ horas)")
    resultados_aprendizaje_pattern = re.compile(r"\n(\d{2}\s+.+?)(?=\n\d{2}\s+|$)", re.DOTALL)

    descripcion_general_match = descripcion_general_pattern.search(content)
    if descripcion_general_match:
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
        extracted_info["duracion_maxima"] = duracion_maxima_match.group(1)

    resultados_aprendizaje_matches = resultados_aprendizaje_pattern.findall(content)
    for match in resultados_aprendizaje_matches:
        extracted_info["resultados_aprendizaje"].append(match.strip())

    # Eliminar el primer índice del array de resultados de aprendizaje
    extracted_info["resultados_aprendizaje"] = extracted_info["resultados_aprendizaje"][1:]

    # Ordenar los resultados de aprendizaje
    extracted_info["resultados_aprendizaje"].sort(key=lambda x: int(x.split()[0]))

    return extracted_info
def main():
    pdf_path = "test/Diseno_curricular.pdf"  # Actualiza esto a la ruta correcta
    start_phrase = "4.	CONTENIDOS CURRICULARES DE LA COMPETENCIA"
    end_phrase = "4.6 CONOCIMIENTOS"
    
    content = extract_section_content(pdf_path, start_phrase, end_phrase)
    extracted_info = extract_information(content)
    
    # Convertir la información extraída a JSON para visualización
    json_object = json.dumps(extracted_info, indent=4)
    print(json_object)

if __name__ == "__main__":
    main()
