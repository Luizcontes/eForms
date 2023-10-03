import { fileReader } from "./fileSystemManager.js";

const args = process.argv.slice(2);

const formExample = fileReader("codeList", args[0]);
const formToCompare = fileReader("codeList", args[1]);

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

let t = fieldCompartor(formExample, formToCompare);

console.log(t);
