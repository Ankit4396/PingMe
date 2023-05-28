'use strict'

module.exports = {
    debug : true,
    mode : 'development',
    database:{
        connection_string:'mongodb://localhost:27017/pingme',
        options:{
            useNewUrlParser:true,
            useUnifiedTopology:true
        }
    }
}