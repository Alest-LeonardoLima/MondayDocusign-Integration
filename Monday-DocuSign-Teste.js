const axios = require('axios');
const mondaySdk = require('monday-sdk-js');
const monday = mondaySdk();
const itemID = 4340868644;
const boardID = '4327114320';
//Token do ambiente demo da monday.com
const tokenAPI = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjI1MTc1Njk4MSwidWlkIjo0MTU3NjY4NCwiaWFkIjoiMjAyMy0wNC0xOVQxNzoxMToxOS43NjRaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MTA0NTk2ODMsInJnbiI6InVzZTEifQ.UfhMRU_IKYbQK5UXPaoQ2fYZY3jQegYVgR5aIu7WV7U';
monday.setToken(tokenAPI);
const baseURLMonday = 'https://api.monday.com/v2'

// acessToken para acesso API eSignature DocuSigneyJ0eXAiOiJNVCIsImFsZyI6IlJTMjU2Iiwia2lkIjoiNjgxODVmZjEtNGU1MS00Y2U5LWFmMWMtNjg5ODEyMjAzMzE3In0.AQoAAAABAAUABwAAbXk6xEXbSAgAAK2cSAdG20gCAFS2kXwk9rVDjuAL8X90ERsVAAEAAAAYAAEAAAAFAAAADQAkAAAAYjY1YzgxMmItYzcwZS00N2NkLWEzYWUtNzEwY2I3MTYxZGRkIgAkAAAAYjY1YzgxMmItYzcwZS00N2NkLWEzYWUtNzEwY2I3MTYxZGRkMACAzvVLMkDbSDcAZ77Jzyh7rU-f4ta5BR4ttQ.AR7YQV3fqFqD74RgjEcntePX7580ttReM3BbXA4A2tht_oQiwOe5ekVyHvYxvYYMU3K8Es4LRBi7mvqWZyMYK80PBjoNGwdTf4M8o_b-VO71nYTi180CEqrPuxTC-oX50EJt4zspfLkowCBmLQx4rakb1mLXHr3a3cnK9VXgnv841vgG_iVjNmDJVNc9CHPTENmytwYzqj0MPHHBsTBWhu8Bgb0gMmyPFdF2QMn0qn4R52wkrcDtKojkviUeOTttz4zjMC3mqqJV83ykv-fgEcosbPQgUtaSGvLLHB0XcaN4LqmKDRxWE27XdsqM4SzbcSKngdm0NQdFCeFUfjmgbQ
const accessToken = 'eyJ0eXAiOiJNVCIsImFsZyI6IlJTMjU2Iiwia2lkIjoiNjgxODVmZjEtNGU1MS00Y2U5LWFmMWMtNjg5ODEyMjAzMzE3In0.AQoAAAABAAUABwCAHK5DTEbbSAgAgFzRUY9G20gCAFS2kXwk9rVDjuAL8X90ERsVAAEAAAAYAAEAAAAFAAAADQAkAAAAYjY1YzgxMmItYzcwZS00N2NkLWEzYWUtNzEwY2I3MTYxZGRkIgAkAAAAYjY1YzgxMmItYzcwZS00N2NkLWEzYWUtNzEwY2I3MTYxZGRkMACAzvVLMkDbSDcAZ77Jzyh7rU-f4ta5BR4ttQ.18wmL_G0-7aDZcN36ZF8henVyMSd_zQBEJVbK_OcpcyJjNFh0CHyqNLG_OYTS64iykknNs8rT-fOyU6ursqMKUrRi_K6PmCsduNAxrSZW3yxVZ4FaE6j7FZT3D_ZkSuz4z7k3gBqmN08gTK8DE2BMTNVv1x9MMPgNr9tKYFqsR76Ac7P3WSnHlBZuu9tVm82gqd2vyVBBYrHFN0EX_2eDDZ5SWp_7B7cRkofTIaSoWuRn5cYbxWDm7_FZeDVctUF21wQhqmFTaqoNUMYlKJ18nNpfXuGKxZWEWzyHwnIZODb2ru4_qSFcM9fJ_ZCVki86jtp7DPh1UxWS6TxCSLzBw';
const accountId = 'ae33d9e4-0f4f-434d-b615-a8b002e4289e';
const baseUrl = 'https://demo.docusign.net/restapi/';

function setTabsValuesOnDocument(body, envelopeId) {
    // const phone = valuesMondayResponse['texto_2'].replace(/"/g, '');
    const recipientId = '1';

    // corpo da requisição para alterar o número de telefone do documento
    
    // request para dar update em uma ou mais tabs de um determinado documento da docusign
    axios.put(`${baseUrl}/v2.1/accounts/${accountId}/envelopes/${envelopeId}/recipients/${recipientId}/tabs`, body, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => {
       console.log(response.data);
        
    })
    .catch(error => {
        console.error(error);
    });
    }

function getTabsOnDocument(signerPhone, corporateName, CNPJ, envelopeId) {
    const documentId = 1
    return axios.get(`${baseUrl}/v2.1/accounts/${accountId}/envelopes/${envelopeId}/documents/${documentId}/tabs`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
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
        

        console.log(objTextTabs)
        return objTextTabs
    })
    .catch(error => {
        console.error(error);
    });
}
// getTabsOnDocument("4554474b-dbb2-440b-8fc0-78b73ed686eb");

//Cria um envelope baseado no template passado pela monday.com
function createAnEnvelope({ template, signerName, signerEmail, signerPhone, corporateName, CNPJ, approverName, approverEmail }) {
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
    axios.post(`${baseUrl}/v2.1/accounts/${accountId}/envelopes/`, body, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(async response => {
        const envelopeId = response.data.envelopeId
        const body = await getTabsOnDocument(signerPhone, corporateName, CNPJ, envelopeId)
        
        //setTabs params: obj que gera o body e envelope id
        // setTabsValuesOnDocument(template, signerName, signerEmail, signerPhone, corporateName, CNPJ, approverName, approverEmail, envelopeId)
        setTabsValuesOnDocument(body, envelopeId)
    })
    .catch(error => {
        console.error(error);
    });
}



function main() {

    const getColumnsFromItem = {
        "query": `query {boards(ids: ${boardID}) {items(ids: ${itemID} ) { name column_values {value text id}}}}`
    }   
    // requisição para obter os valores das colunas do item especificado
    axios.post(`${baseURLMonday}`, getColumnsFromItem, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': tokenAPI
        }})
    .then(response => {
        // recebe o array de colunas
        
        // console.log(JSON.parse(response))
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
        const newObject = {template, signerName, signerEmail, signerPhone, corporateName, CNPJ, approverName, approverEmail}
        for (let key in newObject) {
            if (typeof newObject[key] === 'string') {
                try {
                    newObject[key] = JSON.parse(newObject[key])
                }
                catch {
                }
            }
        }
        
        createAnEnvelope(newObject)
    })
    .catch(error => {
        console.error(error);
    });
}

main()