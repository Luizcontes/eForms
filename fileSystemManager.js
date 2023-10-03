import fs from 'fs';

const pwd = process.cwd();

export function fileSaver(dir, filename, file) {
  const path = `${pwd}\\${dir}\\${filename}`;
  try {
    fs.writeFileSync(path, file);
  }
  catch (err) {
    console.log(err.message);
  }
}

export function fileReader(dir, filename) {
  const path = `${pwd}\\${dir}\\${filename}`;
  try {
    if (!fs.existsSync(path)) throw new Error("fileManager: File not not found...");
    const fileBuffer = fs.readFileSync(path);
    const fileString = fileBuffer.toString();
    return JSON.parse(fileString);
  }
  catch (err) {
    console.log(path);
    console.log(err.message);
    process.exit();
  }
}