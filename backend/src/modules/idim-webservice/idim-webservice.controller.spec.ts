import { Test, TestingModule } from '@nestjs/testing';
import 'dotenv/config';
import { IdimWebserviceController } from './idim-webservice.controller';
import { BCEIDUserResponse, IDIRUserResponse, RequesterAccountTypeCode } from './idim-webservice.dto';
import { IdimWebserviceService } from './idim-webservice.service';

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
        const TEST_REQUESTER_TYPE_CODE_NOT_SUPPORT = '';

        it('find non existing idir user', async () => {
            const result = await controller.verifyIdirUser(
                TEST_IDIR_USERID_NON_EXIST,
                TEST_IDIR_USERID,
                RequesterAccountTypeCode.Internal
            );
            expect((result as IDIRUserResponse).found).toBe(false);
            expect((result as IDIRUserResponse).userId).toBe(TEST_IDIR_USERID_NON_EXIST);
            expect((result as IDIRUserResponse).firstName).toBe(undefined);
        });

        it('IDIR find existing IDIR user', async () => {
            const result = await controller.verifyIdirUser(
                TEST_IDIR_USERID,
                TEST_IDIR_USERID,
                RequesterAccountTypeCode.Internal
            );
            expect((result as IDIRUserResponse).found).toBe(true);
            expect((result as IDIRUserResponse).userId).toBe(TEST_IDIR_USERID);
            expect((result as IDIRUserResponse).firstName).not.toBe(null);
        });

        it('find using non existing requester id', async () => {
            await expect(
                controller.verifyIdirUser(
                    TEST_IDIR_USERID,
                    TEST_IDIR_USERID_NON_EXIST,
                    RequesterAccountTypeCode.Internal
                )
            ).rejects.toThrowError('Requester account cannot be found.');
        });

        // it.skip('find without requester type code', async () => {
        //     await expect(
        //         controller.verifyIdirUser(
        //             TEST_IDIR_USERID,
        //             TEST_IDIR_USERID_NON_EXIST,
        //             TEST_REQUESTER_TYPE_CODE_NOT_SUPPORT
        //         )
        //     ).rejects.toThrowError('Http Exception');
        // });
    });

    describe.skip('verifyBceidUser', () => {
        const TEST_REQUESTER_IDIR_GUID = process.env.TEST_REQUESTER_IDIR_GUID;
        const TEST_REQUESTER_IDIR_GUIDD_NON_EXIST = 'test-non-exists-guid';
        const TEST_REQUESTER_TYPE_CODE_NOT_SUPPORT = '';
        const TEST_BUSINESS_BCEID_USERID = 'LOAD-2-TEST'
        const TEST_BUSINESS_BCEID_USERID_NON_EXIST = 'test-non-exists-userid'

        it('find non existing business BCEID user', async () => {
            const result = await controller.verifyBceidUser(
                TEST_BUSINESS_BCEID_USERID_NON_EXIST,
                TEST_REQUESTER_IDIR_GUID,
                RequesterAccountTypeCode.Internal
            );
            expect((result as BCEIDUserResponse).found).toBe(false);
            expect((result as BCEIDUserResponse).userId).toBe(TEST_BUSINESS_BCEID_USERID_NON_EXIST);
            expect((result as BCEIDUserResponse).firstName).toBe(undefined);
        });

        it('find using non existing requester guid', async () => {
            await expect(
                controller.verifyBceidUser(
                    TEST_BUSINESS_BCEID_USERID,
                    TEST_REQUESTER_IDIR_GUIDD_NON_EXIST,
                    RequesterAccountTypeCode.Internal
                )
            ).rejects.toThrowError('Requester account cannot be found.');
        });

        // it.skip('find without requester type code', async () => {
        //     await expect(
        //         controller.verifyBceidUser(
        //             TEST_BUSINESS_BCEID_USERID,
        //             TEST_REQUESTER_IDIR_GUID,
        //             TEST_REQUESTER_TYPE_CODE_NOT_SUPPORT
        //         )
        //     ).rejects.toThrowError('Http Exception');
        // });

        it('IDIR find existing business BCEID user', async () => {
            const result = await controller.verifyBceidUser(
                TEST_BUSINESS_BCEID_USERID,
                TEST_REQUESTER_IDIR_GUID,
                RequesterAccountTypeCode.Internal
            );
            expect((result as BCEIDUserResponse).found).toBe(true);
            expect((result as BCEIDUserResponse).userId).toBe(TEST_BUSINESS_BCEID_USERID);
            expect((result as BCEIDUserResponse).firstName).not.toBe(null);
        });
    });
});
