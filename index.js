const express = require('express')
const app = express()
const port = 5000;
const { User } = require('./model/User');
const config = require('./config/key')
const cookieParser = require('cookie-parser')
const { auth } = require('./middleware/auth')

const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()) // parse application/json
app.use(cookieParser())


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/api/users/register',(req,res) => {
    
    //console.log(req.body)
    const user = new User(req.body);
    //console.log(user)
    user.save((err) => {
        if(err) return res.json({ success: false, err })
        return res.status(200).json({
            success: true
        })
    })

    // User.create(req.body , (err) => {
    //     if(err) return res.json({ success: false, err })
    //     return res.status(200).json({
    //         success: true
    //     })
    // })

})

app.post('/api/users/login', (req,res) => {

  // 데이터베이스에서 해당 이메일 찾기

  User.findOne({email: req.body.email}, (err,user_data) => {
    if(err) console.log(err);

    if(!user_data) {
      return res.json({
        loginSuccess: false,
        message: '해당하는 아이디가 없습니다.'
      })
    } 
    // 해당 이메일이 있다면, req의 비밀번호와 데이터베이스에 존재하는 유저의 비밀번호가 일치하는지 확인한다.

    
    user_data.comparePassword(req.body.password, (err,isMatched) => {
      
      if(!isMatched) return res.json({
        loginSuccess: false,
        message: '비밀번호가 일치하지 않습니다.'
      })
      
      user_data.generateToken((err,user_info) => {
        
        if(err) return res.status(400).send('Generating Token is fail.')

        //만들어진 Token을 저장해야한다.

        res.cookie('x_auth', user_info.token).status(200).json({
          loginSuccess: true,
          userId: user_info._id
        })
        
      })
    })
  })
})

app.get('/api/users/auth', auth, (req,res) => { // auth는 middleware (middleware는 callback function을 수행하기 전에 거쳐가는 그런 과정)

  res.status(200).json({
    _id: req.user._id,
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    role: req.user.role
  })
})

app.get('/api/users/logout', auth, (req,res) => {
  
  
  /*
  User.findByToken(req.token,(err,user) => {
    if(err) return res.json({ success: false, err });

    user.token = ""
    res.status(200).json({
      success: true
    })
  })
  */ //이게 안되는 이유: Error로 User.findByToken is not a function 이라고 나온다.
                  // 난 지금 여기 callback function의 결과값인 user로 값을 대입하려고 하고 있다.
                  // 이게 말이 안된다. callback function의 결과값이면 결과값이지,,,, 여기에 어떻게 값을 대입하냐
  
  //Mongoose의 method를 이용하자.
  User.findOneAndUpdate({_id: req._id},{token: ""}, (err,user) => {
    if(err) return res.json({ success: false, err })

    res.status(200).json({
      success: true
    })
  })
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

const mongoose = require('mongoose');

mongoose.connect(config.mongoURI,{
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false 
}).then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err))