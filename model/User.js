const mongoose = require('mongoose')
const bcrypt = require('bcrypt');
const saltRounds = 10;
let jwt = require('jsonwebtoken');
const secretKey = 'secretOrPrivateKey'

const userSchema = mongoose.Schema({

    name: {
        type: String,
        maxlength: 20
    },
    email: {
        type: String,
        maxlength: 30,
        trim: true,
        unique: 1
    },
    password: {
        type: String,
        minlength: 5
    },
    gender: {
        tpye: Number
    },
    role: {
        tpye: Number,
        default: 0
    },
    token: {
        type: String
    },
    tokenExp: {
        type: Number
    }

})



// 비밀번호를 바꿔서 저장해주는 과정이 필요

userSchema.pre('save', function(next){
    
    let user = this

    if( user.isModified('password') ) {
        bcrypt.genSalt(saltRounds, function(err, salt) {
        bcrypt.hash(user.password, salt, function(err, hash) {
            // Store hash in your password DB.
            // 이때 hash라는건, 암호화된 비밀번호를 의미한다.
    
            user.password = hash;
            next();
            });
        });
    } else{
        next()
    }
})


userSchema.methods.comparePassword = function(plainPassword, callback) { //이건 arrow function과 그냥 function의 차이를 정확히 인지해야겠다. 
    
    //console.log(typeof(this))
    // "this"를 처리하는 것에서 어떤 차이가 존재한다.
    bcrypt.compare(plainPassword, this.password, function(err,isMatch) {
        if(err) callback(err)
        
        //console.log(isMatch)
        callback(null,isMatch) //주의!! callback은 function이다.
    })
}

userSchema.methods.generateToken = function(callback){
    let user = this;

    //console.log(typeof(user._id.toString()))

    jwt.sign((user._id).toString(),secretKey, (err,token) => {
        
        if(err) callback(err);

        user.token = token
        user.save((err,user_info) => {
            if(err) callback(err)
            callback(null,user_info)
        })
    })
}

userSchema.statics.findByToken = function(token, callback){

    let user = this; //여기서의 this 즉, user는 그 데이터베이스의 User 모델을 의미한다.

    jwt.verify(token, secretKey, (err,user_id) => {

        if(err) callback(err);
        // 유저 데이터베이스에 decode된 유저와 토큰이 있는지 확인

        user.findOne({"_id": user_id, "token": token},(err, user) => {
            if(err) callback(err)
            callback(null,user)
        })

    })
}

const User = mongoose.model('User',userSchema)
module.exports = { User }

//정확히 User가 뭐냐..?
//여기서 이 model이라는 것의 의미를 잘 생각해야하는데
//결국은 그 우리의 MongoDB의 모델!(즉, 모델을 우리가 넣은 그 데이터들의 집합체 라고 생각하면 될 것 같다.)