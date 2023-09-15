// import XmlDocGenerator from "./xmlDocGenerator.js";

// function mapObjectRecursively(obj, callback) {
//   let newObj = {};
//   for (let key in obj) {
//       if (obj.hasOwnProperty(key)) {
//           if (typeof obj[key] === "object") {
//               newObj[key] = mapObjectRecursively(obj[key], callback);
//           } else {
//               newObj[key] = callback(obj[key]);
//           }
//       }
//   }
//   return newObj;
// }

// let originalObj = {
//   a: 1,
//   b: {
//       c: 2,
//       d: {
//           e: 3
//       }
//   },
//   f: 4
// };

// let newObj = mapObjectRecursively(originalObj, value => value * 2);
// console.log(newObj);4

let arrayTest = ["name"];
console.log(arrayTest.length);
arrayTest.shift();
console.log(arrayTest.length);