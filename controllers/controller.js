'use strict'
const User = require('../models/user-model');
const FriendDB = require('../models/friends-model');
const Mongoose = require('mongoose')
const ObjectId = Mongoose.Types.ObjectId;
const bcrypt = require('bcrypt');
const Util = require("i/lib/util");
const jwt = require('jsonwebtoken');
const express = require("express");
const { findById, $where } = require('../models/user-model');
const { default: mongoose } = require('mongoose');
const app = express()
  

exports.welcomePage = (req,res,next)=>{
   
    res.render("welcome",{
        title:"PingMe",
        
    });
}

exports.createAccount = (req,res,next)=>{
    res.render("registration",{
    title: "Create Account"
    });
    next()
}

exports.addFriend = async(req,res,next)=>{
   const username = req.params.uname;
   const response = await fetch(`http://localhost:3000/userdetails?uname=${username}`);
   const data = await response.json()
   const friendID = data._id
   const FRIEND_REQ = {};
   FRIEND_REQ['from'] = req.user._id;
   FRIEND_REQ['to'] = friendID;
   console.log(friendID)
   
   try{
       await FriendDB.PendingRequests.create(FRIEND_REQ);
       await FriendDB.SentRequest.create(FRIEND_REQ);
       await User.updateOne({_id:req.user._id},
        
        {
            $inc:{
                sent_req_count : 1
            }
        }        
        ).exec();
        await User.updateOne({_id:friendID},
             
            {
                $inc:{
                    pending_req_count : 1
                }
            }        
            ).exec();
         res.redirect(`/otherProfile/${req.params.uname}`);
       
   }catch(err){
       res.status(500).json({message:err});
   }
   
     
}

exports.dashboard = async(req,res,next)=>{
    let name = req.params.name;
    let response = await fetch(`http://localhost:3000/userdetails?uname=${name}`);
    console.log(response)
     if(!response){
        console.log("hello");
     }
    let data = await response.json(); 
    const QUERY = {}
    QUERY['from'] =  new ObjectId(req.user._id)
    const result = await FriendDB.Friends.aggregate([  
 
     { $match : QUERY},            
 {
 
 $lookup:{
         from:"user",
         localField: "to",
         foreignField: "_id",                          
          as: "data"
 }
 },
 {
 $unwind: {
     'path': '$data'
 }
 }, {
 $project: {
     _id:0,
     from: 1, 
     to:1,
     "data.name": 1,
     "data.username":1
 
 
 }
 }
 
 ]).exec();

    console.log(data)
    if(data._id !== req.user._id){
        response = await fetch(`http://localhost:3000/userdetails?id=${req.user._id}`);
        data = await response.json()
        res.redirect(`/dashboard/${data.username}`)
    } 
    else{
    res.render("dashboard",{
        title:"PingMe",
        user:data.name,
        data:result
    }); 
} 
    next() 
}  
 
exports.otherFriendList = async(req,res,next)=>{
    const username = req.params.uname;
    const response = await fetch(`http://localhost:3000/userdetails?uname=${username}`);
    const data = await response.json()
    const userID = data._id
    const QUERY = {}
    QUERY['from'] =  new ObjectId(userID)
    const result = await FriendDB.Friends.aggregate([  
 
     { $match : QUERY},            
 {
 
 $lookup:{
         from:"user",
         localField: "to",
         foreignField: "_id",                          
          as: "data"
 }
 },
 {
 $unwind: {
     'path': '$data'
 }
 }, {
 $project: {
     _id:0,
     from: 1, 
     to:1,
     "data.name": 1,
     "data.username":1
 
 
 }
 }
 
 ]).exec();
    
     res.render("myfriends",{
             title:"My Friends",
              data:result
 
          });
    
     next();
 } 

