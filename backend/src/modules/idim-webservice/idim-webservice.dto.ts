import { ApiProperty } from '@nestjs/swagger';

export enum SearchUserParameterType {
    UserGuid = 'userGuid',
    UserId = 'userId',
}

export enum RequesterAccountTypeCode {
    Internal = 'Internal',
    Business = 'Business',
}

export class IDIRUserResponse {
    @ApiProperty()
    found: boolean;

    @ApiProperty()
    userId: string;

    @ApiProperty()
    guid: string;

    @ApiProperty()
    firstName: string;

    @ApiProperty()
    lastName: string;

    @ApiProperty()
    email: string;
}

export class BCEIDUserResponse {
    @ApiProperty()
    found: boolean;

    @ApiProperty()
    userId: string;

    @ApiProperty()
    guid: string;

    @ApiProperty()
    businessGuid: string;

    @ApiProperty()
    businessLegalName: string;

    @ApiProperty()
    firstName: string;

    @ApiProperty()
    lastName: string;

    @ApiProperty()
    email: string;
}
