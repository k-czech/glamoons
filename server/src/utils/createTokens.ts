import { Secret, sign } from "jsonwebtoken";
import { User } from "../resolvers/User";

export const createTokens = (user: User) => {
  const refreshToken = sign(
    { userId: user.id },
    process.env.JWT_SECRET_REFRESH as Secret,
    {
      expiresIn: "1d",
      algorithm: "HS256",
    }
  );

  const accessToken = sign(
    { userId: user.id },
    process.env.JWT_SECRET as Secret,
    {
      expiresIn: "1h",
      algorithm: "HS256",
    }
  );

  return { refreshToken, accessToken };
};
