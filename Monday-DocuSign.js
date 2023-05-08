const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();
const axios = require('axios');
const baseURLMonday = 'https://api.monday.com/v2'
const accountId = 'ae33d9e4-0f4f-434d-b615-a8b002e4289e';
const baseUrl = 'https://demo.docusign.net/restapi/';

async function setTabsValuesOnDocument(body, envelopeId, callAccessToken) {
    const recipientId = '1';

    // request para dar update em uma ou mais tabs de um determinado documento da docusign
    await axios.put(`${baseUrl}/v2.1/accounts/${accountId}/envelopes/${envelopeId}/recipients/${recipientId}/tabs`, body, {
        headers: {
            'Authorization': `Bearer ${callAccessToken}`
        }
    })
    .catch(error => {
        console.log(error);
    });
    }

function getTabsOnDocument(signerPhone, corporateName, CNPJ, envelopeId, callAccessToken) {
    const documentId = 1
    return axios.get(`${baseUrl}/v2.1/accounts/${accountId}/envelopes/${envelopeId}/documents/${documentId}/tabs`, {
        headers: {
            'Authorization': `Bearer ${callAccessToken}`
        }
    })
    .then(response => {
        const arrayTextTabs = response.data.textTabs
        let objTextTabs = {
            textTabs: arrayTextTabs.map(tab => ({
              tabId: tab.tabId,
              tabLabel: tab.tabLabel,
              value: tab.value
            }))
          };

        for (tab of objTextTabs.textTabs){
            if(tab.tabLabel == "phone") {
                tab.value = signerPhone
            }
            else if(tab.tabLabel == "corporateName") {
                tab.value = corporateName
            }
            else if(tab.tabLabel == "cnpj") {
                tab.value = CNPJ
            }
        }
        
        return objTextTabs
    })
    .catch(error => {
        console.error(error);
    });
}

//Cria um envelope baseado no template passado pela monday.com
async function createAnEnvelope({ template, 
    signerName, 
    signerEmail, 
    signerPhone, 
    corporateName, 
    CNPJ, 
    approverName, 
    approverEmail, 
    itemID, 
    boardID, 
    columnID }, callAccessToken) {

    const template1 = "a0462efd-a9b1-40e9-b912-8488836406c3";
    const template2 = "64687648-9af0-45a8-a264-30c9f6eb5cd7";
    let currentTemplate = "";

    //Seta o template de acordo com o parâmetro da função
    switch (template) {
        case 1: 
            currentTemplate = template1;
            break;
        case 2: 
            currentTemplate = template2;
            break;
        default:
            console.log('Template Invalido!')
             
    }

    //body da requisição para criar envelope
    const body = {
        "emailSubject": "Assinatura eletrônica de documento",
        "templateId": currentTemplate,
        "templateRoles": [
          {
            "email": signerEmail,
            "name": signerName,
            "roleName": "signer"
          },
          {
              "email": approverEmail,
              "name": approverName,
              "roleName": "approver"
          }
        ],
        "status": "sent"
      }

    //Requisição para criar um envelope
    await axios.post(`${baseUrl}/v2.1/accounts/${accountId}/envelopes/`, body, {
        headers: {
            'Authorization': `Bearer ${callAccessToken}`
        }
    })
    .then(async response => {
        const envelopeId = response.data.envelopeId
        const body = await getTabsOnDocument(signerPhone, corporateName, CNPJ, envelopeId, callAccessToken)
        await setTabsValuesOnDocument(body, envelopeId, callAccessToken)

        changeMondayColumnValue(boardID, itemID, columnID, envelopeId)


    })
    .catch(error => {
        console.error(error);
    });
}

async function changeMondayColumnValue(boardID, itemID, columnID, value){
    const changeColumnsFromItem = {
        "query": `mutation {change_simple_column_value(item_id: ${itemID}, board_id: ${boardID}, column_id: \"${columnID}\", value: \"${value}\") {id}}` 
    }
    const callMondaySecret = await accessSecretVersion(`projects/${"docu-sign-test"}/secrets/tokenMonday/versions/${1}`)


    await axios.post(`${baseURLMonday}`, changeColumnsFromItem, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': callMondaySecret
        }})
    .catch(error =>{
        console.log(error)
    })
}

exports.main = async (req, res) =>  {
    const itemID = req.body.event.pulseId;
    const boardID = req.body.event.boardId;
    const columnID = 'texto0'

    const getColumnsFromItem = {
        "query": `query {boards(ids: ${boardID}) {items(ids: ${itemID} ) { name column_values {value text id}}}}`
    }   
    const callMondaySecret = await accessSecretVersion(`projects/${"docu-sign-test"}/secrets/tokenMonday/versions/${1}`)
    const callAccessToken = await accessSecretVersion(`projects/${"docu-sign-test"}/secrets/accessToken/versions/latest`)
    // requisição para obter os valores das colunas do item especificado
    await axios.post(`${baseURLMonday}`, getColumnsFromItem, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': callMondaySecret
        }})
    .then(async response => {

        // recebe o array de colunas
        const columnValues = response.data.data.boards[0].items[0].column_values;
        const valuesMondayResponse = {}
        for (column of columnValues){
            valuesMondayResponse[column.id] = column.value
        }

        let {
        status9: template,
        texto: signerName, 
        texto_1: signerEmail, 
        texto_2: signerPhone, 
        text: corporateName, 
        text5: CNPJ, 
        text7: approverName,
        text73: approverEmail} = valuesMondayResponse;

        template = JSON.parse(template).index;
        const newObject = {template, 
            signerName, 
            signerEmail, 
            signerPhone, 
            corporateName, 
            CNPJ, 
            approverName, 
            approverEmail, 
            itemID, 
            boardID, 
            columnID}

        for (let key in newObject) {
            if (typeof newObject[key] === 'string') {
                try {
                    newObject[key] = JSON.parse(newObject[key])
                }
                catch {
                }
            }
        }
        
        await createAnEnvelope(newObject, callAccessToken)
    })
    .catch(error => {
        console.error(error);
    });
    return res.status(200).send(req.body)
}


async function accessSecretVersion(token) {
  const [version] = await client.accessSecretVersion({
    name: token,
  });
  const payload = version.payload.data.toString();
    return payload
}
