import { Injectable, HttpStatus, HttpException } from '@nestjs/common';
import { IDIRUserResponse } from './idim-webservice.dto';
const soap = require('soap');

@Injectable()
export class IdimWebserviceService {
    private idimWebServiceUrl = process.env.IDIM_WEB_SERVICE_URL;
    private idimWebServiceID = process.env.IDIM_WEB_SERVICE_ID;
    private idimWebServiceUsername = process.env.IDIM_WEB_SERVICE_USERNAME;
    private idimWebServicePassword = process.env.IDIM_WEB_SERVICE_PASSWORD;

    async verifyIdirUser(
        userId: string,
        requesterUserId: string,
        requesterAccountTypeCode: string
    ): Promise<HttpException | IDIRUserResponse> {
        if (
            !this.idimWebServiceUrl ||
            !this.idimWebServiceID ||
            !this.idimWebServiceUsername ||
            !this.idimWebServicePassword
        ) {
            return new HttpException(
                {
                    error: 'Missing IDIM web service crednetials in the environment variables',
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }

        // add autorization header for making the soap api call
        const auth =
            'Basic ' +
            Buffer.from(
                this.idimWebServiceUsername + ':' + this.idimWebServicePassword
            ).toString('base64');

        try {
            const client = await soap.createClientAsync(
                this.idimWebServiceUrl,
                {
                    wsdl_headers: { Authorization: auth },
                }
            );
            client.addHttpHeader('Authorization', auth);

            // set xml schema parameters for the request
            const requestData = {
                internalAccountSearchRequest: {
                    onlineServiceId: this.idimWebServiceID,
                    // who is sending the request
                    requesterAccountTypeCode,
                    requesterUserId,
                    // some config parameter
                    pagination: { pageSizeMaximum: '20', pageIndex: '1' },
                    sort: { direction: 'Ascending', onProperty: 'UserId' },
                    // who we search for, exact match userID
                    accountMatch: {
                        userId: {
                            value: userId,
                            matchPropertyUsing: 'Exact',
                        },
                    },
                },
            };

            return new Promise((resolve, reject) => {
                client.BCeIDService.BCeIDServiceSoap.searchInternalAccount(
                    requestData,
                    function (error, foundUser) {
                        // this will be any error from the IDIM server side
                        if (error) {
                            return reject(
                                new HttpException(
                                    {
                                        error:
                                            'IDIM web service call error: ' +
                                            error,
                                    },
                                    HttpStatus.INTERNAL_SERVER_ERROR
                                )
                            );
                        }

                        // this will be any error return by the web service, for example if we provided an non existing requestor id
                        if (
                            foundUser.searchInternalAccountResult.code ==
                            'Failed'
                        ) {
                            return reject(
                                new HttpException(
                                    {
                                        status: HttpStatus.BAD_REQUEST,
                                        ...foundUser.searchInternalAccountResult,
                                    },
                                    HttpStatus.BAD_REQUEST
                                )
                            );
                        }

                        if (
                            foundUser.searchInternalAccountResult.pagination
                                .totalItems > 0
                        ) {
                            const response = new IDIRUserResponse();
                            response.found = true;
                            response.userId =
                                foundUser.searchInternalAccountResult.accountList.BCeIDAccount[0].userId.value;
                            response.displayName =
                                foundUser.searchInternalAccountResult.accountList.BCeIDAccount[0].displayName.value;
                            resolve(response);
                        } else {
                            const response = new IDIRUserResponse();
                            response.found = false;
                            response.userId = null;
                            response.displayName = null;
                            resolve(response);
                        }
                    }
                );
            });
        } catch (error) {
            return new HttpException(
                { error: 'IDIM web service error: ' + error },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
