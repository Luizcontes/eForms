import fs from 'fs';
import { testForm } from './request.js';
import { printhelp } from './helpInfo.js';
import { fieldFinder } from './fieldFinder.js';
import { pathArray } from './tagCreator.js';
import XmlDocGenerator from './xmlDocGenerator.js';
import jsdom from 'jsdom';
const { JSDOM } = jsdom;

// import readline from 'readline';
// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout
// });
// async function prompt(query) {
//   new Promise((resolve) => rl.question(query, resolve));
// }

const date = () => (new Date(Date.now()));

let filename;
let xmlGen;

const commands = {
  help: printhelp,
  getcodes: getCodes,
  runTest: testForm,
  findPaths: findPaths,
  findTagLocation: testFunc,
}

const dataPath = filename => "C:\\Users\\a907441\\Projects\\INCM\\eFormHTML\\" + filename + ".html";
const codeListPath = (filename, element) => "C:\\Users\\a907441\\Projects\\INCM\\elementsCode\\" + filename + "-code-" + element + ".json";
const codeListJson = (filename, element) => "C:\\Users\\a907441\\Projects\\INCM\\codeJson\\" + filename + "-json-" + element + ".json";

const commandArgumentSplitter = string => string.split("=");

// Every time the scrip gets to a tag that finishes with cbc is possible
// to assemble the 2 final tags together before validation

// Implement script to remove the attributes from tags and insert them into the xml

async function testFunc(filename) {

  const tagArray = pathArray(filename);

  // sample example of tags to test
  // Last problem found number 71 - select
  // Last problem found number 46 - textarea
  let start = 73;
  let end = tagArray.length;
  let tagSetOfRules = tagArray;

  for (let i = start; i < end; i++) {
    let tagArray = tagSetOfRules[i];
    console.log("Working branch(" + i + "): " + tagArray);
    await tagInserter(tagArray);
  }
}

// verify tagArray numbers: 6, 7, 8

async function tagInserter(tagArray) {

  const xml = xmlGen.xmlToJson();
  const preprocessor = "preprocessor";
  const sample = "sample";

  try {
    let arrayToTrack = await depthTracker(xml, tagArray);
    if (tagArray.length !== arrayToTrack.length) {
      let tmpArray = [...arrayToTrack];
      let iterator = await getIterator(xml, tmpArray);
      do {
        let tmpArray = [...arrayToTrack];
        tmpArray.push(tagArray[arrayToTrack.length]);
        let objMapped = await mapObjectRecursively(async (node, tag) => {
          let nodeLength = Object.keys(node).length;
          let iteratorLength = iterator.length;
          let position = nodeLength - iteratorLength;
          return await xmlChangePosition(node, tag, position)
        }, xml, tmpArray);
        iterator.pop();
        await xmlGen.setXml(objMapped);
        await xmlGen.xmlSaver(preprocessor);
      } while (await testForm(filename, preprocessor));
      await xmlGen.xmlSaver(sample);
      await tagInserter(tagArray);
    }
  }
  catch (err) {
    console.log(err.message);
    xmlGen = new XmlDocGenerator(filename);
    return;
  }
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

async function xmlChangePosition(node, tag, position) {
  let tmpObj = {};
  Object.keys(node).forEach((key, i) => {
    if (position === i) tmpObj[tag] = [''];
    tmpObj[key] = node[key];
    if (Object.keys(tmpObj).length === position) tmpObj[tag] = [''];
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

async function tagLocator(xml, tagArray, currentTag) {

  let node = xml;
  let currentTagIndex = tagArray.indexOf(currentTag);
  // if (currentTag !== undefined) {
  //   tagArray.forEach((tag, index) => {
  //     node = index < currentTagIndex ? node[tag] : node
  //   });
  // }

  let tag = currentTag || tagArray[0];

  try {
    if (node[tag] === undefined) {
      if (Object.hasOwn(node, '0')) node = node['0'];
      let iterations = Object.keys(node);
      for (let i = 0; i <= iterations.length; i++) {
        xmlGen.xmlChangePosition(node, tagArray, tag, i);
        // xmlGen.xmlSaver("preprocessor");
      }
      // let validForm = await testForm(filename, "preprocessor");
      if (validForm) {
        // xmlGen.xmlSaver("sample");
        console.log("Tag validated successfully!!!");
        return
      }
    }
    else if (tagArray.length > 0) {
      let nextTagIndex = tagArray.indexOf(tag) + 1;
      let nextTag = tagArray[nextTagIndex];
      await tagLocator(xml[tag], tagArray, nextTag);
    }
    else {
      console.log("This tag exists alredy");
      console.log("-------");
      console.log("");
      return
    }
    // console.log("alteredXml: " + alteredXml);
  }
  catch (err) {
    console.log(err);
  }
}

function getCodes(element) {
  try {

    const htmlFile = fs.readFileSync(dataPath(filename));
    const dom = new JSDOM(htmlFile);

    const selectDataContentId = dom.window.document.querySelectorAll(element);

    const codeList = { codes: [] };
    selectDataContentId.forEach((el, i, a) => {
      let code = el.dataset.contentId;
      if (code !== undefined) codeList.codes.push(code);
    })
    codeList.elementsCount = codeList.codes.length;

    fs.writeFileSync(codeListPath(filename, element), JSON.stringify(codeList));
  }
  catch (err) {
    console.log(err.message);
  }
}

function findPaths(formName) {

  const element = "input";
  let name = formName || filename;

  try {
    const codeData = fs.readFileSync(codeListPath(name, element));
    const codesString = codeData.toString();
    const codesArray = JSON.parse(codesString).codes;
    const codesList = codesArray.map(c => fieldFinder(c));
    fs.writeFileSync(codeListJson(filename, element), JSON.stringify(codesList));
  }
  catch (err) { console.log("findPath: " + err.message) }
}

(function argsRunner() {
  const args = process.argv.slice(2);
  args.filter(el => {
    if (el.match("filename")) {
      filename = commandArgumentSplitter(el)[1];
      xmlGen = new XmlDocGenerator(filename);
      return false;
    }
    return true;
  })
    .forEach(el => {
      const comAtrrArray = commandArgumentSplitter(el);
      const command = comAtrrArray[0];
      let arg = comAtrrArray[1];
      if (commands[command]) {
        if (arg === undefined) arg = filename;
        commands[command](arg);
      }
    })
}());
