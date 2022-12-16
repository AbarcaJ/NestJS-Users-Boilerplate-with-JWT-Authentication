import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsJWT } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'YYYYYYYYYY.XXXXXXXXXX.ZZZZZZZZZZ' })
  @IsString()
  @IsJWT()
  readonly token: string;

  @ApiProperty({ example: 'Your$Password$2022@' })
  @IsString()
  readonly password: string;
}
