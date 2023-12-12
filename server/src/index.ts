import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import * as tq from "type-graphql";
import { Context, context } from "./context";
import { AuthResolver } from "./resolvers/auth/AuthResolver";
import { UserResolver } from "./resolvers/user/UserResolver";
import { CustomAuthChecker } from "./auth/custom-auth-checker";

const app = async () => {
  const schema = await tq.buildSchema({
    resolvers: [UserResolver, AuthResolver],
    scalarsMap: [],
    validate: { forbidUnknownValues: false },
    authChecker: CustomAuthChecker,
  });

  const server = new ApolloServer<Context>({ schema });

  const { url } = await startStandaloneServer(server, {
    context: context,
    listen: { port: 4000 },
  });

  console.log(`🚀  Server ready at: ${url}`);
};

app();