exports.myFriends = async(req,res,next)=>{
   const QUERY = {}
   QUERY['from'] =  new ObjectId(req.user._id)
   const result = await FriendDB.Friends.aggregate([  

    { $match : QUERY},            
{

$lookup:{
        from:"user",
        localField: "to",
        foreignField: "_id",                          
         as: "data"
}
},
{
$unwind: {
    'path': '$data'
}
}, {
$project: {
    _id:0,
    from: 1, 
    to:1,
    "data.name": 1,
    "data.username":1


}
}

]).exec();
   
    res.render("myfriends",{
            title:"My Friends",
             data:result

         });
   
    next();
}

exports.pendingRequest = async(req,res,next)=>{
    const QUERY = {}
   QUERY['to'] =  new ObjectId(req.user._id);
   const result = await FriendDB.PendingRequests.aggregate([  

    { $match : QUERY},            
{

$lookup:{
        from:"user",
        localField: "from",
        foreignField: "_id",                          
         as: "data"
}
},
{
$unwind: {
    'path': '$data'
}
}, {
$project: {
    _id:0,
    from: 1, 
    to:1,
    "data.name": 1,
    "data.username":1


}
}

]).exec();
res.render("pendingReq",{
title:"Pending request",
data:result

});

    // await FriendDB.PendingRequests.find({to:req.user._id}).then(result=>{
    //     res.render("pendingReq",{
    //         title:"Pending request",
    //         data:result
            
    //     });
    // }).catch((err)=>{
    //     res.send(err);

    // });
    next()
}

exports.sentRequest = async(req,res,next)=>{
   const QUERY = {}
   QUERY['from'] =  new ObjectId(req.user._id);
   const result = await FriendDB.SentRequest.aggregate([  

        { $match : QUERY},            
    {

    $lookup:{
            from:"user",
            localField: "to",
            foreignField: "_id",                          
             as: "data"
   }
},
{
    $unwind: {
        'path': '$data'
    }
}, {
    $project: {
        _id:0,
        from: 1, 
        to:1,
        "data.name": 1,
        "data.username":1


    }
}

]).exec();
   res.render("sentReq",{
    title:"Sent request",
    data:result
    
});

   
    // await FriendDB.SentRequest.find({from:req.user._id}).then(result=>{
    //     res.render("sentReq",{
    //         title:"Sent request",
    //         data:result
            
    //     });
    // }).catch((err)=>{
    //     res.send(err);
    // });
    next()
}

exports.myprofile = async (req,res,next)=>{
    const id = req.user._id
    const response = await fetch(`http://localhost:3000/userdetails?id=${id}`);
    const data = await response.json()
     res.render("myprofile",{
        title:"myProfile",
        data:data
     })
     next()
}

exports.registration = async (req,res,next)=>{
    try{
        const USER_DOC = {};
        const body = req.body;
        USER_DOC['name'] = body.name;
        USER_DOC['email'] = body.email;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(body.password,salt);
        USER_DOC['password'] = hashedPassword;
        USER_DOC['username'] = body.uname;
        USER_DOC['gender'] = body.gender;
        USER_DOC['about'] = body.about;
        USER_DOC['profilePic'] = body.ppic || null;
        USER_DOC['dob'] = body.dob;

        const user = await User.create(USER_DOC);
        return res.redirect("/")
        // return res.json({
        //     success:true,
        //     id:user._id,
        //     message:'Registration was succesful'
        // });
        

    }
    catch(err){
        res.status(400).json({
            success:false,
            message:err,
        });
        return;
    }
}

exports.logout = async(req,res,next)=>{
   try{
     res.clearCookie('jwt')
     console.log("jwttoken is ", req.cookies)
     await User.updateOne({_id:req.user._id},
        
        {
            $set:{
                active : false
            }
        }        
        ).exec(); 
     console.log("Logout Succefully");
     res.redirect('/')
   }catch(err){
      console.log("error in logging");
   }
}

exports.details = (req,res,next)=>{

    const userId = req.query.id;
    const username = req.query.uname
    const name = req.query.name
    const QUERY = {}
    if(userId){
        QUERY["_id"] = userId
    } 
    else if(username){
        QUERY["username"] = username
    }
    console.log(QUERY)
User.findOne(QUERY).then(result=>{
    res.status(200).send(result)
}).catch(err=>{
  res.json({
    status:"error",
    message:"not found",
  });
  next();
});

}

