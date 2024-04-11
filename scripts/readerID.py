import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io
import re
import json
import sys
from datetime import datetime


# You need to set the path to the tesseract executable if it's not already in the PATH
# pytesseract.pytesseract.tesseract_cmd = r'<path_to_your_tesseract_executable>'

# Function to extract text from the first page of the PDF

def extract_text_from_pdf(pdf_path):
    # Open the PDF file
    pdf_document = fitz.open(pdf_path)

    # Initialize a text variable to store extracted text
    extracted_text = ''

    # Iterate over each page in the PDF
    for page_number in range(len(pdf_document)):
        # Get the page
        page = pdf_document[page_number]

        # Get the image list of the page
        image_list = page.get_images(full=True)

        # Iterate over each image in the list
        for image_index, img in enumerate(image_list, start=1):
            # Access the image
            xref = img[0]
            base_image = pdf_document.extract_image(xref)
            image_bytes = base_image["image"]

            # Get the image from bytes and convert it for OCR
            image = Image.open(io.BytesIO(image_bytes))
            text = pytesseract.image_to_string(image, lang='spa')

            # Append the extracted text to the full text
            extracted_text += text

    # Close the PDF document
    pdf_document.close()

    # Return the extracted text
    return extracted_text


def formated_information(text):
    name_pattern = r"\n([A-Z]+)<([A-Z]+)<<([A-Z]+)<([A-Z]+)<<"
    matches = re.search(name_pattern, text)
    if matches:
        surname1, surname2, name1, name2 = matches.groups()
        full_name = f"{name1} {name2} {surname1} {surname2}".replace('<', ' ').strip()
    else:
        full_name = None
        
    id_regex = r"NUIP ([\d\.]+)"
    birth_date_regex = r"Fecha de nacimiento.*\n\n([\d\w\s]+)"
    blood_type_regex = r"([\w\+\-]+)\n>"

    id_match = re.search(id_regex, text)
    birth_date_match = re.search(birth_date_regex, text)
    blood_type_match = re.search(blood_type_regex, text)

    id_number = id_match.group(1).replace('.', '') if id_match else None
    birth_date = None
    months = {
        "ENE": "01", "FEB": "02", "MAR": "03", "ABR": "04", "MAY": "05", "JUN": "06",
        "JUL": "07", "AGO": "08", "SEP": "09", "OCT": "10", "NOV": "11", "DIC": "12"
    }
    if birth_date_match:
        day, month_abbr, year, _ = birth_date_match.group(1).split()
        month = months.get(month_abbr.upper(), "00")
        birth_date = f"{day}/{month}/{year}"
    blood_type = blood_type_match.group(1).strip() if blood_type_match else None

    person_info = {
        "nombre": full_name,
        "documento": id_number,
        "nacimiento": birth_date,
        "rh": blood_type
    }
    json_info = json.dumps(person_info, ensure_ascii=False)
    print(json_info)

# Replace 'your_pdf_file.pdf' with your actual PDF file path
pdf_path = sys.argv[1]
extracted_text = extract_text_from_pdf(pdf_path)
user_information = formated_information(extracted_text)

