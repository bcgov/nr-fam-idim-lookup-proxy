import { Module } from '@nestjs/common';
import { IdimWebserviceService } from './idim-webservice.service';
import { IdimWebserviceController } from './idim-webservice.controller';

@Module({
    controllers: [IdimWebserviceController],
    providers: [IdimWebserviceService],
})
export class IdimWebserviceModule {}
