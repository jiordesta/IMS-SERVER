export type RegisterUserData = {
  username: string;
  password: string;
  fname: string;
  lname: string;
};

export type LoginUserData = {
  username: string;
  password: string;
};

export type JwtPayload = {
  id: number;
};
