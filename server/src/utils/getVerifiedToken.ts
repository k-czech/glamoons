import { Secret, verify } from "jsonwebtoken";
import { Context } from "../context";
import { GraphQLError } from "graphql";

type Token = {
  userId: string;
};

export const getVerifiedToken = (context: Context) => {
  const authHeader = context.req.headers.authorization;

  if (!authHeader) {
    throw new GraphQLError("User is not authenticated", {
      extensions: {
        code: "UNAUTHENTICATED",
        http: { status: 401 },
      },
    });
  }

  const token = authHeader.replace("Bearer ", "");
  const verifiedToken = verify(
    token,
    process.env.JWT_SECRET as Secret
  ) as Token;

  return verifiedToken && verifiedToken.userId;
};
