import { promises as fs } from "fs";

export const removeFile = async (data: string | string[]): Promise<void> => {
  try {
    const files = Array.isArray(data) ? data : [data];

    for (const file of files) {
      const filepath = `./uploads/${file}`;
      try {
        await fs.unlink(filepath);
      } catch (err: any) {
        console.error(`Error deleting file ${filepath}:`, err.message);
      }
    }
  } catch (err) {
    console.error("Unexpected error in removeFile:", err);
  }
};
