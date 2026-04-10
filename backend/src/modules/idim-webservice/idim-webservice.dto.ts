import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsAlphanumeric,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Length,
    MaxLength,
    Min,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { SearchMatchMode } from './constants';
import { AtLeastOneOf } from '../validators/at-least-one-of.decorator';

export class IDIRUserResponse {
    @ApiProperty()
    found!: boolean;

    @ApiProperty()
    userId!: string;

    @ApiProperty()
    guid!: string;

    @ApiProperty()
    firstName!: string;

    @ApiProperty()
    lastName!: string;

    @ApiProperty()
    email!: string;
}

export class BCEIDUserResponse {
    @ApiProperty()
    found!: boolean;

    @ApiProperty()
    userId!: string;

    @ApiProperty()
    guid!: string;

    @ApiProperty()
    businessGuid!: string;

    @ApiProperty()
    businessLegalName!: string;

    @ApiProperty()
    firstName!: string;

    @ApiProperty()
    lastName!: string;

    @ApiProperty()
    email!: string;
}

export class SearchIdirUsersReqBodyDto {
    @ApiProperty({
        description: 'Requester user GUID (32 alphanumeric characters).',
        minLength: 32,
        maxLength: 32,
    })
    @IsString()
    @Length(32, 32)
    @IsAlphanumeric()
    requesterUserGuid!: string;
}

export class SearchIdirUsersReqQueryDto {
    @ApiPropertyOptional({ description: 'IDIR first name search value.', maxLength: 50 })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    firstName?: string;

    @ApiPropertyOptional({ description: 'IDIR last name search value.', maxLength: 50 })
    @IsOptional()
    @IsString()
    @MaxLength(50)
    lastName?: string;

    @ApiPropertyOptional({ description: 'IDIR user ID search value.', maxLength: 20 })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    userId?: string;

    @ApiPropertyOptional({
        description: 'Match behavior for firstName. Defaults to Contains when firstName is supplied.',
        enum: SearchMatchMode,
    })
    @IsOptional()
    @IsEnum(SearchMatchMode)
    firstNameMatchMode?: SearchMatchMode;

    @ApiPropertyOptional({
        description: 'Match behavior for lastName. Defaults to Contains when lastName is supplied.',
        enum: SearchMatchMode,
    })
    @IsOptional()
    @IsEnum(SearchMatchMode)
    lastNameMatchMode?: SearchMatchMode;

    @ApiPropertyOptional({
        description: 'Match behavior for userId. Defaults to Contains when userId is supplied.',
        enum: SearchMatchMode,
    })
    @IsOptional()
    @IsEnum(SearchMatchMode)
    userIdMatchMode?: SearchMatchMode;

    @ApiPropertyOptional({ description: 'Requested page size. Defaults to 10.', default: 10 })
    @IsOptional()
    @Transform(({ value }) => (value === undefined ? value : Number.parseInt(value, 10)))
    @IsInt()
    @Min(1)
    pageSize?: number;

    @ApiPropertyOptional({ description: 'Requested page index. Defaults to 1.', default: 1 })
    @IsOptional()
    @Transform(({ value }) => (value === undefined ? value : Number.parseInt(value, 10)))
    @IsInt()
    @Min(1)
    pageIndex?: number;

    @AtLeastOneOf(['firstName', 'lastName', 'userId'], {
        message: 'At least one of firstName, lastName, or userId must be provided.',
    })
    readonly _atLeastOneSearchField?: never;
}

export class SearchIdirUserResItemDto {
    @ApiProperty()
    userId!: string;

    @ApiProperty()
    guid!: string;

    @ApiProperty()
    firstName!: string;

    @ApiProperty()
    lastName!: string;

    @ApiProperty()
    email!: string;
}

export class SearchIdirUsersResDto {
    @ApiProperty({ description: 'Total number of matching users returned by SOAP result metadata.' })
    totalItems!: number;

    @ApiProperty({ description: 'Requested page index reflected from SOAP response metadata.' })
    pageIndex!: number;

    @ApiProperty({ description: 'Requested page size reflected from SOAP response metadata.' })
    pageSize!: number;

    @ApiProperty({ type: () => [SearchIdirUserResItemDto] })
    items!: SearchIdirUserResItemDto[];
}
