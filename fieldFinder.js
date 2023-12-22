import fs from 'fs';

export function fieldFinder(fieldCode) {

  const fieldsData = fs.readFileSync("C:\\Users\\a907441\\Projects\\INCM\\fields.json");
  const fieldsString = fieldsData.toString()
  const fieldsJson = JSON.parse(fieldsString)
  const fields = fieldsJson.fieldsJson.fields;
  let t = fields.filter((f, i) => {
    // if (f.id === fieldCode) console.log(f);
    return f.id === fieldCode;
  })[0];
  // console.log(t);
  return {id: t.id, xpathAbsolute: t.xpathAbsolute};
}
