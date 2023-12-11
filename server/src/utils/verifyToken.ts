import { GraphQLError } from "graphql";
import { IncomingMessage } from "http";
import jwt, { Secret } from "jsonwebtoken";

export const verifyToken = (req: IncomingMessage) => {
  const authHeader = req.headers["authorization"] || "";
  const token = authHeader && authHeader.split(" ")[1];

  const error = new GraphQLError("Unauthorized", {
    extensions: {
      code: "UNAUTHORIZED",
      http: { status: 401 },
    },
  });

  if (!token) {
    throw error;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as Secret, {
      algorithms: ["HS256"],
    });
    return decoded;
  } catch (err) {
    throw error;
  }
};
