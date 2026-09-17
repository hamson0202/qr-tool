import mongoose, { Schema, model, models } from 'mongoose'

export interface IProject {
  _id: mongoose.Types.ObjectId
  name: string
  createdBy: mongoose.Types.ObjectId
  createdByName: string
  createdAt: Date
}

const ProjectSchema = new Schema<IProject>({
  name: { type: String, required: true, trim: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdByName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
})

export const Project = models.Project<IProject> || model<IProject>('Project', ProjectSchema)
