import mongoose, { Schema, Document, Model, ObjectId } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  tasks: mongoose.Types.ObjectId[];
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  tasks: [{ type: mongoose.Types.ObjectId, required: true, ref: 'Task' }],
});

const UserModel: Model<IUser> = mongoose.model<IUser>('User', userSchema);

export default UserModel;
