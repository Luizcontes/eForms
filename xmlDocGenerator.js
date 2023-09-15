import xml2js from 'xml2js';
import { fileReader, fileSaver } from './fileSystemManager.js';
const parseString = xml2js.parseString;
const builder = new xml2js.Builder({ renderOpts: { 'pretty': true, 'indent': '  ', 'newline': '\n', allowEmpty: true } });

export default class XmlDocGenerator {

  constructor(filename) {
    this.filename = filename + ".xml";
    this.xmlJson = this.xmlGenerator();
  }

  xmlGenerator() {
    const XMLData = fileReader("sample", this.filename);
    let xml;
    parseString(XMLData, (err, xmlObj) => {
      try {
        if (xmlObj === undefined) throw "Cannot parse XML, wrong format";
        xml = xmlObj;
      }
      catch (err) {
        console.log(err);
        process.exit();
      }
    })
    return xml;
  }

  xmlToJson() {
    let contractType = Object.keys(this.xmlJson)[0];
    return this.xmlJson[contractType];
  }

  async xmlSaver(dir) {
    const xmlTmp = builder.buildObject(this.xmlJson);
    fileSaver(dir, this.filename, xmlTmp);
  }

  async setXml(xml) {
    let contractType = Object.keys(this.xmlJson)[0];
    this.xmlJson[contractType] = xml;
  }

  // xmlChangePosition(node, tag, position) {
  //   let tmpObj = {};
  //   Object.keys(node).forEach((key, i) => {
  //     if (position === i) tmpObj[tag] = {};
  //     tmpObj[key] = node[key];
  //     if (Object.keys(tmpObj).length === position) tmpObj[tag] = {};
  //   });

    // if (node === '') tmpObj[tag] = {};

    // let contractType = Object.keys(this.xmlJson)[0];
    // let copyXml = { ...this.xmlJson };
    // let doc = copyXml[contractType];
    // this.objectTraverser(tmpObj, tagArray, tag, doc);

    // this.mapObjectRecursively(this.xmlJson, val => console.log(val));
  // }

  // mapObjectRecursively(obj, tagArray, i, callback) {
  //   let tag = tagArray[i];
  //   let keys = Object.keys(obj);
  //   if (!keys.includes(tag)) {
  //     obj = keys.forEach( (el, i) => this.xmlChangePosition(obj, tag, i) );
  //   }
  //   let newObj = {};
  //   for (let key in obj) {
  //     if (obj.hasOwnProperty(key)) {
  //       if (typeof obj[key] === "object") {
  //         newObj[key] = this.mapObjectRecursively(obj[key], callback);
  //       } else {
  //         newObj[key] = callback(obj[key]);
  //       }
  //     }
  //   }
  //   return newObj;
  // }

  // objectTraverser(node, tagArray, tag, doc) {
  //   let currentTagIndex = tagArray.indexOf(tag);
  //   if (currentTagIndex === 0) {
  //     doc = node;
  //   }
  //   else {
  //     let leaf = tagArray.shift();
  //     this.objectTraverser(node, tagArray, leaf, tmpDoc);
  //   }
  // }
}
