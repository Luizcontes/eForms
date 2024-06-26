import { v4 as uuid } from 'uuid';
import fs from 'fs';
import FormData from 'form-data';
import axios from 'axios';

import xml2js from 'xml2js';
const parseString = xml2js.parseString;
const builder = new xml2js.Builder();

const pwd = process.cwd();

const args = process.argv[2];
const line = process.argv[3];

export async function testForm(filename, folder) {

  const dir = folder || "sample\\";
  const readData = `${pwd}\\` + dir + "\\" + filename + ".xml";
  const output = `${pwd}\\output\\` + filename + "Output.xml";
  const report = `${pwd}\\report\\report.xml`;
  const errors = `${pwd}\\report\\errors.xml`;

  const XMLData = fs.readFileSync(readData);
  const date = new Date(Date.now());
  const year = date.getFullYear();

  const day = () => {
    let d = date.getDate();
    if (d < 10) {
      return `0${d}`
    }
    return d
  };

  const month = () => {
    let d = date.getMonth() + 1;
    if (d < 10) {
      return `0${d}`
    }
    return d
  };
  const hour = () => {
    let h = date.getHours() - 1;
    if (h < 10) {
      return `0${h}`
    }
    return h
  };

  const fullDate = `${year}-${month()}-${day()}+01:00`;
  const fullHour = `${hour()}:00:00+01:00`;

  parseString(XMLData, (err, xmlObj) => {

    try {
      if (xmlObj === undefined) throw "Cannot parse XML, wrong format";

      let contractType = Object.keys(xmlObj)[0];

      let noticeId = xmlObj[contractType]['cbc:ID'];
      if (noticeId) noticeId[0]._ = uuid();

      // xmlObj[contractType]['cbc:IssueDate'][0] = fullDate;
      // xmlObj[contractType]['cbc:IssueTime'][0] = fullHour;

      let xml = builder.buildObject(xmlObj)
      fs.writeFileSync(output, xml);
    }
    catch (err) {
      console.log(err);
      process.exit();
    }
  })

  const form = new FormData();
  form.append('metadata', '{"noticeAuthorEmail":"john@doe.com","noticeAuthorLocale": "pt"}');
  form.append('notice', fs.createReadStream(output));

  return await axios({
    method: 'post',
    url: 'https://enotices2.preview.ted.europa.eu/esenders/api/v2/notice/notices/submit',
    data: form,
    headers: {
      Authorization: "Bearer e0e31bf3087d4cbd936c72fe7f12af89"
    }
  }).then(res => res.data)
    .then(async data => {
      if (data.success === false) {
        // console.log("before timer!!!" + new Date(Date.now()));
        // await timer();
        // console.log("after timer!!!" + new Date(Date.now()));
        await axios({
          method: 'get',
          url: data.validationReportUrl,
          headers: {
            Authorization: "Bearer e0e31bf3087d4cbd936c72fe7f12af89"
          }
        })
          .then(res => {
            fs.writeFileSync(report, res.data)

            const XMLReport = res.data;
            parseString(XMLReport, (err, result) => {

              delete result['svrl:schematron-output']['svrl:active-pattern'];
              delete result['svrl:schematron-output']['svrl:fired-rule'];
              delete result['svrl:schematron-output']['svrl:ns-prefix-in-attribute-values'];
              delete result['svrl:schematron-output']['$'];

              console.log("Errors: " + result['svrl:schematron-output']['svrl:failed-assert'].length)
              Object.keys(result['svrl:schematron-output']['svrl:failed-assert']).forEach((key, i) => {
                // if (i < 5) {
                console.log("\nError " + (i + 1));
                console.log(result['svrl:schematron-output']['svrl:failed-assert'][key]['$'].location);
                console.log(result['svrl:schematron-output']['svrl:failed-assert'][key]['$'].test);
                console.log("---------------------------------\n");
                // }
              });
              let fail = builder.buildObject(result);
              fs.writeFileSync(errors, fail);
            });
          })
        console.log("VALIDATED!!!!!!");
        console.log("---------------");
        return false;
      } else {
        if (fs.existsSync(report)) fs.unlinkSync(report);
        if (fs.existsSync(errors)) fs.unlinkSync(errors);
        console.log("Congrats you rock!!!!");
        return false;
      }
    })
    .catch(err => {
      let error = err.response.data.message;
      let regex = /\[.*\]/g;
      let r = regex.exec(error);
      try {
        let errorsJson = JSON.parse(r[0]);
        errorsJson.forEach((e, i, array) => {
          e.num = i + 1;
          e.line += 7;
          if (line !== undefined && i === (line - 1)) {
            console.log(e);
            console.log(`Total de erros: ${array.length}`);
          }
          if (line === undefined)
            console.log(e);
        });
      }
      catch (e) {
        console.log(err.response.data);
      }

      return true;
    });
}

testForm(args);

// async function timer() {
//   return new Promise(resolve => setTimeout(resolve, 5000));
// }
