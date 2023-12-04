import bcrypt from "bcrypt";

export const hashPassword = async (password: string) => {
  const saltRounds = 16;
  const hash = await bcrypt.hash(password, saltRounds);

  return {
    hash,
  };
};

export const verifyPassword = ({
  password,
  hash,
}: {
  password: string;
  hash: string;
}) => {
  const canditateHash = bcrypt.compareSync(password, hash);

  return canditateHash;
};
