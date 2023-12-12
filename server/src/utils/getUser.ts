import { Secret, verify } from "jsonwebtoken";
import { Context } from "../context";

type Token = {
  userId: string;
};

export const getUser = (context: Context) => {
  const authHeader = context.req.headers["authorization"] || "";

  const token = authHeader.replace("Bearer ", "");
  const verifiedToken = verify(
    token,
    process.env.JWT_SECRET as Secret
  ) as Token;

  return verifiedToken && verifiedToken.userId;
};
