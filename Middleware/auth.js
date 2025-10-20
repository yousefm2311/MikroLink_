import jwt from "jsonwebtoken";
import Driver from "../models/Driver.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "مطلوب تسجيل الدخول" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.driver = await Driver.findById(decoded.id).select("-password");
    next();
  } catch (err) {
    res.status(401).json({ message: "توكن غير صالح أو منتهي" });
  }
};
