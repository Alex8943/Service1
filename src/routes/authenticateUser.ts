import jwt, { JwtPayload } from "jsonwebtoken";

export default function verifyUser(req: any, res: any, next: any) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization token is missing or malformed" });
    }

    const token = authHeader.split(" ")[1]; // Extract the token

    const decoded = jwt.verify(token, "secret") as JwtPayload;
    console.log("Decoded Token:", decoded);

    // Safely extract user ID from the nested 'user' object
    const userIdFromToken = decoded.user?.id;

    if (!userIdFromToken) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    /*const userIdFromToken = decoded.user_id; // Adjust based on your JWT payload structure
    if (req.params.id && parseInt(req.params.id) !== userIdFromToken) {
      return res.status(403).json({ message: "You are not authorized to access this resource" });
    }*/

      next();
  } catch (error: any) {
    console.error("JWT verification error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
