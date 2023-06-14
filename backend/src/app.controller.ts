import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('Hello World')
@Controller('api/idim-proxy')
export class AppController {
  constructor(private readonly appService: AppService) {}
  
  @Get('/hello-world/:yourName')
  getHello(@Param('yourName') name: string) {
    return this.appService.getHello(name);
  }
}
