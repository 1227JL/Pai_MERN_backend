import fs from 'fs';
import PDFParser from 'pdf2json';

function extraerTablaDesdePDF(archivoPDF) {
    const pdfParser = new PDFParser();

    pdfParser.loadPDF(archivoPDF);

    pdfParser.on('pdfParser_dataError', errData => console.error(errData.parserError));
    pdfParser.on('pdfParser_dataReady', pdfData => {
        let contenidoTabla = '';

        // Acceder a los datos del PDF una vez que estén listos
        console.log(pdfData.Texts);
    });
}

// Ruta del archivo PDF que deseas leer
const archivoPDF = 'test/Diseno_curricular.pdf';

// Extraer la tabla desde el PDF y guardarla en un archivo de texto
extraerTablaDesdePDF(archivoPDF);
