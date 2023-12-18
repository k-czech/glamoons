import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import * as tq from "type-graphql";
import { Context, context } from "./context";
import { AuthResolver } from "./resolvers/auth/AuthResolver";
import { UserResolver } from "./resolvers/user/UserResolver";
import { CustomAuthChecker } from "./auth/custom-auth-checker";
import jwt, { Secret } from "jsonwebtoken";

const app = async () => {
  const schema = await tq.buildSchema({
    resolvers: [UserResolver, AuthResolver],
    scalarsMap: [],
    validate: { forbidUnknownValues: false },
    authChecker: CustomAuthChecker,
  });

  const setHttpPlugin = {
    async requestDidStart() {
      const refreshToken = jwt.sign({}, process.env.JWT_SECRET as Secret, {
        expiresIn: "24h",
        algorithm: "HS256",
      });
      const tokenExpireDate = new Date();
      tokenExpireDate.setDate(tokenExpireDate.getDate() + 1);
      return {
        async willSendResponse({ response }: { response: any }) {
          response.http.headers.set(
            "Set-Cookie",
            `refreshToken=${refreshToken}; expires=${tokenExpireDate}`
          );
        },
      };
    },
  };

  const server = new ApolloServer<Context>({
    schema,
    plugins: [setHttpPlugin],
  });

  const { url } = await startStandaloneServer(server, {
    context: context,
    listen: { port: 4000 },
  });

  console.log(`🚀  Server ready at: ${url}`);
};

app();
