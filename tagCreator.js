import fs from 'fs';

export function pathArray(filename) {
  const readData = "C:\\Users\\a907441\\Projects\\INCM\\codeJson\\" + filename + "-json-input.json";
  try {
    const streamData = fs.readFileSync(readData);

    const stringData = streamData.toString();
    const jsonData = JSON.parse(stringData);

    const regex = /[^\[\(][a-z]{3,5}:[a-zA-Z]*[^\)\/](@[a-zA-Z='-]*\])?/g;

    function removeSubString(tmpStr) {
      let results = [];
      let result;
      while ((result = regex.exec(tmpStr)) !== null) {
        result = result[0].slice(1);
        let lastChar = result.length - 1;
        let squareBracket = result.charAt(lastChar);
        if (squareBracket === '[') result = result.slice(0, lastChar);
        results.push(result);
      }
      return results;
    }

    return jsonData.map(e => removeSubString(e.xpathAbsolute));
  }
  catch (err) {
    console.log(err.message);
  }
}



