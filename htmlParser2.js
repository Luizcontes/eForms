import fs from 'fs';
import { testForm } from './request.js';
import { printhelp } from './helpInfo.js';
import { fieldFinder } from './fieldFinder.js';
import { pathArray } from './tagCreator.js';
import { fileReader, fileSaver } from './fileSystemManager.js';
import XmlDocGenerator from './xmlDocGenerator.js';
import jsdom from 'jsdom';
const { JSDOM } = jsdom;

import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
const rl = readline.createInterface({ input, output });

const preprocessor = "preprocessor";
const sample = "sample";
let filename;
let xmlGen;
let logObj;

const commands = {
  help: printhelp,
  getcodes: getCodes,
  runTest: testForm,
  findPaths: findPaths,
  findTagLocation: testFunc,
  preprocessorSaver: preprocessorSaver,
}

const pwd = process.cwd();
const htmlPath = filename => `${pwd}\\eFormHTML\\${filename}.html`;
const codeListPath = filename => `${pwd}\\codeList\\${filename}.json`;
const codeListJson = filename => `${pwd}\\codeJson\\${filename}.json`;

const commandArgumentSplitter = string => string.split("=");

async function testFunc(filename) {

  const tagObject = await pathArray(filename);

  console.log('What element would you like to interact with? ')
  let counter = 1;
  for (const element in tagObject) {
    console.log(`${counter} - ${element}`);
    counter++;
  }
  console.log("s - sair");
  let input = await rl.question("Your choice: ");
  let option = /^[1-4]$|^s$/g.exec(input);
  if (!option || option[0] === 's') process.exit();
  option = option - 1;

  const elements = Object.keys(tagObject);
  const element = elements[option];
  const tagArray = tagObject[element];

  // sample example of tags to test
  // let start = logObj[element];
  let start = 0;
  let end = tagArray.length;

  for (let i = start; i < end; i++) {
    let elementsArray = tagArray[i];
    console.log("\nElement: <" + element + ">(" + i + "/" + (end - 1) + "): " + elementsArray);
    let testar = await rl.question("Testar(s/n)?");
    if (/^n$/g.exec(testar) !== null) process.exit();
    xmlGen = new XmlDocGenerator(filename);

    try {
      let tagInserted = await tagInserter(elementsArray);

      // if (tagInserted) await xmlGen.xmlSaver(sample);
      // else console.log("\nTag ja existente!!!");
      // if (i < (tagArray.length - 1)) logObj[element] = i + 1;
      // fileSaver("log", `${filename}.json`, JSON.stringify(logObj));
    }
    catch (err) {
      console.log("\nElement: <" + element + ">(" + i + "/" + (end - 1) + "): " + elementsArray);
      console.log(err.message);

      let keep = await rl.question("Continuar algo(s/n)?");
      if (/^n$/g.exec(keep) !== null) process.exit();

      xmlGen = new XmlDocGenerator(filename);
      continue;
    }
  }
}

function iteratorTester() {
  return false;
}

async function tagInserter(elementsArray) {

  const xml = xmlGen.xmlToJson();
  const elArrayCopy = [...elementsArray];
  let tag = null;
  let currentTag = null;

  do {
    let objMapped = await mapObjectRecursively(
      tagOrderer(elArrayCopy, tag, currentTag), xml);
    console.log("Aqui");

  } while (iteratorTester());
  // after inserting the tag the array with tags to be inserted
  // can be passed again through recursion so the process keep going
}

function tagOrderer(elArrayCopy, tag, currentTag) {
  return function (obj, key) {

    let shifter = elArrayCopy[0];
    const tagWanted = tagExtractor(shifter);

    let keys = Object.keys(obj);
    let iterator = keys.length;

    if (keys.includes(tagWanted) && tag === null) {
      tag = tagExtractor(elArrayCopy.shift());
    } else {
      // logic to be included!!!!
    }

    if (currentTag !== null && !Array.isArray(obj)) {
      return xmlChangePosition(obj, tagWanted, iterator);
    }

    if (key === tag) {
      currentTag = key;
    }
    return obj;
  }
}

// This function changes tag`s position accordingly to the position variable
function xmlChangePosition(node, tag, position, v) {
  let tmpObj = {};
  let value = v || [''];
  Object.keys(node).forEach((key, i) => {
    if (position === i) tmpObj[tag] = value;
    tmpObj[key] = node[key];
    if (Object.keys(tmpObj).length === position) tmpObj[tag] = value;
  });
  return tmpObj;
}

