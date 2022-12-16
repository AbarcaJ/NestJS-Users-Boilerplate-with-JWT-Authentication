import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'myaccount@gmail.com' })
  @IsOptional()
  @IsString()
  @IsEmail()
  readonly email?: string;
}
