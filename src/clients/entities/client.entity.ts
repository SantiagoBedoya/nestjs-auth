import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ClientDocument = HydratedDocument<Client>;

@Schema({
  timestamps: true,
  toJSON: {
    transform(doc, ret, options) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.createdAt;
      delete ret.updatedAt;
    },
  },
})
export class Client {
  @Prop({ type: String, required: true, unique: true })
  name: string;

  @Prop({ type: String, required: false, default: null })
  description: string;

  @Prop({ type: String, required: true, unique: true })
  secret: string;

  @Prop({ type: String, required: true })
  callbackURL: string;
}

export const ClientSchema = SchemaFactory.createForClass(Client);
