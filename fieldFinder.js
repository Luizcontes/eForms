import fs from 'fs';

export function fieldFinder(fieldCode) {

  const fieldsData = fs.readFileSync("C:\\Users\\a907441\\Projects\\INCM\\fields.json");
  const fieldsString = fieldsData.toString()
  const fieldsJson = JSON.parse(fieldsString)
  const fields = fieldsJson.fieldsJson.fields;
  return fields.filter(f => f.id === fieldCode)[0];
}
