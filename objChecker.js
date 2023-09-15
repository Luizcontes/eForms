const fs = require('fs');

const xml2js = require('xml2js');
const parseString = xml2js.parseString;
const builder = new xml2js.Builder();

const filename = process.argv.slice(2)[0];
const readData = "C:\\Users\\a907441\\Projects\\INCM\\sample\\" + filename + ".xml";

const XMLData = fs.readFileSync(readData);

// console.log(XMLData.toString());

let xmlObj;
parseString(XMLData, (err, result) => {
  xmlObj = result;
});

console.log(xmlObj);