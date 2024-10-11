import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_jwt_secret";

export function authMiddleware(allowedTypes: string[] = []) {
  return (handler: (request: Request) => Promise<NextResponse>) => {
    return async (request: Request) => {
      const authHeader = request.headers.get("Authorization");

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const token = authHeader.split(" ")[1];

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as {
          userId: string;
          email: string;
          userType: string;
        };

        if (
          allowedTypes.length > 0 &&
          !allowedTypes.includes(decoded.userType)
        ) {
          return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // Attach the user information to the request for use in the route handler
        (request as any).user = decoded;

        return handler(request);
      } catch (error) {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
    };
  };
}
