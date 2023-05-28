'use strict'
const mongoose = require('mongoose')
const ServerConfig = require('../env/development')
/**
 * @return string
 */

mongoose.Types.ObjectId.valueOf = () =>{
    return this,toString();
}

/**
 * 
 * @return {Promise<boolean}
 */

module.exports = async () =>{
    try{
        console.log('hello')
        await mongoose.connect(
            ServerConfig.database.connection_string,
            ServerConfig.database.options
        );
        console.info('[CONNECT DATABASE]','SUCCESS');
        return true;
    }catch(err){
        console.log('[CONNECT DATABASE]','ERROR',err);
        throw err;
    }
};