import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { customLogger } from "./common/logger.config";

export async function bootstrap() {
  const API_PREFIX = "api";

	// Nest app created.
  const app: NestExpressApplication = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: customLogger,
  });

	// Config, middlewares and hooks.
  app.setGlobalPrefix(API_PREFIX)
  app.use(helmet());
  app.enableCors();
  app.set("trust proxy", 1);
  app.enableShutdownHooks();

	// Swagger
  const config = new DocumentBuilder()
    .setTitle("IDIM Lookup Proxy API")
    .setDescription("< TODO > - provide description when proxy implemented.")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(API_PREFIX, app, document);

  return app;
}
