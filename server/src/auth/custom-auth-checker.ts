import { GraphQLError } from "graphql";
import { type Context } from "../context";
import { getVerifiedToken } from "../utils/getVerifiedToken";
import { AuthCheckerInterface, ResolverData } from "type-graphql";

export class CustomAuthChecker implements AuthCheckerInterface<Context> {
  check(
    resolverData: ResolverData<Context>,
    _roles: string[]
  ): boolean | Promise<boolean> {
    const userId = getVerifiedToken(resolverData.context);
    const user = resolverData.context.prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new GraphQLError("User is not authenticated", {
        extensions: {
          code: "UNAUTHENTICATED",
          http: { status: 401 },
        },
      });
    }

    return user !== null;
  }
}
