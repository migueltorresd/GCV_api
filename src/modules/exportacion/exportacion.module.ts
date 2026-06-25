import { Module } from '@nestjs/common';
import { NovedadesModule } from '../novedades/novedades.module';
import { AuditoriaModule } from '../auditoria/auditoria.module';
import { ExportarCsvUseCase } from './application/exportar-csv.use-case';
import { CsvBuilderService } from './infrastructure/csv-builder.service';
import { ExportacionController } from './presentation/exportacion.controller';

@Module({
  imports: [NovedadesModule, AuditoriaModule],
  controllers: [ExportacionController],
  providers: [ExportarCsvUseCase, CsvBuilderService],
})
export class ExportacionModule {}
