import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { requireAuth } from "../middlewares/auth.middleware";
import { EventModel } from "../models/event.model";
import { PaperModel } from "../models/paper.model";
import { UserModel } from "../models/user.model";

export const eventRouter = Router();

// ✅ Storage config for event banners
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    const dir = path.join(process.cwd(), "uploads", "events");
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

/**
 * ✅ Create Event (Coordinator only)
 */
eventRouter.post(
  "/create",
  requireAuth(["coordinator"]),
  upload.single("banner"),
  async (req: Request, res: Response) => {
    try {
      const { title, description, date } = req.body;
      const bannerUrl = req.file ? `/uploads/events/${req.file.filename}` : null;

      const event = await EventModel.create({
        title,
        description,
        date,
        bannerUrl,
        createdBy: (req as any).user.userId,
      });

      res.status(201).json({ ok: true, event });
    } catch (err: any) {
      res.status(400).json({ ok: false, message: err.message });
    }
  }
);

/**
 * ✅ Get all events (public)
 */
eventRouter.get("/", async (_req: Request, res: Response) => {
  try {
    const events = await EventModel.find({}, "title description date bannerUrl");
    res.json({ ok: true, events });
  } catch (err: any) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

/**
 * ✅ Get all papers (submissions) for an event
 * Used in Assignments page
 */
eventRouter.get("/:eventId/submissions", requireAuth(["coordinator"]), async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const papers = await PaperModel.find({ eventId }).populate("author", "name email");
    res.json({ ok: true, papers });
  } catch (err: any) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

/**
 * ✅ Get all reviewers (used in Assignments dropdown)
 */
eventRouter.get("/reviewers/all", requireAuth(["coordinator"]), async (_req: Request, res: Response) => {
  try {
    const reviewers = await UserModel.find({ roles: { $in: ["reviewer"] } }, "name email");
    res.json({ ok: true, reviewers });
  } catch (err: any) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

/**
 * ✅ Get current assignments for an event (placeholder for now)
 */
eventRouter.get("/:eventId/assignments", requireAuth(["coordinator"]), async (_req: Request, res: Response) => {
  try {
    // no assignment collection yet → send empty for now
    res.json({ ok: true, assignments: [] });
  } catch (err: any) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

/**
 * ✅ Assign paper to reviewer (placeholder)
 * Will log for now; later we can persist to DB when AssignmentModel is added
 */
eventRouter.post("/:eventId/assign", requireAuth(["coordinator"]), async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const { reviewerId, paperIds } = req.body;

    console.log(`Assigning papers ${paperIds} to reviewer ${reviewerId} for event ${eventId}`);
    res.json({ ok: true, message: "Assignment recorded (mock)" });
  } catch (err: any) {
    res.status(500).json({ ok: false, message: err.message });
  }
});
