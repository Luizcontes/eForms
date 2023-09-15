import fs from 'fs';

import xml2js from 'xml2js';
const parseString = xml2js.parseString;
const builder = new xml2js.Builder();

const filename = process.argv.slice(2)[0];

const readData = "C:\\Users\\a907441\\Projects\\INCM\\sample\\" + filename + ".xml";
const XMLData = fs.readFileSync(readData);

parseString(XMLData, (err, xmlObj) => {

  try {
    if (xmlObj === undefined) throw "Cannot parse XML, wrong format";

    let contractType = Object.keys(xmlObj)[0];
    let xmlDoc = xmlObj[contractType];

    console.log(xmlDoc);

    // let xml = builder.buildObject(xmlObj)
    // fs.writeFileSync(output, xml);
  }
  catch (err) {
    console.log(err);
    process.exit();
  }
});