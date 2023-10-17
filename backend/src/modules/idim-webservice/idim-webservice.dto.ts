import { ApiProperty } from '@nestjs/swagger';

export enum RequesterAccountTypeCode {
    Internal = 'Internal',
}

export class IDIRUserResponse {
    @ApiProperty()
    found: boolean;

    @ApiProperty()
    userId: string;

    @ApiProperty()
    displayName: string;

    @ApiProperty()
    firstName: string;

    @ApiProperty()
    lastName: string;
}
