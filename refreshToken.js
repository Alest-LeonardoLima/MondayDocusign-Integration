const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();
const axios = require('axios')
const hostenv = 'account-d.docusign.com'
const querystring = require('querystring');

async function updateSecretValue(name, value) {
  
  const projectID = '1097844744786'

  const parent = `projects/${projectID}`;
  const [currentVersion] = await client.getSecretVersion({
    name: `${parent}/secrets/${name}/versions/latest`,
  });

  const [version] = await client.disableSecretVersion({
    name: currentVersion.name
  });


  const [newVersion] = await client.addSecretVersion({
    parent: `${parent}/secrets/${name}`,
    payload: {
      data: Buffer.from(value, 'utf8'),
    },
  });
}

exports.main = async (req, res) => {

    let name = "refreshToken"
    const callSecretRefreshToken = await accessSecretVersion(`projects/${"docu-sign-test"}/secrets/${name}/versions/latest`)


    const bodyParams = {
        refresh_token: callSecretRefreshToken,
        grant_type: 'refresh_token'
    }
    const body = querystring.stringify(bodyParams)

      name = 'encodedKeys'
      const callSecretEncodedKeys = await accessSecretVersion(`projects/${"docu-sign-test"}/secrets/${name}/versions/latest`)
    
    return axios.post(`https://${hostenv}/oauth/token`, body,  {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${callSecretEncodedKeys}`
        }
    })
    .then(async response => {
        console.log(response.data)
        await updateSecretValue('accessToken', response.data.access_token);
        await updateSecretValue('refreshToken', response.data.refresh_token);
        res.status(200).send("OK")
    })
    .catch(error => {
        console.error(error);
    });
}

async function accessSecretVersion(token) {
  const [version] = await client.accessSecretVersion({
    name: token,
  });
  const payload = version.payload.data.toString();
    return payload
}