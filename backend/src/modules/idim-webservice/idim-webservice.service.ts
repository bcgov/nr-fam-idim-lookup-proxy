import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
    BCEIDUserResponse,
    IDIRUserResponse,
    RequesterAccountTypeCode,
    SearchUserParameterType,
} from './idim-webservice.dto';
const soap = require('soap');

@Injectable()
export class IdimWebserviceService {
    private idimWebServiceUrl = process.env.IDIM_WEB_SERVICE_URL;
    private idimWebServiceID = process.env.IDIM_WEB_SERVICE_ID;
    private idimWebServiceUsername = process.env.IDIM_WEB_SERVICE_USERNAME;
    private idimWebServicePassword = process.env.IDIM_WEB_SERVICE_PASSWORD;
    
    private checkRequiredIDIMCredentials() {
        if (
            !this.idimWebServiceUrl ||
            !this.idimWebServiceID ||
            !this.idimWebServiceUsername ||
            !this.idimWebServicePassword
        ) {
            throw new HttpException(
                {
                    error: 'Missing IDIM web service crednetials in the environment variables',
                },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    private async getSoapClient() {
        // add autorization header for making the soap api call
        const auth =
            'Basic ' +
            Buffer.from(
                this.idimWebServiceUsername + ':' + this.idimWebServicePassword
            ).toString('base64');

        const client = await soap.createClientAsync(this.idimWebServiceUrl, {
            wsdl_headers: { Authorization: auth },
        });
        client.addHttpHeader('Authorization', auth);
        return client;
    }

    async verifyIdirUser(
        userId: string,
        requesterUserId: string,
        requesterAccountTypeCode: string
    ): Promise<HttpException | IDIRUserResponse> {
        this.checkRequiredIDIMCredentials();
        try {
            const client = await this.getSoapClient();
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

                        // this will be any error return by the web service
                        // for example if we provided an non existing requestor id, or permission issue
                        if (
                            foundUser.searchInternalAccountResult.code ==
                            'Failed'
                        ) {
                            return reject(
                                new HttpException(
                                    {
                                        status: HttpStatus.BAD_REQUEST,
                                        code: foundUser
                                            .searchInternalAccountResult.code,
                                        failureCode:
                                            foundUser
                                                .searchInternalAccountResult
                                                .failureCode,
                                        message:
                                            foundUser
                                                .searchInternalAccountResult
                                                .message,
                                    },
                                    HttpStatus.BAD_REQUEST
                                )
                            );
                        }

                        // user not found case
                        // searchInternalAccount method returns code Success with pagination.totalItems = 0
                        if (
                            foundUser.searchInternalAccountResult.pagination
                                .totalItems == 0
                        ) {
                            const response = new IDIRUserResponse();
                            response.found = false;
                            response.userId = userId;
                            return resolve(response);
                        }

                        const response = new IDIRUserResponse();
                        const userInfo =
                            foundUser.searchInternalAccountResult.accountList
                                .BCeIDAccount[0];
                        response.found = true;
                        response.userId = userInfo.userId.value;
                        response.guid = userInfo.guid.value;
                        response.firstName =
                            userInfo.individualIdentity.name.firstname.value;
                        response.lastName =
                            userInfo.individualIdentity.name.surname.value;
                        response.email = userInfo.contact.email.value;
                        return resolve(response);
                    }
                );
            });
        } catch (error) {
            return new HttpException(
                { error: 'Error happened when call verifyIdirUser: ' + error },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Scenario: IDIR requester looks up IDIR user.
     * @param {string} userId - Target IDIR user id (username)
     * @param {string} requesterUserGuid  - User GUID from the requester.
     * @returns {IDIRUserResponse} - return response object if found.
     */
    async verifyIdirUserByIdimAccountDetail(
        userId: string,
        requesterUserGuid: string,
    ): Promise<HttpException | IDIRUserResponse> {
        this.checkRequiredIDIMCredentials();
        try {
            const client = await this.getSoapClient();
            // set xml schema parameters for the request
            const requesterAccountTypeCode = RequesterAccountTypeCode.Internal
            const requestData = {
                accountDetailRequest: {
                    onlineServiceId: this.idimWebServiceID,
                    requesterAccountTypeCode,
                    requesterUserGuid,  // should use GUID for webservice call, not user id.
                    // who we search for, exact match userID
                    userId,
                    accountTypeCode: RequesterAccountTypeCode.Internal, // this is internal IDIR search
                },
            };

            return new Promise((resolve, reject) => {
                client.BCeIDService.BCeIDServiceSoap.getAccountDetail(
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

                        // this will be any error return by the web service
                        // for example if we provided an non existing requestor id, or permission issue
                        if (
                            foundUser.getAccountDetailResult.code == 'Failed' &&
                            foundUser.getAccountDetailResult.failureCode !==
                                'NoResults'
                        ) {
                            return reject(
                                new HttpException(
                                    {
                                        status: HttpStatus.BAD_REQUEST,
                                        code: foundUser.getAccountDetailResult
                                            .code,
                                        failureCode:
                                            foundUser.getAccountDetailResult
                                                .failureCode,
                                        message:
                                            foundUser.getAccountDetailResult
                                                .message,
                                    },
                                    HttpStatus.BAD_REQUEST
                                )
                            );
                        }

                        // user not found case
                        if (
                            foundUser.getAccountDetailResult.code == 'Failed' &&
                            foundUser.getAccountDetailResult.failureCode ==
                                'NoResults'
                        ) {
                            const response = new IDIRUserResponse();
                            response.found = false;
                            response.userId = userId;
                            return resolve(response);
                        }

                        const response = new IDIRUserResponse();
                        const userInfo =
                            foundUser.getAccountDetailResult.account;
                        response.found = true;
                        response.userId = userInfo.userId.value;
                        response.guid = userInfo.guid.value;
                        response.firstName =
                            userInfo.individualIdentity.name.firstname.value;
                        response.lastName =
                            userInfo.individualIdentity.name.surname.value;
                        response.email = userInfo.contact.email.value;
                        return resolve(response);
                    }
                );
            });
        } catch (error) {
            return new HttpException(
                { error: 'Error happened when call verifyIdirUserByIdimAccountDetail: ' + error },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    // -- Below are for BCeID IDIM call

    async verifyBceidUser(
        userId: string,
        requesterUserGuid: string,
        requesterAccountTypeCode: string
    ): Promise<HttpException | BCEIDUserResponse> {
        this.checkRequiredIDIMCredentials();
        try {
            const client = await this.getSoapClient();
            // set xml schema parameters for the request
            const requestData = {
                accountDetailRequest: {
                    onlineServiceId: this.idimWebServiceID,
                    // who is sending the request
                    requesterAccountTypeCode,
                    requesterUserGuid,
                    // who we search for, exact match userID
                    userId,
                    accountTypeCode: RequesterAccountTypeCode.Business,
                },
            };

            return new Promise((resolve, reject) => {
                client.BCeIDService.BCeIDServiceSoap.getAccountDetail(
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

                        // this will be any error return by the web service
                        // for example if we provided an non existing requestor id, or permission issue
                        if (
                            foundUser.getAccountDetailResult.code == 'Failed' &&
                            foundUser.getAccountDetailResult.failureCode !==
                                'NoResults'
                        ) {
                            return reject(
                                new HttpException(
                                    {
                                        status: HttpStatus.BAD_REQUEST,
                                        code: foundUser.getAccountDetailResult
                                            .code,
                                        failureCode:
                                            foundUser.getAccountDetailResult
                                                .failureCode,
                                        message:
                                            foundUser.getAccountDetailResult
                                                .message,
                                    },
                                    HttpStatus.BAD_REQUEST
                                )
                            );
                        }

                        // user not found case
                        // getAccountDetail method returns code Failed with failureCode NoResults
                        // which is different than the not found case of searchInternalAccount method that we used above for searching idir user
                        if (
                            foundUser.getAccountDetailResult.code == 'Failed' &&
                            foundUser.getAccountDetailResult.failureCode ==
                                'NoResults'
                        ) {
                            const response = new BCEIDUserResponse();
                            response.found = false;
                            response.userId = userId;
                            return resolve(response);
                        }

                        const response = new BCEIDUserResponse();
                        const userInfo =
                            foundUser.getAccountDetailResult.account;
                        response.found = true;
                        response.userId = userInfo.userId.value;
                        response.guid = userInfo.guid.value;
                        response.businessGuid = userInfo.business.guid.value;
                        response.businessLegalName =
                            userInfo.business.legalName.value;
                        response.firstName =
                            userInfo.individualIdentity.name.firstname.value;
                        response.lastName =
                            userInfo.individualIdentity.name.surname.value;
                        response.email = userInfo.contact.email.value;
                        return resolve(response);
                    }
                );
            });
        } catch (error) {
            return new HttpException(
                { error: 'Error happened when call verifyBceidUser: ' + error },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async verifyBusinessBceidUser(
        searchUserBy: string,
        searchValue: string,
        requesterUserGuid: string,
        requesterAccountTypeCode: string
    ): Promise<HttpException | BCEIDUserResponse> {
        this.checkRequiredIDIMCredentials();
        try {
            const client = await this.getSoapClient();
            // set xml schema parameters for the request
            const requestData = {
                accountDetailRequest: {
                    onlineServiceId: this.idimWebServiceID,
                    // who is sending the request
                    requesterAccountTypeCode,
                    requesterUserGuid,
                    // who we search for, exact match by userID or userGuid
                    [searchUserBy]: searchValue,
                    accountTypeCode: RequesterAccountTypeCode.Business,
                },
            };

            return new Promise((resolve, reject) => {
                client.BCeIDService.BCeIDServiceSoap.getAccountDetail(
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

                        // this will be any error return by the web service
                        // for example if we provided an non existing requestor id, or permission issue
                        if (
                            foundUser.getAccountDetailResult.code == 'Failed' &&
                            foundUser.getAccountDetailResult.failureCode !==
                                'NoResults'
                        ) {
                            return reject(
                                new HttpException(
                                    {
                                        status: HttpStatus.BAD_REQUEST,
                                        code: foundUser.getAccountDetailResult
                                            .code,
                                        failureCode:
                                            foundUser.getAccountDetailResult
                                                .failureCode,
                                        message:
                                            foundUser.getAccountDetailResult
                                                .message,
                                    },
                                    HttpStatus.BAD_REQUEST
                                )
                            );
                        }

                        // user not found case
                        // getAccountDetail method returns code Failed with failureCode NoResults
                        // which is different than the not found case of searchInternalAccount method that we used above for searching idir user
                        if (
                            foundUser.getAccountDetailResult.code == 'Failed' &&
                            foundUser.getAccountDetailResult.failureCode ==
                                'NoResults'
                        ) {
                            const response = new BCEIDUserResponse();
                            response.found = false;
                            if (
                                searchUserBy == SearchUserParameterType.UserGuid
                            )
                                response.guid = searchValue;
                            else response.userId = searchValue;
                            return resolve(response);
                        }

                        const response = new BCEIDUserResponse();
                        const userInfo =
                            foundUser.getAccountDetailResult.account;
                        response.found = true;
                        response.userId = userInfo.userId.value;
                        response.guid = userInfo.guid.value;
                        response.businessGuid = userInfo.business.guid.value;
                        response.businessLegalName =
                            userInfo.business.legalName.value;
                        response.firstName =
                            userInfo.individualIdentity.name.firstname.value;
                        response.lastName =
                            userInfo.individualIdentity.name.surname.value;
                        response.email = userInfo.contact.email.value;
                        return resolve(response);
                    }
                );
            });
        } catch (error) {
            return new HttpException(
                { error: 'Error happened when call verifyBceidUser: ' + error },
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
