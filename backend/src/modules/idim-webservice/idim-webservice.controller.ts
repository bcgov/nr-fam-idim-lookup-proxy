import {
    Controller,
    Get,
    Query,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { ApiResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IdimWebserviceService } from './idim-webservice.service';
import {
    IDIRUserResponse,
    RequesterAccountTypeCode,
} from './idim-webservice.dto';

@ApiTags('IDIM Webservice')
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
}
