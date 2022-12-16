import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
import { IsMongoId, IsString } from 'class-validator';

export class DocumentDto {
  @ApiProperty({ example: '45654745545349543543' })
  @IsString({ message: '_id must be a valid Mongo ID. ' })
  @IsMongoId({ message: '_id must be a valid Mongo ID. ' })
  readonly _id: string;
}

export class OptionalDocumentDto extends PartialType(DocumentDto) {}
