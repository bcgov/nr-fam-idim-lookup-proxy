/**
 * SOAP transport and mapping types for IDIM integration.
 *
 * These interfaces and types represent the raw SOAP request/response shapes and
 * normalized internal mapping structures used by the service layer to interact with
 * the IDIM SOAP API (e.g., searchInternalAccount).
 *
 * These types are NOT used as controller response DTOs. Instead, the service maps
 * these internal types to API-facing DTOs (see idim-webservice.dto.ts) before returning
 * data to REST clients.
 *
 * This separation ensures that SOAP-specific details and quirks are isolated from
 * the REST API contract, and only relevant, stable fields are exposed externally.
 */
import {
  RequesterAccountTypeCode,
  SearchMatchMode,
  SoapSearchResultCode,
  SoapSortDirection,
  SoapSortProperty,
} from '../constants';

export type SoapNumeric = number | string;

// Wrapper for SOAP fields represented as nested <value> blocks.
export interface SoapWrappedValue<T> {
  value: T;
}
export interface SoapSearchMatchProperty {
  value: string;
  matchPropertyUsing: SearchMatchMode;
}

export interface SoapSearchRequestPayload {
  internalAccountSearchRequest: {
    onlineServiceId: string;
    requesterAccountTypeCode: RequesterAccountTypeCode;
    requesterUserGuid: string;
    pagination: {
      pageSizeMaximum: string;
      pageIndex: string;
    };
    sort: {
      direction: SoapSortDirection;
      onProperty: SoapSortProperty;
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
