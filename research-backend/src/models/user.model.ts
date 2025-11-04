import mongoose, { Schema, Document } from "mongoose";

export type UserRole = "author" | "reviewer" | "coordinator";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  roles: UserRole[];  
  contactNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },

    
    roles: {
      type: [String],
      enum: ["author", "reviewer", "coordinator"],
      default: ["author"],
    },
    contactNumber: { type: String, required: false },
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUser>("User", userSchema);
