import { ApiProperty } from '@nestjs/swagger';
import { IsJWT, IsString } from 'class-validator';

export class VerifyAccountDto {
  @ApiProperty({ example: 'YYYYYYYYYY.XXXXXXXXXX.ZZZZZZZZZZ' })
  @IsString()
  @IsJWT()
  readonly token: string;
}
