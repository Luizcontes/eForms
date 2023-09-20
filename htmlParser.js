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

let filename;
let xmlGen;
let logObj;

const commands = {
  help: printhelp,
  getcodes: getCodes,
  runTest: testForm,
  findPaths: findPaths,
  findTagLocation: testFunc,
}

const pwd = process.cwd();
const htmlPath = filename => `${pwd}\\eFormHTML\\${filename}.html`;
const codeListPath = filename => `${pwd}\\codeList\\${filename}.json`;
const codeListJson = filename => `${pwd}\\codeJson\\${filename}.json`;

const commandArgumentSplitter = string => string.split("=");

// Every time the scrip gets to a tag that finishes with cbc is possible
// to assemble the 2 final tags together before validation

// Implement script to remove the attributes from tags and insert them into the xml

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
  let start = logObj[element];
  let end = tagArray.length;

  for (let i = start; i < end; i++) {
    logObj[element] = i;
    fileSaver("log", `${filename}.json`, JSON.stringify(logObj));
    let elementArray = tagArray[i];
    console.log("\nElement: <" + element + ">(" + i + "/" + (end - 1) + "): " + elementArray);
    let testar = await rl.question("Testar(s/n)?");
    if (/^n$/g.exec(testar) !== null) process.exit();
    await tagInserter(() => {
      if (element === "fieldset") return true;
      return '';
    }, elementArray);
  }

  rl.close();
}

// verify tagArray numbers: 6, 7, 8

async function tagInserter(getElement, tagArray) {

  const xml = xmlGen.xmlToJson();
  const preprocessor = "preprocessor";
  const sample = "sample";

  let element = getElement();

  try {
    let arrayToTrack = await depthTracker(xml, tagArray);
    if (tagArray.length !== arrayToTrack.length) {
      let tmpArray = [...arrayToTrack];
      let iterator = await getIterator(xml, tmpArray);
      do {
        await waiter();
        let tmpArray = [...arrayToTrack];
        tmpArray.push(tagArray[arrayToTrack.length]);
        let objMapped = await mapObjectRecursively(async (node, tag) => {
          let nodeLength = Object.keys(node).length;
          let iteratorLength = iterator.length;
          let position = nodeLength - iteratorLength;
          return await xmlChangePosition(node, tag, position, element)
        }, xml, tmpArray);
        await xmlGen.setXml(objMapped);
        await xmlGen.xmlSaver(preprocessor);
        if (!iterator.length) break;
        iterator.pop();
      } while (await testForm(filename, preprocessor));
      await tagInserter(getElement, tagArray);
    }
    await xmlGen.xmlSaver(sample);
  }
  catch (err) {
    console.log(err.message);
    console.log(logObj);
    xmlGen = new XmlDocGenerator(filename);
    return;
  }
}

async function waiter() {
  return new Promise(resolve => setTimeout(resolve, 1000));
}

async function getIterator(xml, endTag) {
  let tag = endTag.shift();
  let keys = Object.keys(xml);
  if (tag === undefined) return keys;
  keys = await getIterator(xml[tag][0], endTag);
  return keys;
}

async function depthTracker(node, tagArray, finalArray) {
  finalArray = finalArray || [];
  let tmpArray = [...tagArray]
  let tag = tmpArray.shift();
  let keysArray = Object.keys(node);
  if (keysArray.includes(tag)) {
    if (Array.isArray(node[tag])) {
      let nextNode = node[tag]['0'];
      await depthTracker(nextNode, tmpArray, finalArray);
    }
    finalArray.unshift(tag);
  }
  return finalArray;
}

async function mapObjectRecursively(callback, obj, tagArray) {
  if (tagArray.length === 1 && !Array.isArray(obj)) {
    let tag = tagArray.shift();
    obj = await callback(obj, tag);
  }
  if (Array.isArray(obj)) {
    let newArray = [];
    for (let index in obj) {
      // insert the logic for nested tags in here !!!
      if (typeof obj[index] === "object") {
        newArray.push(await mapObjectRecursively(callback, obj[index], tagArray));
      }
      else {
        if (tagArray.length === 1 && Array.isArray(obj)) {
          let tag = tagArray.shift();
          newArray[index] = { [tag]: [''] };
        } else {
          newArray[index] = obj[index];
        }
      }
    }
    return newArray;
  } else {
    let newObj = {};
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (key === tagArray[0]) tagArray.shift();
        if (typeof obj[key] === "object") {
          newObj[key] = await mapObjectRecursively(callback, obj[key], tagArray);
        }
        else {
          newObj[key] = obj[key];
        }
      }
    }
    return newObj;
  }
}

async function xmlChangePosition(node, tag, position, v) {
  let tmpObj = {};
  let value = [''];
  Object.keys(node).forEach((key, i) => {
    if (position === i) tmpObj[tag] = value;
    tmpObj[key] = node[key];
    if (Object.keys(tmpObj).length === position) tmpObj[tag] = value;
  });
  return tmpObj;
}

// function nodeFinder(xml, tagArray, currentTag) {

//   if (currentTag === undefined) return xml;
//   let currentTagIndex = tagArray.indexOf(currentTag);
//   let tmpNode = xml;

//   tagArray.forEach((tag, index) =>
//     tmpNode = index < currentTagIndex ? tmpNode[tag] : tmpNode
//   );
// }

// async function tagLocator(xml, tagArray, currentTag) {

//   let node = xml;
//   let currentTagIndex = tagArray.indexOf(currentTag);
//   // if (currentTag !== undefined) {
//   //   tagArray.forEach((tag, index) => {
//   //     node = index < currentTagIndex ? node[tag] : node
//   //   });
//   // }

//   let tag = currentTag || tagArray[0];

//   try {
//     if (node[tag] === undefined) {
//       if (Object.hasOwn(node, '0')) node = node['0'];
//       let iterations = Object.keys(node);
//       for (let i = 0; i <= iterations.length; i++) {
//         xmlGen.xmlChangePosition(node, tagArray, tag, i);
//         // xmlGen.xmlSaver("preprocessor");
//       }
//       // let validForm = await testForm(filename, "preprocessor");
//       if (validForm) {
//         // xmlGen.xmlSaver("sample");
//         console.log("Tag validated successfully!!!");
//         return
//       }
//     }
//     else if (tagArray.length > 0) {
//       let nextTagIndex = tagArray.indexOf(tag) + 1;
//       let nextTag = tagArray[nextTagIndex];
//       await tagLocator(xml[tag], tagArray, nextTag);
//     }
//     else {
//       console.log("This tag exists alredy");
//       console.log("-------");
//       console.log("");
//       return
//     }
//     // console.log("alteredXml: " + alteredXml);
//   }
//   catch (err) {
//     console.log(err);
//   }
// }

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

(function argsRunner() {
  const args = process.argv.slice(2);
  args.filter(el => {
    if (el.match("filename")) {
      filename = commandArgumentSplitter(el)[1];
      xmlGen = new XmlDocGenerator(filename);
      let logBuffer = fileReader("log", `${filename}.json`);
      let logStr = logBuffer.toString();
      logObj = JSON.parse(logStr);
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
        commands[command](arg);
      }
    })
}());
