import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import 'dotenv/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IdimWebserviceModule } from './modules/idim-webservice/idim-webservice.module';

@Module({
    imports: [ConfigModule.forRoot(), IdimWebserviceModule],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
