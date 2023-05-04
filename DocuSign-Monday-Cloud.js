const axios = require('axios')
const columnID = 'status1';
const boardID = 4327114320;
const tokenAPI = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjI1MTc1Njk4MSwidWlkIjo0MTU3NjY4NCwiaWFkIjoiMjAyMy0wNC0xOVQxNzoxMToxOS43NjRaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MTA0NTk2ODMsInJnbiI6InVzZTEifQ.UfhMRU_IKYbQK5UXPaoQ2fYZY3jQegYVgR5aIu7WV7U';
const baseURLMonday = 'https://api.monday.com/v2'

function changeMondayEnvelopeStatus(status, envelopeId) {
    const body = {
        "query": `query {items_by_column_values (board_id: ${boardID}, column_id: \"texto0\", column_value: \"${envelopeId}\") {id name}}` 
    }
    axios.post(`${baseURLMonday}`, body, {
        headers: {
            'Authorization': tokenAPI
        }
        })
        .then(response => {
            const itemID = response.data.data.items_by_column_values[0].id
            changeStatusColumn(itemID, status)
        })
        .catch(error => {
            console.error(error);
        });

}

function changeStatusColumn(itemID, status) {
    const body = {
        "query": `mutation { change_column_value(item_id: ${itemID}, board_id: ${boardID}, column_id: \"${columnID}\", value: \"{\\\"label\\\": \\\"${status}\\\"}\") { id } }`
      }
      axios.post(`${baseURLMonday}`, body, {
        headers: {
            'Authorization': tokenAPI
        }
        })
        .then(response => {

        })
        .catch(error => {
            console.error(error);
        });
}


changeMondayEnvelopeStatus()

exports.main = (req, res) => {
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
    changeMondayEnvelopeStatus(status, envelopeId)
    res.status(200).send("Passou");
}
