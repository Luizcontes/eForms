import fs from 'fs';
import { json2csv } from 'json-2-csv';
import xml2js from 'xml2js';
const parseString = xml2js.parseString;
const builder = new xml2js.Builder({ renderOpts: { 'pretty': true, 'indent': '  ', 'newline': '\n', allowEmpty: true } });

const pwd = process.cwd();

const dataPath = `${pwd}\\listas\\eu-programme.xml`;
const dataOutputPath = `${pwd}\\listas\\eu-programme.csv`;
const dataStream = fs.readFileSync(dataPath);

parseString(dataStream, async (err, xmlObj) => {

  const data = xmlObj['gc:CodeList'];
  delete data.$
  delete data.ColumnSet
  delete data.Identification

  const csvObj = [];
  data.SimpleCodeList[0].Row.forEach((v, i) => {
      let tmpObj = {}
      v.Value.forEach(d => {
        if (d.$.ColumnRef === 'code') tmpObj['DataValue'] = d.SimpleValue[0];
        if (d.$.ColumnRef === 'Name') tmpObj['NameEN'] = d.SimpleValue[0];
        if (d.$.ColumnRef === 'por_label') tmpObj['NamePT'] = d.SimpleValue[0];
      })
      csvObj.push(tmpObj);
  });

  let csv = await json2csv(csvObj);
  fs.writeFileSync(dataOutputPath, csv);
});

