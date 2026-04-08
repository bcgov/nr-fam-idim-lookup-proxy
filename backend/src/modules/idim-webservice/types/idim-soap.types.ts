export type SoapNumeric = number | string;

// Wrapper for SOAP fields represented as nested <value> blocks.
export interface SoapWrappedValue<T> {
  value: T;
}

// SOAP-side match mode passed in accountMatch criteria.
export enum SoapMatchMode {
  Exact = 'Exact',
  Contains = 'Contains',
  StartsWith = 'StartsWith',
}

export enum SoapSortDirection {
  Ascending = 'Ascending',
  Descending = 'Descending',
}

export enum SoapSearchResultCode {
  Success = 'Success',
  Failed = 'Failed',
}

export interface SoapSearchMatchProperty {
  value: string;
  matchPropertyUsing: SoapMatchMode;
}

export interface SoapSearchRequestPayload {
  internalAccountSearchRequest: {
    onlineServiceId: string;
    requesterAccountTypeCode: 'Internal';
    requesterUserGuid: string;
    pagination: {
      pageSizeMaximum: string;
      pageIndex: string;
    };
    sort: {
      direction: SoapSortDirection;
      onProperty: 'UserId';
    };
    accountMatch: {
      firstName?: SoapSearchMatchProperty;
      lastName?: SoapSearchMatchProperty;
      userId?: SoapSearchMatchProperty;
    };
  };
}

export interface SoapSearchPaginationInfo {
  totalItems: SoapNumeric;
  totalVirtualItems: SoapNumeric;
  requestedPageSize: SoapNumeric;
  requestedPageIndex: SoapNumeric;
}

export interface SoapInternalAccountSummary {
  userId: SoapWrappedValue<string>;
  guid: SoapWrappedValue<string>;
  individualIdentity: {
    name: {
      firstname: SoapWrappedValue<string>;
      surname: SoapWrappedValue<string>;
    };
  };
  contact: {
    email: SoapWrappedValue<string>;
  };
}

export interface SoapSearchResultPayload {
  code: SoapSearchResultCode;
  failureCode?: string;
  message?: string;
  pagination: SoapSearchPaginationInfo;
  accountList?: {
    BCeIDAccount?: SoapInternalAccountSummary | SoapInternalAccountSummary[];
  };
}

export interface SoapSearchResultEnvelope {
  searchInternalAccountResult: SoapSearchResultPayload;
}

// Service-normalized shapes to keep mapping code clear and stable.
export interface InternalAccountSearchStatus {
  status: 'success' | 'failed';
  errorCode: string | null;
  errorMessage: string | null;
}

export interface InternalAccountSearchPage {
  matchedCount: number;
  virtualCount: number;
  requestedPageSize: number;
  requestedPageIndex: number;
}

export interface InternalAccountSearchRecord {
  userId: string;
  userGuid: string;
  firstName: string;
  lastName: string;
  email: string;
}
