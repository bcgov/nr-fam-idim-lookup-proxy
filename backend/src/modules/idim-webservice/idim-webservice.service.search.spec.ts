import { IdimWebserviceService } from './idim-webservice.service';
import { HttpStatus } from '@nestjs/common';
import { SearchIdirUsersBodyDto, SearchIdirUsersQueryDto } from './idim-webservice.dto';
import { SearchMatchMode } from './constants';
import * as soap from 'soap';

jest.mock('soap', () => ({
    createClientAsync: jest.fn(),
}));

describe('IdimWebserviceService - searchIdirUsers', () => {
    let service: IdimWebserviceService;
    let soapClientMock: any;
    let createClientAsyncMock: jest.Mock;
    const envBackup = { ...process.env };

    beforeEach(() => {
        process.env.IDIM_WEB_SERVICE_URL = 'http://mock-url';
        process.env.IDIM_WEB_SERVICE_ID = 'mock-service-id';
        process.env.IDIM_WEB_SERVICE_USERNAME = 'mock-user';
        process.env.IDIM_WEB_SERVICE_PASSWORD = 'mock-pass';

        soapClientMock = {
            BCeIDService: {
                BCeIDServiceSoap: {
                    searchInternalAccount: jest.fn(),
                },
            },
            addHttpHeader: jest.fn(),
        };

        createClientAsyncMock = soap.createClientAsync as jest.Mock;
        createClientAsyncMock.mockResolvedValue(soapClientMock);

        service = new IdimWebserviceService();
    });

    afterEach(() => {
        jest.resetAllMocks();
        process.env = { ...envBackup };
    });

    it('should call SOAP with correct payload and map result', async () => {
        const body: SearchIdirUsersBodyDto = { requesterUserGuid: '12345678901234567890123456789012' };
        const query: SearchIdirUsersQueryDto = { firstName: 'John', pageSize: 5, pageIndex: 2, firstNameMatchMode: SearchMatchMode.Exact };
        const soapResult = {
            searchInternalAccountResult: {
                code: 'Success',
                pagination: {
                    totalItems: '1',
                    requestedPageSize: '5',
                    requestedPageIndex: '2',
                },
                accountList: {
                    BCeIDAccount: {
                        userId: { value: 'jdoe' },
                        guid: { value: 'guid1' },
                        individualIdentity: { name: { firstname: { value: 'John' }, surname: { value: 'Doe' } } },
                        contact: { email: { value: 'john.doe@example.com' } },
                    },
                },
            },
        };
        soapClientMock.BCeIDService.BCeIDServiceSoap.searchInternalAccount.mockImplementation((payload, cb) => {
            cb(null, soapResult);
        });

        const result = await service.searchIdirUsers(body, query);
        expect(result).toEqual({
            totalItems: 1,
            pageSize: 5,
            pageIndex: 2,
            items: [
                {
                    userId: 'jdoe',
                    guid: 'guid1',
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john.doe@example.com',
                },
            ],
        });
        expect(soapClientMock.BCeIDService.BCeIDServiceSoap.searchInternalAccount).toHaveBeenCalled();
    });

    it('should default pageSize/pageIndex when pagination is omitted', async () => {
        const body: SearchIdirUsersBodyDto = { requesterUserGuid: '12345678901234567890123456789012' };
        const query: SearchIdirUsersQueryDto = { firstName: 'John' };
        const soapResult = {
            searchInternalAccountResult: {
                code: 'Success',
                pagination: {
                    totalItems: '0',
                    requestedPageSize: '10',
                    requestedPageIndex: '1',
                },
                accountList: {},
            },
        };
        soapClientMock.BCeIDService.BCeIDServiceSoap.searchInternalAccount.mockImplementation((payload, cb) => {
            cb(null, soapResult);
        });

        const result = await service.searchIdirUsers(body, query);
        const payloadSent = soapClientMock.BCeIDService.BCeIDServiceSoap.searchInternalAccount.mock.calls[0][0];

        expect(payloadSent.internalAccountSearchRequest.pagination).toEqual({
            pageSizeMaximum: '10',
            pageIndex: '1',
        });
        expect(result.pageSize).toBe(10);
        expect(result.pageIndex).toBe(1);
    });

    it('should use default Contains match mode when match mode is not provided', async () => {
        const body: SearchIdirUsersBodyDto = { requesterUserGuid: '12345678901234567890123456789012' };
        const query: SearchIdirUsersQueryDto = { firstName: 'John', userId: 'jdoe' };
        const soapResult = {
            searchInternalAccountResult: {
                code: 'Success',
                pagination: {
                    totalItems: '0',
                    requestedPageSize: '10',
                    requestedPageIndex: '1',
                },
                accountList: {},
            },
        };
        soapClientMock.BCeIDService.BCeIDServiceSoap.searchInternalAccount.mockImplementation((payload, cb) => {
            cb(null, soapResult);
        });

        await service.searchIdirUsers(body, query);
        const payloadSent = soapClientMock.BCeIDService.BCeIDServiceSoap.searchInternalAccount.mock.calls[0][0];
        const accountMatch = payloadSent.internalAccountSearchRequest.accountMatch;

        expect(accountMatch.firstName).toEqual({ value: 'John', matchPropertyUsing: SearchMatchMode.Contains });
        expect(accountMatch.userId).toEqual({ value: 'jdoe', matchPropertyUsing: SearchMatchMode.Contains });
    });

    it('should include only provided search fields in accountMatch payload', async () => {
        const body: SearchIdirUsersBodyDto = { requesterUserGuid: '12345678901234567890123456789012' };
        const query: SearchIdirUsersQueryDto = { userId: 'jdoe' };
        const soapResult = {
            searchInternalAccountResult: {
                code: 'Success',
                pagination: {
                    totalItems: '0',
                    requestedPageSize: '10',
                    requestedPageIndex: '1',
                },
                accountList: {},
            },
        };
        soapClientMock.BCeIDService.BCeIDServiceSoap.searchInternalAccount.mockImplementation((payload, cb) => {
            cb(null, soapResult);
        });

        await service.searchIdirUsers(body, query);
        const payloadSent = soapClientMock.BCeIDService.BCeIDServiceSoap.searchInternalAccount.mock.calls[0][0];
        const accountMatch = payloadSent.internalAccountSearchRequest.accountMatch;

        expect(accountMatch).toEqual({
            userId: { value: 'jdoe', matchPropertyUsing: SearchMatchMode.Contains },
        });
    });

    it('should create SOAP client with Authorization header and add the same HTTP header', async () => {
        const body: SearchIdirUsersBodyDto = { requesterUserGuid: '12345678901234567890123456789012' };
        const query: SearchIdirUsersQueryDto = { userId: 'jdoe' };
        const soapResult = {
            searchInternalAccountResult: {
                code: 'Success',
                pagination: {
                    totalItems: '0',
                    requestedPageSize: '10',
                    requestedPageIndex: '1',
                },
                accountList: {},
            },
        };
        soapClientMock.BCeIDService.BCeIDServiceSoap.searchInternalAccount.mockImplementation((payload, cb) => {
            cb(null, soapResult);
        });

        await service.searchIdirUsers(body, query);

        const expectedAuth =
            'Basic ' + Buffer.from('mock-user:mock-pass').toString('base64');

        expect(createClientAsyncMock).toHaveBeenCalledWith('http://mock-url', {
            wsdl_headers: { Authorization: expectedAuth },
        });
        expect(soapClientMock.addHttpHeader).toHaveBeenCalledWith(
            'Authorization',
            expectedAuth,
        );
    });

    it('should reject with 500 and skip SOAP call when required credentials are missing', async () => {
        const body: SearchIdirUsersBodyDto = { requesterUserGuid: '12345678901234567890123456789012' };
        const query: SearchIdirUsersQueryDto = { userId: 'jdoe' };

        delete process.env.IDIM_WEB_SERVICE_PASSWORD;
        const serviceWithMissingCredentials = new IdimWebserviceService();

        await expect(serviceWithMissingCredentials.searchIdirUsers(body, query)).rejects.toMatchObject({
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            response: expect.objectContaining({
                error: expect.stringContaining('Missing IDIM web service crednetials'),
            }),
        });
        expect(createClientAsyncMock).not.toHaveBeenCalled();
    });

    it('should handle SOAP transport error', async () => {
        // Simulate a network/transport error from the SOAP client (e.g., connection failure).
        // The service should catch this and reject with an HttpException containing a custom error message.
        const body: SearchIdirUsersBodyDto = { requesterUserGuid: '12345678901234567890123456789012' };
        const query: SearchIdirUsersQueryDto = { userId: 'fail' };
        soapClientMock.BCeIDService.BCeIDServiceSoap.searchInternalAccount.mockImplementation((payload, cb) => {
            cb(new Error('SOAP transport error'), null);
        });
        await expect(service.searchIdirUsers(body, query)).rejects.toMatchObject({
            response: expect.objectContaining({
                error: expect.stringContaining('IDIM web service call error'),
            }),
        });
    });

    it('should handle SOAP business error', async () => {
        // Simulate a SOAP business-level failure payload.
        // The service should convert this into a BAD_REQUEST HttpException
        // and preserve SOAP failure metadata for clients.
        const body: SearchIdirUsersBodyDto = { requesterUserGuid: '12345678901234567890123456789012' };
        const query: SearchIdirUsersQueryDto = { userId: 'fail' };
        const soapResult = {
            searchInternalAccountResult: {
                code: 'Failed',
                failureCode: 'SomeBusinessError',
                message: 'Business error',
                pagination: {},
            },
        };
        soapClientMock.BCeIDService.BCeIDServiceSoap.searchInternalAccount.mockImplementation((payload, cb) => {
            cb(null, soapResult);
        });
        await expect(service.searchIdirUsers(body, query)).rejects.toMatchObject({
            status: HttpStatus.BAD_REQUEST,
            response: {
                status: HttpStatus.BAD_REQUEST,
                code: 'Failed',
                failureCode: 'SomeBusinessError',
                message: 'Business error',
            },
        });
    });
});
