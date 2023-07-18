import { Test, TestingModule } from '@nestjs/testing';
import { IdimWebserviceService } from './idim-webservice.service';

describe('IdimWebserviceService', () => {
    let service: IdimWebserviceService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [IdimWebserviceService],
        }).compile();

        service = module.get<IdimWebserviceService>(IdimWebserviceService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
