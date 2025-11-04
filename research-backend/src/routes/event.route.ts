import { Router } from "express";
import { EventModel } from "../models/event.model";
import { requireAuth } from "../middlewares/auth.middleware";
import multer from "multer";
import path from "path";
import fs from "fs";                      // ✅ add

export const eventRouter = Router();

// ✅ Store under /uploads/events and ensure the folder exists
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const dir = path.join(process.cwd(), "uploads", "events");
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

/**
 * Create Event (Coordinator only)
 */
eventRouter.post(
  "/create",
  requireAuth(["coordinator"]),
  upload.single("banner"),
  async (req, res) => {
    try {
      const { title, description, date } = req.body;
      const bannerUrl = req.file ? `/uploads/events/${req.file.filename}` : null; // ✅ public URL

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
 * List all events (public)
 */
eventRouter.get("/", async (_req, res) => {
  try {
    const events = await EventModel.find({}, "title date bannerUrl");
    res.json({ ok: true, events });
  } catch (err: any) {
    res.status(500).json({ ok: false, message: err.message });
  }
});
