import * as fs from 'fs';
import * as path from 'path';
import * as PdfPrinter from 'pdfmake';

/**
 * Genera un documento PDF con un diseño mejorado.
 * @param animalsByZone Cantidad de animales por zona.
 * @param animalsBySpecies Cantidad de animales por especie.
 * @param commentReplyPercentage Porcentaje de comentarios con respuestas.
 * @returns Buffer con el PDF generado.
 */
export async function generatePdfReport(
    animalsByZone: any[],
    animalsBySpecies: any[],
    commentReplyPercentage: any
): Promise<Buffer> {
    // 📌 Cargar fuentes
    const fonts = {
        Roboto: {
            normal: fs.readFileSync(path.join(__dirname, '..', '..', '..', 'src', 'assets', 'fonts', 'Roboto-Regular.ttf')),
            bold: fs.readFileSync(path.join(__dirname, '..', '..', '..', 'src', 'assets', 'fonts', 'Roboto-Bold.ttf')),
        },
    };

    const printer = new PdfPrinter(fonts);

    // 🎨 Definir colores
    const colors = {
        header: '#1E3A8A',  // Azul oscuro
        section: '#2563EB', // Azul más claro
        tableHeader: '#93C5FD', // Azul cielo
        tableRowEven: '#E0F2FE', // Celeste claro
    };

    // 📌 Definir la estructura del PDF
    const documentDefinition = {
        content: [
            { text: 'Reporte de Indicadores', style: 'header' },
            { text: 'Fecha: ' + new Date().toLocaleString(), style: 'subheader' },
            { text: '\n\n' },

            { text: 'Cantidad de Animales por Zona', style: 'section' },
            {
                table: {
                    headerRows: 1,
                    widths: ['*', '*'],
                    body: [
                        [
                            { text: 'Zona', style: 'tableHeader' },
                            { text: 'Cantidad de Animales', style: 'tableHeader' },
                        ],
                        ...animalsByZone.map((zone, index) => [
                            { text: zone.zoneName, fillColor: index % 2 === 0 ? colors.tableRowEven : 'white' },
                            { text: zone.animalCount.toString(), fillColor: index % 2 === 0 ? colors.tableRowEven : 'white' },
                        ]),
                    ],
                },
            },

            { text: '\n' },
            { text: 'Cantidad de Animales por Especie', style: 'section' },
            {
                table: {
                    headerRows: 1,
                    widths: ['*', '*'],
                    body: [
                        [
                            { text: 'Especie', style: 'tableHeader' },
                            { text: 'Cantidad de Animales', style: 'tableHeader' },
                        ],
                        ...animalsBySpecies.map((species, index) => [
                            { text: species.speciesName, fillColor: index % 2 === 0 ? colors.tableRowEven : 'white' },
                            { text: species.animalCount.toString(), fillColor: index % 2 === 0 ? colors.tableRowEven : 'white' },
                        ]),
                    ],
                },
            },

            { text: '\n' },
            { text: 'Porcentaje de Comentarios con Respuestas', style: 'section' },
            {
                table: {
                    widths: ['*', '*', '*'],
                    body: [
                        [
                            { text: 'Total de Comentarios', style: 'tableHeader' },
                            { text: 'Comentarios con Respuestas', style: 'tableHeader' },
                            { text: 'Porcentaje', style: 'tableHeader' },
                        ],
                        [
                            { text: commentReplyPercentage.totalComments.toString(), fillColor: colors.tableRowEven },
                            { text: commentReplyPercentage.commentsWithReplies.toString(), fillColor: colors.tableRowEven },
                            { text: `${commentReplyPercentage.percentage.toFixed(2)}%`, fillColor: colors.tableRowEven },
                        ],
                    ],
                },
            },
        ],
        styles: {
            header: { fontSize: 22, bold: true, color: colors.header, alignment: 'center', margin: [0, 10, 0, 20] },
            subheader: { fontSize: 14, bold: true, alignment: 'right', margin: [0, 5, 0, 10] },
            section: { fontSize: 16, bold: true, color: colors.section, margin: [0, 10, 0, 5] },
            tableHeader: { fontSize: 12, bold: true, color: 'black', fillColor: colors.tableHeader, margin: [5, 5, 5, 5] },
            text: { fontSize: 12, margin: [0, 2, 0, 2] },
        },
    };

    // 📝 Generar PDF en memoria
    const pdfDoc = printer.createPdfKitDocument(documentDefinition);

    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        pdfDoc.on('data', (chunk) => chunks.push(chunk));
        pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
        pdfDoc.on('error', (err) => reject(new Error(err)));
        pdfDoc.end();
    });
}