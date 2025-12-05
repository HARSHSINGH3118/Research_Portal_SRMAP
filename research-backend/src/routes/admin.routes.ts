import { Router } from "express";
import { requireAuth } from "../middlewares/auth.middleware";
import { EventModel } from "../models/event.model";
import { PaperModel } from "../models/paper.model";
import { ReviewModel } from "../models/review.model";
import { UserModel } from "../models/user.model";
import ExcelJS from "exceljs";

export const adminRouter = Router();

/* ==========================================================
   🟢 GLOBAL DASHBOARD SUMMARY (Overview Page)
   Route: GET /api/admin/stats
   Used on: /dashboard/coordinator (main overview)
========================================================== */
adminRouter.get("/admin/stats", requireAuth(["coordinator"]), async (_req, res) => {
  try {
    const [totalUsers, totalEvents, totalPapers, totalReviews] = await Promise.all([
      UserModel.countDocuments(),
      EventModel.countDocuments(),
      PaperModel.countDocuments(),
      ReviewModel.countDocuments(),
    ]);

    const recentEvents = await EventModel.find({}, "title date")
      .sort({ createdAt: -1 })
      .limit(5);

    const recentPapers = await PaperModel.find({})
      .populate("author", "name email")
      .populate("eventId", "title")
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      ok: true,
      summary: { totalUsers, totalEvents, totalPapers, totalReviews },
      recentEvents,
      recentPapers,
    });
  } catch (err: any) {
    console.error("🔥 Error in /admin/stats:", err);
    res.status(500).json({ ok: false, message: err.message });
  }
});

/* ==========================================================
   🟢 EVENT-LEVEL STATISTICS (Stats & Reports Page)
   Route: GET /api/admin/stats/event/:eventId
   Used on: /dashboard/coordinator/stats?eventId=...
========================================================== */
adminRouter.get("/admin/stats/event/:eventId", requireAuth(["coordinator"]), async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await EventModel.findById(eventId);
    if (!event) return res.status(404).json({ ok: false, message: "Event not found" });

    const papers = await PaperModel.find({ eventId });
    const totalPapers = papers.length;

    const paperStatuses = {
      total: totalPapers,
      selected: papers.filter((p) => p.status === "accepted").length,
      rejected: papers.filter((p) => p.status === "rejected").length,
      pending: papers.filter((p) => ["submitted", "under_review"].includes(p.status)).length,
    };

    const trackCountMap: Record<string, number> = {};
    papers.forEach((p) => {
      trackCountMap[p.track] = (trackCountMap[p.track] || 0) + 1;
    });
    const trackBreakdown = Object.entries(trackCountMap).map(([track, count]) => ({
      track,
      count,
    }));

    const paperIds = papers.map((p) => p._id);
    const totalReviews = await ReviewModel.countDocuments({ paper: { $in: paperIds } });

    const assignments = {
      total: totalReviews,
      reviewersAssigned: new Set(papers.map((p) => p.author?.toString())).size,
    };

    res.json({
      ok: true,
      eventStats: {
        event: event.title,
        papers: paperStatuses,
        reviews: { total: totalReviews },
        assignments,
        trackBreakdown,
      },
    });
  } catch (err: any) {
    console.error("🔥 Error in /admin/stats/event:", err);
    res.status(500).json({ ok: false, message: err.message });
  }
});

/* ==========================================================
   🟢 ACCEPTED PAPERS (Accepted + Export Page)
   Route: GET /api/events/:eventId/accepted
========================================================== */
adminRouter.get("/events/:eventId/accepted", requireAuth(["coordinator"]), async (req, res) => {
  try {
    const { eventId } = req.params;
    const papers = await PaperModel.find({ eventId, status: "accepted" })
      .populate("author", "name email contactNumber")
      .populate("eventId", "title")
      .lean();

    res.json({ ok: true, papers });
  } catch (err: any) {
    console.error("🔥 Error in /events/:eventId/accepted:", err);
    res.status(500).json({ ok: false, message: err.message });
  }
});

/* ==========================================================
   🟢 DOWNLOAD ACCEPTED PAPERS AS EXCEL
   Route: GET /api/events/:eventId/accepted.xlsx
========================================================== */
adminRouter.get("/events/:eventId/accepted.xlsx", requireAuth(["coordinator"]), async (req, res) => {
  try {
    const { eventId } = req.params;

    const papers = await PaperModel.find({ eventId, status: "accepted" })
      .populate("author", "name email contactNumber")
      .populate("eventId", "title")
      .lean();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Accepted Papers");

    sheet.columns = [
      { header: "S.No", key: "SNo", width: 6 },
      { header: "Paper Title", key: "PaperTitle", width: 40 },
      { header: "Track", key: "Track", width: 20 },
      { header: "Author Name", key: "AuthorName", width: 25 },
      { header: "Author Email", key: "AuthorEmail", width: 30 },
      { header: "Contact Number", key: "ContactNumber", width: 18 },
      { header: "Event", key: "Event", width: 25 },
    ];

    papers.forEach((p, idx) => {
      sheet.addRow({
        SNo: idx + 1,
        PaperTitle: p.title,
        Track: p.track,
        AuthorName: p.author?.name,
        AuthorEmail: p.author?.email,
        ContactNumber: p.author?.contactNumber || "N/A",
        Event: p.eventId?.title,
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=accepted-papers.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (err: any) {
    console.error("🔥 Error in /events/:eventId/accepted.xlsx:", err);
    res.status(500).json({ ok: false, message: err.message });
  }
});

/* ==========================================================
   🟢 REVIEWER REMINDERS (Pending Reviews)
   Route: GET /api/admin/reviewers/reminders
========================================================== */
adminRouter.get("/admin/reviewers/reminders", requireAuth(["coordinator"]), async (_req, res) => {
  try {
    const reviewers = await UserModel.find({ roles: { $in: ["reviewer"] } });
    const reviews = await ReviewModel.find();

    const reminders = reviewers.map((r) => {
      const reviewerReviews = reviews.filter(
        (rev) => rev.reviewer?.toString() === r._id.toString()
      );
      return {
        name: r.name,
        email: r.email,
        totalReviews: reviewerReviews.length,
      };
    });

    res.json({ ok: true, reminders });
  } catch (err: any) {
    console.error("🔥 Error in /admin/reviewers/reminders:", err);
    res.status(500).json({ ok: false, message: err.message });
  }
});
