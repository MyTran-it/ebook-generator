import { exec } from "child_process";
import { promisify } from "util";
import { METADATA } from "./cts.js";

const execAsync = promisify(exec);

export async function convertToEpub(destPath) {
  let args = [];
  for (const [key, value] of Object.entries(METADATA)) {
    args.push(key, value);
  }

  args.unshift(`"${destPath}index.xhtml"`, `"${destPath}newBook.epub"`); // Input and output files always first
  args.push("--cover", `"${destPath}cover.jpeg"`);

  return await executeCommand(args);
}

async function executeCommand(args) {
  const cmd = `ebook-convert ${args.join(" ")}`;

  try {
    const { stdout, stderr } = await execAsync(cmd);
    console.log('Success:', stdout);
    if (stderr) console.warn('Warnings:', stderr);
    return { success: true };
  } catch (error) {
    console.error('Error:', error.stderr || error.message);
    return { success: false, error: error.stderr };
  }
}