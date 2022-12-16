import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import mongoose, { isValidObjectId } from 'mongoose';

@Injectable()
export class ParseMongoIdPipe implements PipeTransform<string, mongoose.Types.ObjectId> {
  transform(value: string, _metadata: ArgumentMetadata) {
    if (!isValidObjectId(value)) {
      throw new BadRequestException(`${value} is not a valid Mongo ID.`);
    }
    return new mongoose.Types.ObjectId(value);
  }
}
