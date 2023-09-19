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
    return fs.readFileSync(path);
  }
  catch (err) {
    console.log(err.message);
  }
}