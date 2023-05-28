const {Schema,model} = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const jwt = require('jsonwebtoken');
const userSchema = new Schema({

    name: {
        type:Schema.Types.String,
        required:true,
        maxlength: 256
    },
    email:{
        type:Schema.Types.String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        maxlength:320
    },
    password:{
       type:Schema.Types.String,
       required: true
    },
    username:{
        type:Schema.Types.String,
        unique:true,
        trim: true
    },
    gender:{
        type:Schema.Types.String,
        default:"NA",
        enum:["NA","Male","Female","Others"]
    },
    dob:{
        type:Schema.Types.String,
        default: null
    },
    about:{
        type : Schema.Types.String,
        maxlength: 3072,
        default: null 
    },
    pending_req_count :{
        type:Schema.Types.Number,
        min:0,
        default:0
    },
    sent_req_count :{
        type:Schema.Types.Number,
        min:0,
        default:0
    },
    friend_counts :{
        type:Schema.Types.Number,
        min:0,
        default:0
    },
    profilePic:{
        type:Schema.Types.String,
        default:null,
        maxlength:2048,
        alias:'profile_pic'
    },
    active:{
        type:Schema.Types.Boolean,
        default:false
    },
    tokens:[
        {
            token:{
                type:String,
                
            }
        }
    ]
},{
    timestamps:true
    })
userSchema.methods.generateAuthToken = async function(){
    try{
        let token = jwt.sign({_id:this._id},'secretkey');
        this.tokens = this.tokens.concat({token:token});
        await this.save();
        return token;

    }catch(err){
         console.log(err);
    }
}
userSchema.index({username:1},{unique:true});
userSchema.plugin(mongoosePaginate);
module.exports = model('User',userSchema,"user")

 
  
