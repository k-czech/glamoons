import { IsEmail, IsPhoneNumber, Matches, MinLength } from "class-validator";
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
export class UserCreateInput {
  @Field(() => String)
  firstname: User["firstname"];

  @Field(() => String)
  lastname: User["lastname"];

  @Field(() => String)
  email: User["email"];

  @Field(() => String!)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])/, {
    message:
      "Password must contain at least one letter, one number and one special character",
  })
  @MinLength(6, {
    message: "Password must be at least 6 characters long",
  })
  password: string;
}

@InputType()
export class UserLoginInput {
  @Field(() => String)
  email: User["email"];

  @Field(() => String!)
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])/, {
    message:
      "Password must contain at least one letter, one number and one special character",
  })
  @MinLength(6, {
    message: "Password must be at least 6 characters long",
  })
  password: string;
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
