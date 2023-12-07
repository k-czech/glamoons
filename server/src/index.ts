import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import * as tq from "type-graphql";
import { Context, context } from "./context";
import { UserResolver } from "./resolvers/user/UserResolver";
import { AuthResolver } from "./resolvers/auth/AuthResolver";

const app = async () => {
  const schema = await tq.buildSchema({
    resolvers: [UserResolver, AuthResolver],
    scalarsMap: [],
    validate: { forbidUnknownValues: false },
  });

  const server = new ApolloServer<Context>({ schema });

  const { url } = await startStandaloneServer(server, {
    context: async () => context,
    listen: { port: 4000 },
  });

  console.log(`🚀  Server ready at: ${url}`);
};

app();
