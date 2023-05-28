const jwt = require("jsonwebtoken");
const verfiyToken = async(req,res,next)=>{
      let token = req.cookies.jwt;  
    
    if(!token ){
        return res.status(400).send({success:false,msg:"A token is required for authentication"});
    }
    try{
         const decode = jwt.verify(token,"secretkey");
         req.user = decode;
         
         res.locals.user = req.user._id
    }catch(err){
        return res.status(400).send("invalid Token");
    }


    return next();

}

module.exports = verfiyToken;;