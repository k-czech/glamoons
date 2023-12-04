import "reflect-metadata";
import { ObjectType, Field, ID } from "type-graphql";
import { IsEmail } from "class-validator";

@ObjectType()
export class User {
  @Field(() => ID)
  id: number;

  @Field()
  @IsEmail()
  email: string;

  @Field(() => String, { nullable: true })
  firstname?: string | null;

  @Field(() => String, { nullable: true })
  lastname?: string | null;

  @Field(() => String, { nullable: true })
  addressLine?: string | null;

  @Field(() => String, { nullable: true })
  homeNumber?: string | null;

  @Field(() => String, { nullable: true })
  postalCode?: string | null;

  @Field(() => String, { nullable: true })
  city?: string | null;

  @Field(() => String)
  country: string;

  @Field(() => String, { nullable: true })
  phone?: string | null;

  @Field(() => String, { nullable: true })
  companyName?: string | null;

  @Field(() => String, { nullable: true })
  vatNumber?: string | null;

  @Field(() => Boolean)
  isActive?: boolean;

  @Field(() => Date)
  createdDate?: Date;

  @Field(() => Date)
  updatedDate?: Date;
}
