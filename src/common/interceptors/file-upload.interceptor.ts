import { extname } from 'path';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { UseInterceptors } from '@nestjs/common';

// Función para generar nombres únicos de archivos
const generateUniqueFileName = (file: Express.Multer.File) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileExtName = extname(file.originalname);
    const baseName = file.originalname.split('.')[0];
    return `${baseName}-${uniqueSuffix}${fileExtName}`;
};

// Filtro para aceptar solo archivos Excel
const excelFileFilter = (req: any, file: Express.Multer.File, callback: Function) => {
    const allowedExtensions = /\.(xlsx|xls)$/;
    if (!allowedExtensions.test(file.originalname)) {
        return callback(new Error('Only Excel files are allowed!'), false);
    }
    callback(null, true);
};

// Configuración del interceptor
export const ExcelFileInterceptor = () =>
    UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, callback) => {
                    callback(null, generateUniqueFileName(file));
                }
            }),
            fileFilter: excelFileFilter
        })
    );