exports.unfriend = async(req,res,next)=>{

    try{
    const username = req.params.uname;
    const response = await fetch(`http://localhost:3000/userdetails?uname=${username}`);
    const data = await response.json()
    const friendID = data._id
    await FriendDB.Friends.deleteOne({from:req.user._id,to:friendID}).exec();
    await FriendDB.Friends.deleteOne({from:friendID,to:req.user._id}).exec();
    await User.updateOne({_id:req.user._id},
          
        {
            $inc:{
                friend_counts : -1
            }
        }        
        ).exec();
      await User.updateOne({_id:friendID},
      
          {
              $inc:{
                friend_counts : -1
              }
          }        
          ).exec();

          res.redirect(`/otherProfile/${req.params.uname}`);
          next();
        }catch(err){
            res.status(500).json({message:"Bad request"});
        }
        

}

exports.revFriendReq = async(req,res,next)=>{
    const username = req.params.uname;
   const response = await fetch(`http://localhost:3000/userdetails?uname=${username}`);
   const data = await response.json()
   const friendID = data._id
    const FRIEND_REQ = {};
    FRIEND_REQ['from'] = req.user._id;
    FRIEND_REQ['to'] = friendID;
    
    try{
        await FriendDB.PendingRequests.deleteOne({from:req.user._id,to:friendID}).exec();
        await FriendDB.SentRequest.deleteOne({from:req.user._id,to:friendID}).exec();
        await User.updateOne({_id:req.user._id},
          
          {
              $inc:{
                  sent_req_count : -1
              }
          }        
          ).exec();
        await User.updateOne({_id:friendID},
        
            {
                $inc:{
                    pending_req_count : -1
                }
            }        
            ).exec();
              console.log("URL is " + req.url)
              if(req.url === `/withdraw/${req.params.uname}`){
                    res.redirect("/sent_request")
              }
              else{
              res.redirect(`/otherProfile/${req.params.uname}`);
              }
         
     }catch(err){
         res.status(500).json({message:"Bad request"});
     }
     }

exports.withdrawReq = async(req,res,next)=>{
         return this.revFriendReq(req,res,next) 
        
}   

exports.declinedReq = async (req,res,next)=>{
      return this.declineReq(req,res,next) 
}

exports.acceptedReq = async (req,res,next)=>{
    return this.acceptReq(req,res,next) 
}

exports.acceptReq = async (req,res,next)=>{
    
    
    try{
    const username = req.params.uname;
    const response = await fetch(`http://localhost:3000/userdetails?uname=${username}`);
    const data = await response.json()
    const friendID = data._id
    const FRIEND_REQ = {};
    FRIEND_REQ['from'] = new ObjectId(req.user._id);
    FRIEND_REQ['to'] = new ObjectId(friendID);
    const FRIEND_REQ1 = {};
    FRIEND_REQ1['from'] = new ObjectId(friendID);
    FRIEND_REQ1['to'] = new ObjectId(req.user._id);
    await FriendDB.Friends.insertMany([FRIEND_REQ,FRIEND_REQ1],{ ordered: true });
    await FriendDB.PendingRequests.deleteOne({from:friendID,to:req.user._id}).exec();
    await FriendDB.SentRequest.deleteOne({from:friendID,to:req.user._id}).exec();

        await User.updateOne({_id:req.user._id},
        
            {
                $inc:{
                    friend_counts : 1,
                    pending_req_count : -1
                }
            }        
            ).exec();
            await User.updateOne({_id:friendID},
                 
                {
                    $inc:{
                        friend_counts : 1,
                        sent_req_count : -1
                    }
                }        
                ).exec();

                if(req.url === `/accepted_req/${req.params.uname}`){
                    res.redirect(`/otherProfile/${req.params.uname}`); 
                  }
                  else{
                  res.redirect("/pending_request")
                  }


    }catch(err){
         res.status(500).json({message:err});
     }
}

