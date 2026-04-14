import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Post,
    Query,
    UseGuards,
    UsePipes,
    ValidationPipe
} from '@nestjs/common';
import {
    ApiBody,
    ApiOperation,
    ApiQuery,
    ApiResponse,
    ApiSecurity,
    ApiTags,
} from '@nestjs/swagger';
import { Timed } from '../../common/decorators/timed.decorator';
import { AuthGuard } from '../auth/auth.guard';
import {
    RequesterAccountTypeCode,
    SearchMatchMode,
    SearchUserParameterType,
} from './constants';
import {
    BCEIDUserResponse,
    IDIRUserResponse,
    SearchIdirUsersReqBodyDto,
    SearchIdirUsersReqQueryDto,
    SearchIdirUsersResDto,
} from './idim-webservice.dto';
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
    @ApiOperation({ summary: 'Get IDIR user account detail by userId (exact match)' })
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

    @Post('idir-users/search')
    @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
    @ApiOperation({
        summary: 'Search IDIR users',
        description:
            'Searches IDIR users by firstName, lastName, or userId via IDIM WebService (partial match allowed for search).'
    })
    @ApiBody({ type: SearchIdirUsersReqBodyDto })
    @ApiQuery({ name: 'firstName', required: false, description: 'IDIR first name search value.', type: String })
    @ApiQuery({ name: 'lastName', required: false, description: 'IDIR last name search value.', type: String })
    @ApiQuery({ name: 'userId', required: false, description: 'IDIR user ID search value.', type: String })
    @ApiQuery({ name: 'firstNameMatchMode', required: false, enum: SearchMatchMode })
    @ApiQuery({ name: 'lastNameMatchMode', required: false, enum: SearchMatchMode })
    @ApiQuery({ name: 'userIdMatchMode', required: false, enum: SearchMatchMode })
    @ApiQuery({ name: 'pageSize', required: false, type: Number, description: 'Page size. Defaults to 50.' })
    @ApiResponse({ status: HttpStatus.OK, type: SearchIdirUsersResDto })
    @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid or missing search parameters, or SOAP business failure.' })
    @Timed('searchIdirUsers controller request')
    async searchIdirUsers(
        @Body() body: SearchIdirUsersReqBodyDto,
        @Query() query: SearchIdirUsersReqQueryDto,
    ): Promise<SearchIdirUsersResDto> {
        return this.idimWebserviceService.searchIdirUsers(body, query);
    }

    // -- Below are for BCeID IDIM call

    @Get('businessBceid')
    @ApiOperation({ 
        summary: 'Get BCeID business user account detail by specified search parameter',
        description: 'Searches BCeID business user by specified search parameter (userId or guid, exact match) via IDIM WebService.'
     })
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
