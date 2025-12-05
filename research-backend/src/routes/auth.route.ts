import { Router, Request, Response } from "express";
import { registerUser, loginUser } from "../services/auth.service";

export const authRouter = Router();

// Register
authRouter.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password, roles, contactNumber } = req.body;
    const user = await registerUser(name, email, password, roles, contactNumber);
    res.status(201).json({ ok: true, user });
  } catch (err: any) {
    res.status(400).json({ ok: false, message: err.message });
  }
});


// Login
authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const data = await loginUser(email, password);
    res.json({ ok: true, ...data });
  } catch (err: any) {
    res.status(400).json({ ok: false, message: err.message });
  }
});
