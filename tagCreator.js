import fs from 'fs';

export async function pathArray(filename) {

  const pwd = process.cwd();
  const readData = `${pwd}\\codeJson\\${filename}.json`;

  try {
    const streamData = fs.readFileSync(readData);

    const stringData = streamData.toString();
    const jsonData = JSON.parse(stringData);

    const regex = /(\w{3,5}:\w+)(\[.*?\])?/g;
    const subRegex = /\[.*\]/g;

    function removeSubString(tmpStr) {
      let results = [];
      let result;
      while ((result = regex.exec(tmpStr)) !== null) {
        result = result[0];
        results.push(result);
      }

      return results.map((e, i, a) => {
        if (!(i === 0) && !(i === a.length - 1)) {
          let subResult = subRegex.exec(e);
          if (subResult !== null) {
            let index = subResult.index;
            return e.slice(0, index);
          }
        }
        return e;
      });
    }

    return Object.keys(jsonData)
      .reduce((acum, e) => {
        acum[e] = jsonData[e].map(f => removeSubString(f.xpathAbsolute));
        return acum;
      }, {});
  }
  catch (err) {
    console.log(err.message);
  }
}



