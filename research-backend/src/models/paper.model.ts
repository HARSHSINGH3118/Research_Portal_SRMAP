import mongoose, { Schema, Document } from "mongoose";

export type PaperStatus =
  | "submitted"
  | "under_review"
  | "revisions_requested"
  | "accepted"
  | "rejected";

export interface IPaper extends Document {
  title: string;
  track: string;                  // free text (e.g., "AI/ML")
  eventId?: mongoose.Types.ObjectId | null; // optional: which event this paper belongs to
  fileUrl: string;                // must be a public URL (e.g., /uploads/papers/xxx.pdf)
  author: mongoose.Types.ObjectId; // user _id
  status: PaperStatus;            // enum above
  createdAt: Date;
  updatedAt: Date;
}

const paperSchema = new Schema<IPaper>(
  {
    title: { type: String, required: true, trim: true },
    track: { type: String, required: true, trim: true },

    // optional event link
    eventId: { type: Schema.Types.ObjectId, ref: "Event", required: false, default: null },

    fileUrl: { type: String, required: true, trim: true },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },

    status: {
      type: String,
      enum: ["submitted", "under_review", "revisions_requested", "accepted", "rejected"],
      default: "submitted", // ✅ matches your route
      required: true,
    },
  },
  { timestamps: true }
);

export const PaperModel = mongoose.model<IPaper>("Paper", paperSchema);
