const{Schema,model} = require("mongoose")
const mongoosePaginate = require('mongoose-paginate');
const { default: mongoose } = require("mongoose");


const friendshipSchema = new Schema({
     from: {
       type:Schema.Types.ObjectId,
       required:true,
       ref:'User',
       imutable:true,
     },
     to:{
         type:Schema.Types.ObjectId,
         required:true,
         ref:'User',
         imutable:true
     }
},{
timestamps:true
}
);



const pendingSchema = new Schema({
    from:{
      type:Schema.Types.ObjectId,
      required:true,
      ref:'User',
      imutable:true,
    },
    to:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'User',
        imutable:true,
    }

},{
    timestamps:true
})


const sentSchema = new Schema({
    from:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'User',
        imutable:true,
    },
    to:{
        type:Schema.Types.ObjectId,
        required:true,
        ref:'User',
        imutable:true,
    }

},{
    timestamps:true
});

friendshipSchema.index({from:1, to:1},{unique:true});
pendingSchema.index({from:1, to:1},{unique:true});
sentSchema.index({from:1, to:1},{unique:true});
friendshipSchema.plugin(mongoosePaginate)
pendingSchema.plugin(mongoosePaginate)
sentSchema.plugin(mongoosePaginate)

module.exports.Friends = mongoose.model('Friends',friendshipSchema,"friends");
module.exports.PendingRequests = mongoose.model('PendingRequests',pendingSchema,"pending_req")
module.exports.SentRequest = mongoose.model('SentRequests',sentSchema,"sent_req")