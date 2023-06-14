import {NestFactory} from "@nestjs/core";
import {SwaggerModule, DocumentBuilder} from "@nestjs/swagger";
import {AppModule} from "./app.module";
import {customLogger} from "./common/logger.config";
import {NestExpressApplication} from "@nestjs/platform-express";
import helmet from "helmet";
import {VersioningType} from "@nestjs/common";

export async function bootstrap() {
  
	// Nest app created.
  const app: NestExpressApplication = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: customLogger,
  });

	// Config, middlewares and hooks.
  app.use(helmet());
  app.enableCors();
  app.set("trust proxy", 1);
  app.enableShutdownHooks();
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: "api/v",
  });

	// Swagger
  const config = new DocumentBuilder()
    .setTitle("IDIM Lookup Proxy API")
    .setDescription("< TODO > - provide description when proxy implemented.")
    .setVersion("1.0")
    // .addTag("users")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api", app, document);

  return app;
}
