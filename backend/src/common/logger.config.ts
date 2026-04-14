import {WinstonModule, utilities} from 'nest-winston';
import * as winston from 'winston';
import {LoggerService} from "@nestjs/common";

const globalLoggerFormat: winston.Logform.Format = winston.format.timestamp({format: "YYYY-MM-DD hh:mm:ss.SSS"});

const localLoggerFormat: winston.Logform.Format = winston.format.combine(
  winston.format.colorize(),
  winston.format.align(),
  utilities.format.nestLike('Backend', {prettyPrint: true})
);

// Log level from environment variable, defaults to 'info' for production readiness.
const getLogLevel = (): string => {
  const level = process.env.LOG_LEVEL || 'info';
  const validLevels = ['error', 'warn', 'info', 'http', 'debug', 'verbose', 'silly'];
  return validLevels.includes(level) ? level : 'info';
};

export const customLogger: LoggerService = WinstonModule.createLogger({
  transports: [
    new winston.transports.Console({
      level: getLogLevel(),
      format: winston.format.combine(
        globalLoggerFormat,
        localLoggerFormat
      ),
    }),
  ],
  exitOnError: false,
});
