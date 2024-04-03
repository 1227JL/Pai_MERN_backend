import sys  # Importamos el módulo sys para acceder a los argumentos de la línea de comandos
import fitz  # PyMuPDF
import json
import re  # Importamos la biblioteca de expresiones regulares

import unicodedata

def normalize_text(text):
    # Normalizar el texto para la comparación, eliminando tildes y caracteres especiales
    return unicodedata.normalize('NFD', text).encode('ascii', 'ignore').decode('utf-8')

def extract_until_end_phrase(pdf_path, end_phrase):
    doc = fitz.open(pdf_path)
    content = []
    normalized_end_phrase = normalize_text(end_phrase)
    for page in doc:
        text_blocks = page.get_text("blocks")
        for block in text_blocks:
            block_text = normalize_text(block[4])
            content.append(block_text)
            if normalized_end_phrase in block_text:
                break  # Detiene la captura tras encontrar la frase de fin
        else:
            # Esto asegura que si no se encuentra la frase de fin en la página actual, continuamos con la siguiente página
            continue
        # Si encontramos la frase de fin y salimos del bucle interno, rompemos el bucle de la página también
        break
    return "\n".join(content)

def extract_competencias(pdf_path, start_phrase, end_phrase):
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


def extract_information_competencia(content):
    extracted_info = {
        "descripcion_general": "",
        "codigo_norma": "",
        "nombre_competencia": "",
        "duracion_maxima": "",
        "resultados_aprendizaje": []
    }

    descripcion_general_pattern = re.compile(r"CONTENIDOS CURRICULARES DE LA COMPETENCIA(.*?)4\.1", re.DOTALL | re.IGNORECASE)
    codigo_norma_pattern = re.compile(r"(\d{9})")
    nombre_competencia_pattern = re.compile(r"4\.3 NOMBRE DE LA\nCOMPETENCIA\n(.+?)\n", re.DOTALL)
    duracion_maxima_pattern = re.compile(r"(\d+ horas)")
    resultados_aprendizaje_pattern = re.compile(r"\n(\d{2}\s+.+?)(?=\n\d{2}\s+|$)", re.DOTALL)

    descripcion_general_match = descripcion_general_pattern.search(content)
    if descripcion_general_match:
        descripcion_general = descripcion_general_match.group(1).strip()
        if descripcion_general.endswith('.'):
            descripcion_general = descripcion_general[:-1]
        extracted_info["descripcion_general"] = descripcion_general

    codigo_norma_match = codigo_norma_pattern.search(content)
    if codigo_norma_match:
        extracted_info["codigo_norma"] = codigo_norma_match.group(1)

    nombre_competencia_match = nombre_competencia_pattern.search(content)
    if nombre_competencia_match:
        nombre_competencia = nombre_competencia_match.group(1).strip()
        if nombre_competencia.endswith('.'):
            nombre_competencia = nombre_competencia[:-1]
        extracted_info["nombre_competencia"] = nombre_competencia

    duracion_maxima_match = duracion_maxima_pattern.search(content)
    if duracion_maxima_match:
        solo_numeros = ''.join(re.findall(r'\d+', duracion_maxima_match.group(1)))
        extracted_info["duracion_maxima"] = solo_numeros

    resultados_aprendizaje_matches = resultados_aprendizaje_pattern.findall(content)
    for match in resultados_aprendizaje_matches:
        resultado_aprendizaje = match.strip()
        if resultado_aprendizaje.endswith('.'):
            resultado_aprendizaje = resultado_aprendizaje[:-1]
        extracted_info["resultados_aprendizaje"].append(resultado_aprendizaje)

    # Si necesitas eliminar el primer índice y ya lo has hecho, considera el contexto específico de tu aplicación
    # extracted_info["resultados_aprendizaje"] = extracted_info["resultados_aprendizaje"][1:]
    
    # No es necesario ordenar si ya estás satisfecho con el orden en el que vienen los resultados de aprendizaje
    # extracted_info["resultados_aprendizaje"].sort(key=lambda x: int(x.split()[0]))

    return extracted_info
def extract_information_titulada(content):
    extracted_info = {
        "programa": "",  # Para el programa o área de formación
        "titulo": "",  # Para el título o certificado obtenido
        "duracion_etapa_lectiva": 0,  # Para las horas de la etapa lectiva
        "duracion_etapa_productiva": 0  # Para las horas de duración máxima estimada del aprendizaje
    }

    # Ajuste de la expresión regular para capturar de manera más flexible
    programa_pattern = re.compile(r"(.*?)1\. INFORMACION BASICA DEL PROGRAMA DE FORMACION TITULADA", re.DOTALL | re.IGNORECASE)
    titulo_pattern = re.compile(r"1\.7 TITULO O\nCERTIFICADO QUE\nOBTENDRA\n\n(.+?)(?=\n\d+\.)", re.DOTALL | re.IGNORECASE)
    etapa_lectiva_pattern = re.compile(r"(\d+)\s+horas\nEtapa Lectiva:", re.IGNORECASE)
    duracion_maxima_pattern = re.compile(r"1\.5 Duracion\nmaxima estimada\ndel aprendizaje\n\(horas\)\n\n(\d+) horas", re.IGNORECASE)

    programa_match = programa_pattern.search(content)
    if programa_match:
        content_extracted = programa_match.group(1).strip()
        lines = [line.strip() for line in content_extracted.split('\n') if line.strip()]
        if lines:
            last_line = lines[-1]
            # Asegurar que solo se elimine un punto final
            if last_line.endswith('.'):
                last_line = last_line[:-1]
            extracted_info["programa"] = last_line

    titulo_match = titulo_pattern.search(content)
    if titulo_match:
        extracted_info["titulo"] = titulo_match.group(1).strip()

    etapa_lectiva_match = etapa_lectiva_pattern.search(content)
    if etapa_lectiva_match:
        extracted_info["duracion_etapa_lectiva"] = int(etapa_lectiva_match.group(1))

    duracion_maxima_match = duracion_maxima_pattern.search(content)
    if duracion_maxima_match:
        extracted_info["duracion_etapa_productiva"] = int(duracion_maxima_match.group(1))

    return extracted_info

def main():
    pdf_path = sys.argv[1] # Asegúrate de que el script se llama con un argumento de ruta de archivo
    
    end_phrase_section1 = "2.1 PERFIL OCUPACIONAL"
    
    content_until_end_phrase = extract_until_end_phrase(pdf_path, end_phrase_section1)
    
    start_phrase_section2 = "4.	CONTENIDOS CURRICULARES DE LA COMPETENCIA"
    end_phrase_section2 = "4.6 CONOCIMIENTOS"
    
    all_contents = extract_competencias(pdf_path, start_phrase_section2, end_phrase_section2)
    all_extracted_info = []
    titulada_info = extract_information_titulada(content_until_end_phrase)

    for content in all_contents:
        extracted_info = extract_information_competencia(content)
        all_extracted_info.append(extracted_info)
    
        # Convertimos toda la información extraída de las secciones a JSON para visualización
    informacion_total = {
        "titulada_info": titulada_info,
        "competencias": all_extracted_info
    }
    
    # Hacer un print del objeto combinado en formato JSON
    print(json.dumps(informacion_total, indent=4, ensure_ascii=True))
    
if __name__ == "__main__":
    main()
