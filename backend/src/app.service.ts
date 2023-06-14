import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHello(name: string): string {
    return `${name?.trim().length > 0? "Hello "+name: "Hello"} :), from Backend!`;
  }
}
