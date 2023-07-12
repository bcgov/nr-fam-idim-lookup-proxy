import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import 'dotenv/config';
import { IdimWebserviceModule } from './modules/idim-webservice/idim-webservice.module';

@Module({
    imports: [ConfigModule.forRoot(), IdimWebserviceModule],
})
export class AppModule {}
