import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { IdimWebserviceModule } from './modules/idim-webservice/idim-webservice.module';
import 'dotenv/config';

@Module({
    imports: [ConfigModule.forRoot(), IdimWebserviceModule],
})
export class AppModule {}
