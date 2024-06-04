import fs from 'fs';

const args = process.argv.slice(2);

const form = args[0];

for (let i = 1; i <= 40; i++) {

    let form = `form${i}.json`

    const fieldsBuffer = fs.readFileSync('C:\\Users\\a907441\\projects\\eForms\\fields\\fields.json');
    const fieldsString = fieldsBuffer.toString();
    const fieldsJson = JSON.parse(fieldsString);
    const fields = fieldsJson['fields'];

    const formBuffer = fs.readFileSync(`C:\\Users\\a907441\\projects\\eForms\\codeList\\${form}`);
    const formString = formBuffer.toString();
    const formJson = JSON.parse(formString);

    // Exclude from the list BT required for every form

    const filteredBT = fields
        .filter(element => {
            
            // --> if not mandatory, take it out
            if (element.mandatory === undefined) return false;

            // --> if in the mandatory field it doesn`t include the x form, take it out
            if (!element.mandatory.constraints[0].noticeTypes.includes(i.toString())) return false;

            // --> if the field is mandatory for every form, take it out
            // if (element.mandatory.constraints[0].noticeTypes.length >= 40) return false; 

            // --> if the field doesn t include the x form, keep it
            // if (!element.mandatory.constraints[0].noticeTypes.includes("38")) return true; 

            // --> if the field is forbidden in the form x include it
            // if (element.mandatory.constraints[0].noticeTypes.includes("29") && element.forbidden.constraints[0].noticeTypes.includes("31`")) return true; 

            return true;
        });

    const mandFields = tag => filteredBT
        .filter(e => formJson[tag].codes.includes(e.id))
        .map((e, i) => {
            return {
                id: e.id,
                xpathAbsolute: e.xpathAbsolute,
                // repeatable: e.repeatable.value,
                mandatory: e.mandatory.constraints[0].noticeTypes
            }
        });

    const r = Object.keys(formJson)
        .reduce((acm, e, i) => {
            if (e !== 'totalElementsCount') {
                acm[e] = mandFields(e);
                // console.log(acm[e]);
                if (acm['totalElementsCount'] === undefined) acm['totalElementsCount'] = acm[e].length;
                else acm['totalElementsCount'] = acm['totalElementsCount'] + acm[e].length;
            }
            return acm;
        }, {})

    fs.writeFileSync(`C:\\Users\\a907441\\projects\\eForms\\fields\\${form}`, JSON.stringify(r));
}
