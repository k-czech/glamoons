import { IncomingMessage } from "http";

export enum UserTypes {
  Admin = "ADMIN",
  Customer = "CUSTOMER",
}

export interface IUserFromReq {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  isActive: boolean;
}

export interface IRequestWithUser extends IncomingMessage {
  user?: IUserFromReq;
}
