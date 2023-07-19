import { Test, TestingModule } from '@nestjs/testing';
import 'dotenv/config';
import { IdimWebserviceController } from './idim-webservice.controller';
import { IdimWebserviceService } from './idim-webservice.service';
import { IDIRUserResponse } from './idim-webservice.dto';

describe('IdimWebserviceController', () => {
    let controller: IdimWebserviceController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [IdimWebserviceController],
            providers: [IdimWebserviceService],
        }).compile();

        controller = module.get<IdimWebserviceController>(
            IdimWebserviceController
        );
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('verifyIdirUser', () => {
        const TEST_IDIR_USERID = 'CMENG';
        const TEST_IDIR_USERID_NON_EXIST = 'test';
        const TEST_REQUESTER_TYPE_CODE = 'Internal';
        const TEST_REQUESTER_TYPE_CODE_NOT_SUPPORT = '';

        it('find non existing idir user', async () => {
            const result = await controller.verifyIdirUser(
                TEST_IDIR_USERID_NON_EXIST,
                TEST_IDIR_USERID,
                TEST_REQUESTER_TYPE_CODE
            );
            expect((result as IDIRUserResponse).found).toBe(false);
            expect((result as IDIRUserResponse).userId).toBe(null);
            expect((result as IDIRUserResponse).displayName).toBe(null);
        });

        it('find existing idir user', async () => {
            const result = await controller.verifyIdirUser(
                TEST_IDIR_USERID,
                TEST_IDIR_USERID,
                TEST_REQUESTER_TYPE_CODE
            );
            expect((result as IDIRUserResponse).found).toBe(true);
            expect((result as IDIRUserResponse).userId).toBe(TEST_IDIR_USERID);
        });

        it('find using non existing requester id', async () => {
            await expect(
                controller.verifyIdirUser(
                    TEST_IDIR_USERID,
                    TEST_IDIR_USERID_NON_EXIST,
                    TEST_REQUESTER_TYPE_CODE
                )
            ).rejects.toThrowError('Requester account cannot be found.');
        });

        it('find without requester type code', async () => {
            await expect(
                controller.verifyIdirUser(
                    TEST_IDIR_USERID,
                    TEST_IDIR_USERID_NON_EXIST,
                    TEST_REQUESTER_TYPE_CODE_NOT_SUPPORT
                )
            ).rejects.toThrowError('Http Exception');
        });
    });
});
