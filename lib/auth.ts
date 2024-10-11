import jwt from "jsonwebtoken";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_jwt_secret";

export async function verifyToken(token: string | undefined) {
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: number;
      email: string;
      userType: string;
    };
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return null;
    }

    return { userId: user.id, email: user.email, userType: user.userType };
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}
