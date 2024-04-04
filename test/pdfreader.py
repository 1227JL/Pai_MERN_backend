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
                break
        else:
            continue
        break
    return "\n".join(content)

def extract_competencias(pdf_path, start_phrase, end_phrase):
    doc = fitz.open(pdf_path)
    all_contents = []
    content = []
    capture = False
    for page in doc:
        text_blocks = page.get_text("blocks")
        for block in text_blocks:
            block_text = block[4]
            if start_phrase in block_text:
                capture = True
                content = []
            if capture:
                content.append(block_text)
            if end_phrase in block_text and capture:
                all_contents.append("\n".join(content))
                capture = False
    return all_contents

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
    # Ajustamos el patrón para capturar resultados que empiezan con '0'
    resultados_aprendizaje_pattern = re.compile(r"\n(\d{2}\s+.+?)(?=\n\d{2}\s+|$)", re.DOTALL)

    descripcion_general_match = descripcion_general_pattern.search(content)
    if descripcion_general_match:
        extracted_info["descripcion_general"] = descripcion_general_match.group(1).strip().rstrip('.')

    codigo_norma_match = codigo_norma_pattern.search(content)
    if codigo_norma_match:
        extracted_info["codigo_norma"] = codigo_norma_match.group(1)

    nombre_competencia_match = nombre_competencia_pattern.search(content)
    if nombre_competencia_match:
        nombre_competencia = nombre_competencia_match.group(1).strip().rstrip('.')
        # Comprobamos si el nombre de la competencia extraído es efectivamente un título de sección
        if nombre_competencia == "4.5 RESULTADOS DE APRENDIZAJE":
            extracted_info["nombre_competencia"] = "La competencia no cuenta con un nombre"  # Reemplazamos con un espacio en blanco
        else:
            extracted_info["nombre_competencia"] = nombre_competencia

    duracion_maxima_match = duracion_maxima_pattern.search(content)
    if duracion_maxima_match:
        extracted_info["duracion_maxima"] = ''.join(re.findall(r'\d+', duracion_maxima_match.group(1)))

    resultados_aprendizaje_pattern = re.compile(r"\n(\d{2}\s+.+?)(?=\n\d{2}\s+|$)", re.DOTALL)

    resultados_aprendizaje_matches = resultados_aprendizaje_pattern.findall(content)
    incremento = 1  # Inicializamos el contador para generar números incrementales
    resultados_procesados = []

    for match in resultados_aprendizaje_matches:
        resultado_aprendizaje = match.strip().split("\n")[0]

        # Filtramos resultados que no son válidos como '001 horas'
        if not resultado_aprendizaje.lower().endswith("horas"):
            if not resultado_aprendizaje.startswith("0"):
                resultado_aprendizaje = "0{} {}".format(str(incremento).zfill(2), resultado_aprendizaje[3:])
                incremento += 1
            resultados_procesados.append(resultado_aprendizaje)

    # Ordenamos los resultados procesados
    resultados_procesados.sort(key=lambda x: int(x.split()[0]))
    extracted_info["resultados_aprendizaje"] = resultados_procesados

    return extracted_info

# Las funciones extract_until_end_phrase, extract_competencias, extract_information_titulada, y main permanecen sin cambios.

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
    pdf_path = 'test/Diseno_curricular.pdf' # Asegúrate de que el script se llama con un argumento de ruta de archivo
    
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
