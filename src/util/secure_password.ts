import crypto from "crypto";

const algorithm = (process.env.ALGORITHM as string) || "aes-256-cbc";

// generate 16 bytes of random data
const initVector = process.env.INITVECTOR as string;

// secret key generate 32 bytes of random data
const securityKey = process.env.SECURITYKEY as string;

export const securePassword = async (password: string) => {
  const cipher = await crypto.createCipheriv(
    algorithm,
    securityKey,
    initVector,
  );
  let encryptedData = await cipher.update(password, "utf-8", "hex");

  encryptedData += await cipher.final("hex");

  return encryptedData;
};

export const comparePassword = async (password: string, dbPassword: string) => {
  const originalPwd = await decryptPassword(dbPassword);

  if (originalPwd == password) {
    return true;
  } else {
    return false;
  }
};

export const decryptPassword = async (password: string) => {
  const decipher = crypto.createDecipheriv(algorithm, securityKey, initVector);
  let decryptedData = decipher.update(password, "hex", "utf-8");

  decryptedData += decipher.final("utf8");

  return decryptedData;
};
