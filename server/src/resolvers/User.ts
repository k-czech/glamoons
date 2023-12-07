import {
  IsEmail,
  IsPostalCode,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";
import "reflect-metadata";
import { Field, Int, ObjectType } from "type-graphql";

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
  @IsPostalCode()
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
  @Matches(/^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/, {
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
