import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';

// Schemas & Interfaces & DTOs
import { User } from './schemas';
import { UpdateUserDto } from './dto';
import { PaginationDto } from 'src/common/dto';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<User>) {}

  async findAll(pagination: PaginationDto) {
    const { limit = 10, offset = 0 } = pagination;
    const users = await this.userModel
      .find({})
      .skip(offset)
      .limit(limit)
      .sort({ name: 'asc' })
      .select('-__v')
      .exec();
    return users;
  }

  async findOne(term: string) {
    let user: User;
    if (isValidObjectId(term)) {
      user = await this.userModel.findOne({ _id: term });
    } else {
      user = await this.userModel.findOne({ email: term });
    }
    if (!user) throw new NotFoundException(`User with id or email "${term}" not found.`);
    return user;
  }

  async findByEmail(email: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new NotFoundException(`User with email "${email}" not found.`);
    return user;
  }

  async update(term: string, updateUserDto: UpdateUserDto) {
    const user: User = await this.findOne(term);
    try {
      await user.updateOne(updateUserDto);
      return { ...user.toJSON(), ...updateUserDto, password: undefined };
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async remove(id: string) {
    const { deletedCount } = await this.userModel.deleteOne({ _id: id });
    if (deletedCount === 0)
      throw new NotFoundException(`User with id '${id}' not found.`);
    return deletedCount;
  }

  private handleExceptions(err: any): never {
    if (err.code === 11000) {
      throw new ConflictException(
        `Record exists in the db ${JSON.stringify(err.keyValue)}`,
      );
    }
    console.error(err);
    throw new InternalServerErrorException(
      'Operation failed, Please check server logs for errors.',
    );
  }
}
