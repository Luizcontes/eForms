import fs from 'fs';

const pwd = "C:\\Users\\a907441\\Projects\\INCM\\";

export function fileSaver(dir, filename, file) {
  const folder = `${dir}\\`;
  const path = pwd + folder + filename;
  try {
    fs.writeFileSync(path, file);
  }
  catch (err) {
    console.log(err.message);
  }
}

export function fileReader(dir, filename) {
  const folder = `${dir}\\`;
  const path = pwd + folder + filename;
  try {
    return fs.readFileSync(path);
  }
  catch (err) {
    console.log(err.message);
  }
}