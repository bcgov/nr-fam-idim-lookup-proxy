import {
    SearchIdirUserResItemDto,
    SearchIdirUsersResDto,
} from '../idim-webservice.dto';
import {
    SoapInternalAccountSummary,
    SoapSearchResultPayload,
} from '../types/idim-soap.types';

export function mapSoapResultToIdirUsersSearchResponse(
    payload: SoapSearchResultPayload,
    pageSize: number,
    pageIndex: number
): SearchIdirUsersResDto {
    const pagination = payload.pagination;
    const totalItems = Number(pagination.totalItems);
    const responsedPageSize = Number(pagination.requestedPageSize);
    const responsedPageIndex = Number(pagination.requestedPageIndex);

    // Eventhough IDIR user is an internal account, the SOAP (API - developer guide) BCeIDAccount field is the return in the response, which is a bit confusing.
    const rawAccounts = payload.accountList?.BCeIDAccount;
    // Here it handles the case when there is only one matched account from SOAP response, then rawAccounts will be an object instead of an array,
    // we need to convert it to array to make the following code understandable.
    let accounts: SoapInternalAccountSummary[];
    if (!rawAccounts) {
        accounts = [];
    } else if (Array.isArray(rawAccounts)) {
        accounts = rawAccounts;
    } else {
        accounts = [rawAccounts];
    }

    const items: SearchIdirUserResItemDto[] = accounts.map((acct) => {
        // DTO mapping from SOAP response to our API response object
        const item = new SearchIdirUserResItemDto();
        item.userId = acct.userId.value;
        item.guid = acct.guid.value;
        item.firstName = acct.individualIdentity.name.firstname.value;
        item.lastName = acct.individualIdentity.name.surname.value;
        item.email = acct.contact.email.value;
        return item;
    });

    const response = new SearchIdirUsersResDto();
    response.totalItems = totalItems;
    response.pageSize = responsedPageSize || pageSize;
    response.pageIndex = responsedPageIndex || pageIndex;
    response.items = items;
    return response;
}
