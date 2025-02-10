import { Controller, Post, UploadedFile, Res, HttpStatus } from '@nestjs/common';
import { ImportsService } from './imports.service';
import { Response, Express } from 'express';
import { ExcelFileInterceptor } from 'src/common/interceptors/file-upload.interceptor';

@Controller('imports')
export class ImportsController {
  constructor(private readonly importsService: ImportsService) { }

  @Post('/excel')
  @ExcelFileInterceptor()
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Res() res: Response) {
    try {
      const result = await this.importsService.importDataFromExcel(file.path);

      if (result.errorBuffer) {
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=errors.xlsx');
        return res.status(400).send(result.errorBuffer);
      }

      return res.status(HttpStatus.OK).json({
        message: 'Data imported successfully',
      });

    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error importing data',
        error: error.message,
      });
    }
  }
}
