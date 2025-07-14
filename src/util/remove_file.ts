import { promises as fs } from "fs";

export const removeFile = async (data: string | string[]): Promise<void> => {
  try {
    const files = Array.isArray(data) ? data : [data];

    for (const file of files) {
      const filepath = `./uploads/${file}`;
      try {
        await fs.unlink(filepath);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(`Error deleting file ${filepath}:`, errorMessage);
      }
    }
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("Unexpected error in removeFile:", errorMessage);
  }
};