exports.declineReq = async(req,res,next)=>{
    const username = req.params.uname;
    const response = await fetch(`http://localhost:3000/userdetails?uname=${username}`);
    const data = await response.json()
    const friendID = data._id
    const FRIEND_REQ = {};
    FRIEND_REQ['from'] = req.user._id;
    FRIEND_REQ['to'] = friendID;
    
    try{
        await FriendDB.PendingRequests.deleteOne({from:friendID,to:req.user._id}).exec();
        await FriendDB.SentRequest.deleteOne({from:friendID,to:req.user._id}).exec();
        await User.updateOne({_id:friendID},
          
          {
              $inc:{
                  sent_req_count : -1
              }
          }        
          ).exec();
        await User.updateOne({_id:req.user._id},
        
            {
                $inc:{
                    pending_req_count : -1
                }
            }        
            ).exec();
            console.log("URL is " + req.url)
              if(req.url === `/declined/${req.params.uname}`){
                res.redirect(`/otherProfile/${req.params.uname}`); 
              }
              else{
              res.redirect("/pending_request")
              }
            
            //   res.redirect(`/otherProfile/${req.params.uname}`);
         
     }catch(err){
         res.status(500).json({message:"Bad request"});
     }
     }     

exports.searchProfile = async (req,res,next)=>{
    const uname = req.body.search
    return res.redirect(`/otherProfile/${uname}`)
}     

exports.otherdetails = async (req,res,next)=>{
    
    const uname = req.params.uname
    const response = await fetch(`http://localhost:3000/userdetails?uname=${uname}`);
    const data = await response.json()
    const friendship = await FriendDB.Friends.findOne({from:req.user._id, to: data._id})
    const friendshipReq = await FriendDB.PendingRequests.findOne({from:data._id, to: req.user._id})
    const sentfriendshipReq = await FriendDB.SentRequest.findOne({from:req.user._id, to: data._id})
    const loggedInUser = await fetch(`http://localhost:3000/userdetails?id=${req.user._id}`);
    const loggedInUserData = await loggedInUser.json()
    if(data._id === req.user._id){
        res.redirect("/myprofile")        
    }
    else{
     res.render("otherProfile",{
        title:"otherProfile",
        data:data,
        friend:friendship,
        pendingFriendReq: friendshipReq,
        sentFriendReq: sentfriendshipReq,
        admin:loggedInUserData
     })
    }
     next()
}

exports.login = (req,res,next)=>{
    const body = req.body;

    if(isNullOrUndefined(body.email) || isNullOrUndefined(body.password)){
        res.status(400).json({
            success:false,
            message:'Bad Login Request',
        });
        return;
    }

    const userEmail = String(body.email).toLocaleLowerCase();
    const userPassword = String(body.password);

    User.findOne(
        {email:userEmail}
        ).lean().then((user)=>{
            if(isNullOrUndefined(user)){
                res.json({
                    success:false,
                    message:'invalid Email.',
                });
            }else{
                 bcrypt
                   .compare(userPassword,user.password)
                   .then(async(isMatch) =>{
                    if(isMatch){

                         const token =   await generateAuthToken(user);
                         res.cookie("jwt",token);
                        console.log(req.cookies.jwt)        
                        await User.updateOne({_id:user._id},
        
                            {
                                $set:{
                                    active : true
                                }
                            }        
                            ).exec();                
                        res.redirect(`/dashboard/${user.username}`)
                         next()
                        

                    }else{
                        res.json({
                            sucess:false,
                            message: 'Invalid Password',
                        });
                    }
                   })
                   .catch(err=>{
                     res.status(500).json({
                        success: false,
                        message:'Internal Server Error. Contact Support1',
                     });
                   });
            }
        }) .catch(err=>{
            res.status(500).json({
               success: false,
               message:'Internal Server Error. Contact Support',
            });
          });

}


function isNullOrUndefined(value){
    return value === undefined || value === null;
}

const  generateAuthToken = async(user)=>{
    try{
        const token = await  jwt.sign({_id:user._id},'secretkey');
        return token;
    }catch(err){
        console.log(err);
    }
       
       
}
