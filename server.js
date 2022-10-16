const express = require('express')
const app = express()
const bodyParser = require("body-parser");

const gatewayRouters = require('./routers/gatewayRouters')

/** Settings */
app.set("port", process.env.PORT || 6006);

/**Middleware */
// app.use(express.json());
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
/** routers */
app.use('/gateway',gatewayRouters)
app.use('/', (req, res)=>{
    res.send('hola :D')
})


/** Deploy start */
app.listen(app.get('port'), () => {
    console.log(`server on port: ${app.get("port")}`);
  })