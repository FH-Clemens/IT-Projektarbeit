const express = require('express')
const path = require('path')

const app = express()
const port = 3000

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'queuePage.html'))
})

app.get('/queue/register', (req, res) => {

  try {
    const entry = addToQueue();
    res.status(200);
    res.send(entry);
  } catch (e) {
    console.error(e);
    res.status(500);
    res.send();
  }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})