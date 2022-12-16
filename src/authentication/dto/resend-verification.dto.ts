import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsString } from 'class-validator';

export class ResendVerificationDto {
  @ApiProperty({ example: 'jhoendoe@example.com' })
  @IsString()
  @IsEmail()
  @Transform((fn) => fn.value.toLowerCase())
  readonly email: string;
}
