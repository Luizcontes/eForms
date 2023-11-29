import fs from 'fs';
const pwd = process.cwd();

// const path = `${pwd}\\teste\\teste.xml`;
// const writePath = `${pwd}\\teste\\testeWrite.xml`;

// const dataStream = fs.readFileSync(path);
// const dataStr = dataStream.toString();

// const resultWithoutReturn = dataStr.replace(/\r\n/g,'');
// const resultWithoutTab = resultWithoutReturn.replace(/\t/g,'');
// const resultWithoutSpace = resultWithoutTab.replace(/\s+\<\//g,'\<\/');
// const resultWithoutSpaceBetween = resultWithoutSpace.replace(/\>\s+\</g,'\>\<');
// // console.log(resultWithoutTab);

// fs.writeFileSync(writePath, resultWithoutSpaceBetween);

const dataPath  =`${pwd}\\report\\report.xml`;
const dataStream = fs.readFileSync(dataPath);
const dataStr = dataStream.toString();

const regex = /<svrl:text>.+<\/svrl:text>/gm;

let errors = {errors: []};
let result;
let counter = 0;
while ((result = regex.exec(dataStr)) !== null) {
  if (counter % 2 === 0) {
    let tmpRes = result[0].replace(/<svrl:text>|<\/svrl:text>/g,'');
    errors.errors.push(tmpRes);
  }
  counter++;
}


console.log(JSON.stringify(errors));