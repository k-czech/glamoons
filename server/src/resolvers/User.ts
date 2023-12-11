import {
  IsEmail,
  IsPhoneNumber,
  IsPostalCode,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";
import "reflect-metadata";
import { Field, InputType, Int, ObjectType } from "type-graphql";

@ObjectType()
export class User {
  @Field(() => Int)
  id: number;

  @Field()
  @IsEmail()
  email: string;

  @Field(() => String)
  firstname: string;

  @Field(() => String)
  lastname: string;

  @Field(() => String)
  @MinLength(4, {
    message: "Address must be at least 4 characters long",
  })
  @MaxLength(50)
  addressLine: string;

  @Field(() => String, { nullable: true })
  homeNumber?: string | null;

  @Field(() => String)
  @Matches(/^\d{2}-\d{3}$/, {
    message: "Postal code is not valid",
  })
  postalCode: string;

  @Field(() => String)
  @MinLength(4, {
    message: "City must be at least 4 characters long",
  })
  @MaxLength(50)
  city: string;

  @Field(() => String)
  country: string;

  @Field(() => String)
  @IsPhoneNumber("PL", {
    message: "Invalid phone number",
  })
  phone: string;

  @Field(() => String, { nullable: true })
  @MinLength(4, {
    message: "Company name must be at least 4 characters long",
  })
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

@ObjectType()
export class UserLoginResponse {
  @Field(() => String)
  email: User["email"];

  @Field(() => String)
  firstname: User["firstname"];

  @Field(() => String)
  lastname: User["lastname"];

  @Field(() => String)
  token: string;
}

@InputType()
export class UserUpdateInput {
  @Field(() => Int)
  id: User["id"];

  @Field(() => String, { nullable: true })
  firstname?: User["firstname"];

  @Field(() => String, { nullable: true })
  lastname?: User["lastname"];

  @Field(() => String)
  @MinLength(4, {
    message: "Address must be at least 4 characters long",
  })
  @MaxLength(50)
  addressLine: User["addressLine"];

  @Field(() => String, { nullable: true })
  homeNumber?: User["homeNumber"];

  @Field(() => String)
  @Matches(/^\d{2}-\d{3}$/, {
    message: "Postal code is not valid",
  })
  postalCode: User["postalCode"];

  @Field(() => String)
  @MinLength(4, {
    message: "City must be at least 4 characters long",
  })
  @MaxLength(50)
  city: User["city"];

  @Field(() => String)
  country: User["country"];

  @Field(() => String)
  @IsPhoneNumber("PL", {
    message: "Invalid phone number",
  })
  phone: User["phone"];

  @Field(() => String, { nullable: true })
  @MinLength(4, {
    message: "Company name must be at least 4 characters long",
  })
  companyName?: User["companyName"];

  @Field(() => String, { nullable: true })
  vatNumber?: User["vatNumber"];
}
