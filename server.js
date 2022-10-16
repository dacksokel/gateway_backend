const express = require('express')
const app = express()
// const rutaPrueba = require('./routers/index')

// app.use(rutaPrueba)
// // app.get('/', function (req, res) {
// //   res.send('Hello World')
// // })

app.set("port", process.env.PORT || 6000);
app.use(express.json());

app.listen(app.get('port'), () => {
    console.log(`server on port: ${app.get("port")}`);
  })