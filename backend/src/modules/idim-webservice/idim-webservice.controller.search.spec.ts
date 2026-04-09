import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { IdimWebserviceController } from './idim-webservice.controller';
import { IdimWebserviceService } from './idim-webservice.service';
import { SearchIdirUsersBodyDto, SearchIdirUsersQueryDto, SearchIdirUsersResponseDto } from './idim-webservice.dto';
import { SearchMatchMode } from './constants';

describe('IdimWebserviceController - searchIdirUsers', () => {
    let controller: IdimWebserviceController;
    let service: IdimWebserviceService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [IdimWebserviceController],
            providers: [
                {
                    provide: IdimWebserviceService,
                    useValue: {
                        searchIdirUsers: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<IdimWebserviceController>(IdimWebserviceController);
        service = module.get<IdimWebserviceService>(IdimWebserviceService);
    });

    it('should call service with correct params and return result', async () => {
        const body: SearchIdirUsersBodyDto = { requesterUserGuid: '12345678901234567890123456789012' };
        const query: SearchIdirUsersQueryDto = { firstName: 'John', pageSize: 5, pageIndex: 2 };
        const expected: SearchIdirUsersResponseDto = {
            totalItems: 1,
            pageIndex: 2,
            pageSize: 5,
            items: [
                {
                    userId: 'jdoe',
                    guid: 'guid1',
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                },
            ],
        };
        (service.searchIdirUsers as jest.Mock).mockResolvedValue(expected);

        const result = await controller.searchIdirUsers(body, query);
        expect(service.searchIdirUsers).toHaveBeenCalledWith(body, query);
        expect(result).toEqual(expected);
    });

    it('should propagate HttpException when service.searchIdirUsers rejects', async () => {
        // The service throws HttpException for SOAP transport/business errors.
        // Controller should not transform it.
        const body: SearchIdirUsersBodyDto = { requesterUserGuid: '12345678901234567890123456789012' };
        const query: SearchIdirUsersQueryDto = { userId: 'fail' };
        const error = new HttpException({ error: 'IDIM web service call error: SOAP error' }, HttpStatus.INTERNAL_SERVER_ERROR);
        (service.searchIdirUsers as jest.Mock).mockRejectedValue(error);

        await expect(controller.searchIdirUsers(body, query)).rejects.toBe(error);
    });

    it('should forward search query fields including explicit match modes', async () => {
        const body: SearchIdirUsersBodyDto = { requesterUserGuid: '12345678901234567890123456789012' };
        const query: SearchIdirUsersQueryDto = {
            firstName: 'Jo',
            lastName: 'Do',
            userId: 'jd',
            firstNameMatchMode: SearchMatchMode.StartsWith,
            lastNameMatchMode: SearchMatchMode.Contains,
            userIdMatchMode: SearchMatchMode.Exact,
            pageSize: 20,
            pageIndex: 3,
        };
        const expected: SearchIdirUsersResponseDto = { totalItems: 0, pageIndex: 3, pageSize: 20, items: [] };
        (service.searchIdirUsers as jest.Mock).mockResolvedValue(expected);

        const result = await controller.searchIdirUsers(body, query);
        expect(service.searchIdirUsers).toHaveBeenCalledWith(body, query);
        expect(result).toEqual(expected);
    });
});
