import { Test, TestingModule } from '@nestjs/testing';
import { IdimWebserviceController } from './idim-webservice.controller';
import { IdimWebserviceService } from './idim-webservice.service';

describe('IdimWebserviceController', () => {
  let controller: IdimWebserviceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IdimWebserviceController],
      providers: [IdimWebserviceService],
    }).compile();

    controller = module.get<IdimWebserviceController>(IdimWebserviceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
