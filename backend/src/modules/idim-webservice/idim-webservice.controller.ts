import {
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiQuery, ApiResponse, ApiSecurity, ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import {
    BCEIDUserResponse,
    IDIRUserResponse,
} from './idim-webservice.dto';
import {
    RequesterAccountTypeCode,
    SearchUserParameterType,
} from './constants';
import { IdimWebserviceService } from './idim-webservice.service';

@ApiTags('IDIM Webservice')
@UseGuards(AuthGuard)
@ApiSecurity('X-API-KEY')
@Controller('idim-webservice')
export class IdimWebserviceController {
    constructor(
        private readonly idimWebserviceService: IdimWebserviceService
    ) {}

    // -- Below are for IDIR IDIM call

    @Get('idir-account-detail')
    @ApiResponse({ status: HttpStatus.OK, type: IDIRUserResponse })
    async verifyIdirUserByIdimAccountDetail(
        @Query('userId') userId: string,
        @Query('requesterUserGuid') requesterUserGuid: string,
    ): Promise<HttpException | IDIRUserResponse> {
        return this.idimWebserviceService.verifyIdirUserByIdimAccountDetail(
            userId,
            requesterUserGuid
        );
    }

    // -- Below are for BCeID IDIM call

    @Get('businessBceid')
    @ApiResponse({ status: HttpStatus.OK, type: BCEIDUserResponse })
    @ApiQuery({
        name: 'requesterAccountTypeCode',
        enum: RequesterAccountTypeCode,
    })
    @ApiQuery({ name: 'searchUserBy', enum: SearchUserParameterType })
    async verifyBusinessBceidUser(
        @Query('searchUserBy') searchUserBy: SearchUserParameterType,
        @Query('searchValue') searchValue: string,
        @Query('requesterUserGuid') requesterUserGuid: string,
        @Query('requesterAccountTypeCode')
        requesterAccountTypeCode: RequesterAccountTypeCode
    ): Promise<HttpException | BCEIDUserResponse> {
        return this.idimWebserviceService.verifyBusinessBceidUser(
            searchUserBy,
            searchValue,
            requesterUserGuid,
            requesterAccountTypeCode
        );
    }

    // -- Below methods are deprecated endpoints, to be removed in a future release

    @Get('idir')
    /**
     * @deprecated This endpoint is deprecated and will be removed in a future release.
     */
    @ApiResponse({ status: HttpStatus.OK, type: IDIRUserResponse })
    @ApiQuery({
        name: 'requesterAccountTypeCode',
        enum: RequesterAccountTypeCode,
    })
    @ApiOperation({ deprecated: true })
    async verifyIdirUser(
        @Query('userId') userId: string,
        @Query('requesterUserId') requesterUserId: string,
        @Query('requesterAccountTypeCode')
        requesterAccountTypeCode: RequesterAccountTypeCode
    ): Promise<HttpException | IDIRUserResponse> {
        return this.idimWebserviceService.verifyIdirUser(
            userId,
            requesterUserId,
            requesterAccountTypeCode
        );
    }

    @Get('bceid')
    /**
     * @deprecated This endpoint is deprecated and will be removed in a future release.
     */
    @ApiResponse({ status: HttpStatus.OK, type: BCEIDUserResponse })
    @ApiQuery({
        name: 'requesterAccountTypeCode',
        enum: RequesterAccountTypeCode,
    })
    @ApiOperation({ deprecated: true })
    async verifyBceidUser(
        @Query('userId') userId: string,
        @Query('requesterUserGuid') requesterUserGuid: string,
        @Query('requesterAccountTypeCode')
        requesterAccountTypeCode: RequesterAccountTypeCode
    ): Promise<HttpException | BCEIDUserResponse> {
        return this.idimWebserviceService.verifyBceidUser(
            userId,
            requesterUserGuid,
            requesterAccountTypeCode
        );
    }
}