// How do I make this function as most abstract and useful as possible
// The only task performed by this function is to iterate over the object tree
async function mapObjectRecursively(callback, obj) {

  let newObj = {};
  // Before iterating over the object, the tag should be included first
  obj = callback(obj, key);
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (typeof obj[key] === "object") {
        newObj[key] = await mapObjectRecursively(callback, obj[key]);
      }
      else {
        newObj[key] = obj[key];
      }
    }
  }
  return newObj;
}

// function returnRightSiblingTag(obj, attr) {
//   let subTag = attr[0];
//   let attribute = attr[1];
//   let value = attr[2];
//   for (let i of obj) {
//     if (Object.keys(i).includes(subTag)) {
//       console.log("Aqui!!!");
//     }
//   }
//   return false;
// }

// Function to extract the tags every time an attribute is mentioned
function tagExtractor(string) {
  let index = attributeIndexFinder(string);
  if (index === null) return string;
  return string.slice(0, index);
}

function attributeExtractor(string) {
  let index = attributeIndexFinder(string);
  if (index === null) return null;

  let attrRule = string.slice(index);

  let subTag = (/\w{3,5}:\w+/g).exec(attrRule)[0];
  let attr = (/@\w+=/g).exec(attrRule)[0].slice(1, -1);
  let val = (/'\w+'/g).exec(attrRule)[0].slice(1, -1);

  return [subTag, attr, val];
}

function attributeIndexFinder(string) {
  let param = (/\[.*\]/g).exec(string);
  if (param !== null) return param.index;
  return null;
}

async function getCodes() {

  const elementsArray = ['fieldset', 'input', 'select', 'textarea'];

  try {
    const htmlFile = fs.readFileSync(htmlPath(filename));
    const dom = new JSDOM(htmlFile);


    const codeList = {};
    elementsArray.forEach(element => {

      const selectDataContentId = dom.window.document.querySelectorAll(element);
      codeList[element] = { codes: [] };

      selectDataContentId.forEach((el, i, a) => {
        let code = el.dataset.contentId;
        if (code !== undefined) codeList[element].codes.push(code);
      })
      if (codeList.totalElementsCount === undefined) codeList.totalElementsCount = codeList[element].codes.length;
      else codeList.totalElementsCount = codeList.totalElementsCount + codeList[element].codes.length;
      codeList[element].elementsCount = codeList[element].codes.length;
    });

    fs.writeFileSync(codeListPath(filename), JSON.stringify(codeList));
  }
  catch (err) {
    console.log(err.message);
  }
}

function findPaths(formName) {

  let name = formName || filename;

  try {
    const codeData = fs.readFileSync(codeListPath(name));
    const codesString = codeData.toString();
    const codesJson = JSON.parse(codesString);

    const t = Object.keys(codesJson)
      .filter(e => typeof codesJson[e] === 'object')
      .reduce((acum, e) => {
        const codesList = codesJson[e]['codes'];
        const codesDescArray = codesList.map(c => fieldFinder(c));
        acum[e] = codesDescArray;
        return acum;
      }, {});

    fs.writeFileSync(codeListJson(filename), JSON.stringify(t));
  }
  catch (err) { console.log("findPath: " + err.message) }
}

function preprocessorSaver() {
  const preprocessorPath = `${pwd}\\${preprocessor}\\${filename}.xml`;
  const preprocessorBuffer = fs.readFileSync(preprocessorPath);

  const samplePath = `${pwd}\\${sample}\\${filename}.xml`;
  fs.writeFileSync(samplePath, preprocessorBuffer);
}

(function argsRunner() {
  const args = process.argv.slice(2);
  args.filter(el => {
    if (el.match("filename")) {
      filename = commandArgumentSplitter(el)[1];
      // let logBuffer = fileReader("log", `${filename}.json`);
      // let logStr = logBuffer.toString();
      // logObj = JSON.parse(logStr);
      return false;
    }
    return true;
  })
    .forEach(async el => {
      const comAtrrArray = commandArgumentSplitter(el);
      const command = comAtrrArray[0];
      let arg = comAtrrArray[1];
      if (commands[command]) {
        if (arg === undefined) arg = filename;
        await commands[command](arg);
        rl.close();
      }
    })
}());
