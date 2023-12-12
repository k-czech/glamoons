import { IsEmail, IsPhoneNumber } from "class-validator";
import "reflect-metadata";
import { Field, InputType, ObjectType } from "type-graphql";

@ObjectType()
export class User {
  @Field(() => String)
  id: string;

  @Field()
  @IsEmail()
  email: string;

  @Field(() => String)
  firstname: string;

  @Field(() => String)
  lastname: string;

  @Field(() => String, { nullable: true })
  @IsPhoneNumber("PL", {
    message: "Invalid phone number",
  })
  phone?: string;

  @Field(() => Boolean, { defaultValue: true })
  is_active?: boolean;

  @Field(() => Date)
  created_date?: Date;

  @Field(() => Date)
  updated_date?: Date;
}

@InputType()
export class UserUpdateInput {
  @Field(() => String)
  id: User["id"];

  @Field(() => String, { nullable: true })
  firstname: User["firstname"];

  @Field(() => String, { nullable: true })
  lastname: User["lastname"];

  @Field(() => String)
  @IsEmail()
  email: User["email"];

  @Field(() => String)
  @IsPhoneNumber("PL", {
    message: "Invalid phone number",
  })
  phone: User["phone"];
}
