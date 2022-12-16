import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(3)
  readonly name: string;

  @ApiProperty({ example: '+58 424 83932219' })
  @IsString()
  @IsPhoneNumber()
  readonly phone: string;

  @ApiProperty({
    example:
      'Anzoategui, Lecheria, Calle Arismendi, Centro Empresarial Colon, Piso 1, Local 12',
  })
  @IsOptional()
  @IsString()
  @MaxLength(160)
  readonly address?: string;

  @ApiProperty({ example: 'Male' })
  @IsOptional()
  @IsString()
  readonly gender?: string;

  @ApiProperty({ example: 'johndoe@gmail.com' })
  @IsString()
  @IsEmail()
  @Transform((fn) => fn.value.toLowerCase())
  readonly email: string;

  @ApiProperty({ example: '@johnDoe*2011.' })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'The password must have a Uppercase, lowercase letter and a number',
  })
  password: string;

  // @ApiProperty({ example: 'A1D345FGH6JKL6' })
  // @IsOptional()
  // @IsString()
  // readonly role: string;
}
