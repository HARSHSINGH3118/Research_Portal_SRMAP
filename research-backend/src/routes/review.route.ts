import { Router, Request, Response } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { ReviewModel } from "../models/review.model";
import { PaperModel } from "../models/paper.model";

export const reviewRouter = Router();

// Get papers assigned to the current reviewer
reviewRouter.get("/assigned", requireAuth(["reviewer"]), async (req: Request, res: Response) => {
  try {
    const reviewerId = (req as any).user.userId;
    
    // Get all papers that are available for review (submitted or under_review)
    const availablePapers = await PaperModel.find({
      status: { $in: ["submitted", "under_review"] }
    })
      .populate("author", "name email")
      .populate("eventId", "title")
      .sort({ createdAt: -1 })
      .lean();

    // Get all reviews by this reviewer to check which papers they've reviewed
    const reviewerReviews = await ReviewModel.find({ reviewer: reviewerId }).lean();
    const reviewedPaperIds = new Set(reviewerReviews.map((r) => r.paper.toString()));

    // Map papers with review status
    const papersWithStatus = availablePapers.map((paper: any) => ({
      _id: paper._id,
      title: paper.title,
      track: paper.track,
      fileUrl: paper.fileUrl,
      status: paper.status,
      author: paper.author,
      eventId: paper.eventId,
      createdAt: paper.createdAt,
      reviewed: reviewedPaperIds.has(paper._id.toString()),
    }));

    res.json({ ok: true, papers: papersWithStatus });
  } catch (err: any) {
    res.status(500).json({ ok: false, message: err.message });
  }
});

// Reviewer posts a review
reviewRouter.post("/:paperId", requireAuth(["reviewer"]), async (req: Request, res: Response) => {
  try {
    const { paperId } = req.params;
    const { comments, insights } = req.body;

    const review = await ReviewModel.create({
      paper: paperId,
      reviewer: (req as any).user.userId,
      comments,
      insights
    });

    res.status(201).json({ ok: true, review });
  } catch (err: any) {
    res.status(400).json({ ok: false, message: err.message });
  }
});

// Get reviews for a paper
reviewRouter.get("/:paperId", requireAuth(), async (req: Request, res: Response) => {
  const { paperId } = req.params;
  const reviews = await ReviewModel.find({ paper: paperId }).populate("reviewer", "name email");
  res.json({ ok: true, reviews });
});
