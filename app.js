const express = require('express')
const axios = require('axios')

const ec2Meta = require('./ec2Meta')

const app = express()

app.get('/', async (req, res) => {
  const result = await axios.get('https://api.kanye.rest')
  res.send(result.data)
})

app.get('/stats', async (req, res) => {
  let ec2 = {}
    try {
      ec2.ipv4 = await ec2Meta.ipv4()
      ec2.hostname = await ec2Meta.hostname()
      ec2.instanceId = await ec2Meta.instanceId()
    } catch (err) {
      console.log(err)
      ec2 = "error"
    }

    let other = {}

    const data = {
      ec2,
      other
    }
    console.log(data)

    res.send(data)
})

app.listen(3640, () => console.log("listening on port 3640"))