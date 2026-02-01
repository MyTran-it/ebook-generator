import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function convertToEpub(destPath, METADATA) {
  console.log('?', destPath)
  let args = [];
  args.push(`"${destPath}index.xhtml"`, `"${destPath}newBook.epub"`); // Input and output files always first
  
  for (const [key, value] of Object.entries(METADATA)) {
    args.push(key, `"${value}"`);
  }

  args.push("--cover", `"${destPath}cover.jpeg"`);
  args.push("--toc-threshold", '"0"', "--language", '"vi"');

  return await executeCommand(args);
}

async function executeCommand(args) {
  const cmd = `ebook-convert ${args.join(" ")}`;

  console.log("Executing command:", cmd);

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