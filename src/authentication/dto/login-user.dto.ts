import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ example: 'myaccount@gmail.com' })
  @IsString()
  @IsEmail()
  readonly email: string;

  @ApiProperty({ example: 'Your$Password$2022@' })
  @IsString()
  @IsNotEmpty()
  readonly password: string;
}
