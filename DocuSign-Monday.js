const {SecretManagerServiceClient} = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();

async function accessSecretVersion(name) {
    const [version] = await client.accessSecretVersion({
      name: name,
    });
    const payload = version.payload.data.toString();
    return payload
  }   

const axios = require('axios')
const columnID = 'status1';
const boardID = 4327114320;
const baseURLMonday = 'https://api.monday.com/v2'

function changeMondayEnvelopeStatus(status, envelopeId, callSecret) {
    const body = {
        "query": `query {items_by_column_values (board_id: ${boardID}, column_id: \"texto0\", column_value: \"${envelopeId}\") {id name}}` 
    }
    axios.post(`${baseURLMonday}`, body, {
        headers: {
            'Authorization': callSecret
        }
        })
        .then(response => {
            const itemID = response.data.data.items_by_column_values[0].id
            changeStatusColumn(itemID, status, callSecret)
        })
        .catch(error => {
            console.error(error);
        });

}

function changeStatusColumn(itemID, status, callSecret) {
    const body = {
        "query": `mutation { change_column_value(item_id: ${itemID}, board_id: ${boardID}, column_id: \"${columnID}\", value: \"{\\\"label\\\": \\\"${status}\\\"}\") { id } }`
      }
      axios.post(`${baseURLMonday}`, body, {
        headers: {
            'Authorization': callSecret
        }
        })
        .catch(error => {
            console.error(error);
        });
}

exports.main = async (req, res) => {
    const callSecret = await accessSecretVersion(`projects/${"docu-sign-test"}/secrets/tokenMonday/versions/latest`)

    const statusEvent = req.body.event
    const envelopeId = req.body.data.envelopeId
    let status = ""
    switch (statusEvent) {
      case 'envelope-completed':
          status = "Concluido"
          break
      default:
          status = "Pendente"
          break
    }
    changeMondayEnvelopeStatus(status, envelopeId, callSecret)
    res.status(200).send("OK");
}