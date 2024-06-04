import fs from 'fs';

const args = process.argv.slice(2);

const form0 = args[0];
const form1 = args[1];

const formBuffer0 = fs.readFileSync(`C:\\Users\\a907441\\projects\\eForms\\codeList\\${form0}`);
const formString0 = formBuffer0.toString();
const formJson0 = JSON.parse(formString0);

const formBuffer1 = fs.readFileSync(`C:\\Users\\a907441\\projects\\eForms\\codeList\\${form0}`);
const formString1 = formBuffer1.toString();
const formJson1 = JSON.parse(formString1);

const filteredBT = fields
    .filter(element => element.mandatory !== undefined);

const mandFields = tag => filteredBT
    .filter(e => formJson[tag].codes.includes(e.id))
    .map((e, i) => {1
        return {
            id: e.id,
            xpathAbsolute: e.xpathAbsolute,
            repeatable: e.repeatable.value
        }
    });

const r = Object.keys(formJson0)
    .reduce((acm, e, i) => {
        if (e !== 'totalElementsCount') {
            acm[e] = mandFields(e);
            console.log(acm[e]);
            if (acm['totalElementsCount'] === undefined) acm['totalElementsCount'] = acm[e].length;
            else acm['totalElementsCount'] = acm['totalElementsCount'] + acm[e].length;
        }
        return acm;
    }, {})

fs.writeFileSync(`C:\\Users\\a907441\\projects\\eForms\\fields\\${form}`, JSON.stringify(r));
