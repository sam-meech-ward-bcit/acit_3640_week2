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

async function ec2Details() {
  let ec2 = {};
  ec2.ipv4 = await ec2Meta.ipv4();
  ec2.hostname = await ec2Meta.hostname();
  ec2.instanceId = await ec2Meta.instanceId();
  return ec2;
}

const nginxIP = process.env.NGINX_IP
const mysqlIP = process.env.MYSQL_IP

async function nginxTest() {
  const result = await axios.get(`http://${nginxIP}`);
  if (result.status >= 200 || result.status < 300) {
    return nginxIP;
  }
  throw `Nginx server setup incorrectly at ip: ${nginxIP}`;
}

const mysql = require("mysql2/promise");

async function mysqlTest() {
  const connection = await mysql.createConnection({
    host: mysqlIP,
    user: "MyNewUser",
    password: "MyNewPass4!",
  });

  const [rows, fields] = await connection.execute(
    "SELECT NOW()"
  );

  return {
    ip: mysqlIP,
    data: rows[0]
  }
}

app.get("/grade", async (req, res) => {
  try {
    if (!mysqlIP) {
      throw "You need to provide a MYSQL_IP";
    }
    if (!nginxIP) {
      throw "You need to provide a NGINX_IP";
    }
    let data = {}
    data.ec2Details = await ec2Details();
    data.nginx = await nginxTest();
    data.mysql = await mysqlTest();
    console.log(data);
    res.send(data);
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

app.listen(3640, () => console.log("listening on port 3640"))