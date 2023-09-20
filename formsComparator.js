import { fileReader } from "./fileSystemManager.js";

// import * as readline from 'node:readline/promises';
// import { stdin as input, stdout as output } from 'node:process';
// const rl = readline.createInterface({ input, output });

const form16Buffer = fileReader("codeList", "form16.json");
const form16Str = form16Buffer.toString();
const form16Json = JSON.parse(form16Str);
const form29Buffer = fileReader("codeList", "form29.json");
const form29Str = form29Buffer.toString();
const form29Json = JSON.parse(form29Str);

function fieldCompartor(baseForm, newForm) {
  const baseFormArray = arrayFlatter(baseForm);
  const newFormArray = arrayFlatter(newForm);
  return baseFormArray.filter(code => !newFormArray.includes(code));
}

function arrayFlatter(obj) {
  return Object.keys(obj)
    .filter(element => typeof obj[element] === 'object')
    .reduce((acum, el) => acum.concat(obj[el]['codes']), []);
}

// function pathArray(filename) {

//   const data = fileReader("codeJson", filename);

//   try {

//     const stringData = data.toString();
//     const jsonData = JSON.parse(stringData);

//     // const regex = /[^\[\(][a-z]{3,5}:[a-zA-Z]*[^\)\/](@[a-zA-Z='-]*\])?/g;
//     const regex = /\w{3,5}:\w+(\[.*?\])?/g;

//     function removeSubString(tmpStr) {
//       let results = [];
//       let result;
//       while ((result = regex.exec(tmpStr)) !== null) {
//         result = result[0].slice(0);
//         let lastChar = result.length - 1;
//         let squareBracket = result.charAt(lastChar);
//         if (squareBracket === '[') result = result.slice(0, lastChar);
//         results.push(result);
//       }
//       return results;
//     }

//     return jsonData.map(e => removeSubString(e.xpathAbsolute));
//   }
//   catch (err) {
//     console.log(err.message);
//   }
// }

// async function teste() {
//   const arrElemt = Object.keys(form16Json)
//     .filter(element => typeof form16Json[element] === 'object');

//   for (let el of arrElemt) {
//     const t = pathArray(`form16-json-${el}.json`);
//     console.log(el);
//     t.forEach((a, i) => { console.log(i); console.log(a) });
//     console.log("<-------------------------------------------------------->");
//     await rl.question('Press enter to see the next...');
//   }
//   rl.close();
// }

let t = fieldCompartor(form16Json, form29Json);

console.log(t);
