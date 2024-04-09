import fitz  # PyMuPDF
import pytesseract
from PIL import Image
import io

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

# Replace 'your_pdf_file.pdf' with your actual PDF file path
pdf_path = 'test/Cedula_de_ciudadanía.pdf'
extracted_text = extract_text_from_pdf(pdf_path)

print(extracted_text)
