'use strict'
const express = require("express")
const app = express()
const nocache = require("nocache");
app.use(nocache())
const path = require('path')
const cookies = require('cookie-parser');
app.use(cookies());
const bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({extended:false}))
const mainRoutes = require("./routes/mainpage");
app.use(express.json())


app.set('views',"views")
app.set('view engine','ejs');
app.use(mainRoutes);

app.use(express.static(path.join(__dirname,'/public')))
module.exports.start = ()=>{
    require("./config/db/conn")().then(()=>{
        const port = process.env.port || 3000
        app.listen(port,()=>{
            console.log(`Connected to server ${port}`);
        })
    }).catch((err)=>{
      console.log("error in connecting Database");
    })
}





