import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Role } from '../../../common/enums';

@Schema({ timestamps: true, collection: 'users' })
export class User extends Document {
  @Prop({ required: true, maxlength: 120 })
  name: string;

  @Prop({ required: true, maxlength: 24 })
  phone: string;

  @Prop({ required: false, maxlength: 120 })
  address?: string;

  @Prop({ required: false, maxlength: 20 })
  gender?: string;

  @Prop({
    index: true,
    unique: true,
    lowercase: true,
    required: true,
  })
  email: string;

  @Prop({ select: false, required: true })
  password: string;

  @Prop({ required: true, default: Role.CANDIDATE })
  role: string;

  @Prop({ select: false, required: false })
  refresh_token?: string;

  @Prop({
    select: false,
    required: false,
    default: null,
  })
  password_reset_token?: string;

  @Prop({
    select: false,
    required: false,
    default: null,
  })
  activation_token?: string;

  @Prop({ required: true, default: false })
  isActive: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
