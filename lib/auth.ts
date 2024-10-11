import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_jwt_secret";

interface DecodedToken {
  userId: string;
  email: string;
  userType: string;
}

interface ExtendedRequest extends Request {
  user?: DecodedToken;
}

export function authMiddleware(allowedTypes: string[] = []) {
  return (handler: (request: ExtendedRequest) => Promise<NextResponse>) => {
    return async (request: ExtendedRequest) => {
      const authHeader = request.headers.get("Authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const token = authHeader.split(" ")[1];

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

        if (
          allowedTypes.length > 0 &&
          !allowedTypes.includes(decoded.userType)
        ) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        request.user = decoded;

        return handler(request);
      } catch (error) {
        console.error("Authentication error:", error);
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
    };
  };
}
