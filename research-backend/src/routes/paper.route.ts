import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { requireAuth } from "../middlewares/auth.middleware";
import { PaperModel } from "../models/paper.model";

export const paperRouter = Router();

// root: <project>/uploads
const UPLOADS_ROOT = path.resolve(process.cwd(), "uploads");
const PAPERS_DIR = path.join(UPLOADS_ROOT, "papers");
fs.mkdirSync(PAPERS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, PAPERS_DIR),
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

/**
 * Author uploads a paper
 */
paperRouter.post(
  "/upload",
  requireAuth(["author"]),
  upload.single("file"),
  async (req, res) => {
    try {
      const { title, track, eventId } = req.body;
      if (!req.file) return res.status(400).json({ ok: false, message: "No file uploaded" });

      // 🔑 save a PUBLIC path for the frontend to open
      const fileUrl = `/uploads/papers/${req.file.filename}`;

      const paper = await PaperModel.create({
        title,
        track,
        eventId: eventId || null,
        fileUrl,
        author: (req as any).user.userId,
        status: "submitted",
      });

      res.status(201).json({ ok: true, paper });
    } catch (err: any) {
      res.status(400).json({ ok: false, message: err.message });
    }
  }
);

// My submissions (must come before /:paperId route)
paperRouter.get("/my", requireAuth(["author"]), async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const papers = await PaperModel.find({ author: userId }).sort({ createdAt: -1 });
    res.json({ ok: true, papers });
  } catch (err: any) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

// Get a single paper by ID
paperRouter.get("/:paperId", requireAuth(), async (req, res) => {
  try {
    const { paperId } = req.params;
    const paper = await PaperModel.findById(paperId)
      .populate("author", "name email")
      .populate("eventId", "title");
    
    if (!paper) {
      return res.status(404).json({ ok: false, message: "Paper not found" });
    }
    
    res.json({ ok: true, paper });
  } catch (err: any) {
    res.status(500).json({ ok: false, message: err.message });
  }
});
