import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ITask extends Document {
  taskName: string;
  creator: Types.ObjectId | string; 
}

const taskSchema = new Schema<ITask>({
  taskName: { type: String, required: true },
  creator: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
});

const TaskModel: Model<ITask> = mongoose.model<ITask>('Task', taskSchema);

export default TaskModel;
