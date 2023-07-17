import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { customLogger } from './common/logger.config';

async function bootstrap() {
    const API_PREFIX = 'api';

    // Nest app created.
    const app: NestExpressApplication =
        await NestFactory.create<NestExpressApplication>(AppModule, {
            logger: customLogger,
        });

    // Config, middlewares and hooks.
    app.setGlobalPrefix(API_PREFIX);
    app.use(helmet());
    app.enableCors();
    app.set('trust proxy', 1);
    app.enableShutdownHooks();

    // Swagger
    const config = new DocumentBuilder()
        .setTitle('IDIM Lookup Proxy API')
        .setDescription('IDIM Web Service Proxy API')
        .setVersion('1.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(API_PREFIX, app, document);

    return app;
}

const logger = new Logger('NestApplication');

bootstrap()
    .then(async (app: NestExpressApplication) => {
        await app.listen(3000, '0.0.0.0');
        logger.log(`Listening on ${await app.getUrl()}`);
    })
    .catch((err) => {
        logger.error(err);
    });
