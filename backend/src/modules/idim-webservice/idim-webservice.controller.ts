import {
    Controller,
    Get,
    Query,
    HttpException,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import { ApiResponse, ApiQuery, ApiTags, ApiSecurity } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { IdimWebserviceService } from './idim-webservice.service';
import {
    IDIRUserResponse,
    BCEIDUserResponse,
    RequesterAccountTypeCode,
} from './idim-webservice.dto';

@ApiTags('IDIM Webservice')
@UseGuards(AuthGuard)
@ApiSecurity('X-API-KEY')
@Controller('idim-webservice')
export class IdimWebserviceController {
    constructor(
        private readonly idimWebserviceService: IdimWebserviceService
    ) {}

    @Get('idir')
    @ApiResponse({ status: HttpStatus.OK, type: IDIRUserResponse })
    @ApiQuery({
        name: 'requesterAccountTypeCode',
        enum: RequesterAccountTypeCode,
    })
    async verifyIdirUser(
        @Query('userId') userId: string,
        @Query('requesterUserId') requesterUserId: string,
        @Query('requesterAccountTypeCode')
        requesterAccountTypeCode: string
    ): Promise<HttpException | IDIRUserResponse> {
        return this.idimWebserviceService.verifyIdirUser(
            userId,
            requesterUserId,
            requesterAccountTypeCode
        );
    }

    @Get('bceid')
    @ApiResponse({ status: HttpStatus.OK, type: BCEIDUserResponse })
    @ApiQuery({
        name: 'requesterAccountTypeCode',
        enum: RequesterAccountTypeCode,
    })
    async verifyBceidUser(
        @Query('userId') userId: string,
        @Query('requesterUserGuid') requesterUserGuid: string,
        @Query('requesterAccountTypeCode')
        requesterAccountTypeCode: string
    ): Promise<HttpException | BCEIDUserResponse> {
        return this.idimWebserviceService.verifyBceidUser(
            userId,
            requesterUserGuid,
            requesterAccountTypeCode
        );
    }
}
