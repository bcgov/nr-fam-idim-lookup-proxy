import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('getHello', () => {
    it('should return "Hello <name> :), from Backend!"', () => {
      let greeting_name = "Ian"
      expect(appController.getHello(greeting_name)).toBe(`Hello ${greeting_name} :), from Backend!`);

      greeting_name = ""
      expect(appController.getHello(greeting_name)).toBe(`Hello :), from Backend!`);

    });
  });
});
