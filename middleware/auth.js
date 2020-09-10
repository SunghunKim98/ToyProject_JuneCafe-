let { User } = require('../model/User')

let auth = (req,res,next) => { // 궁금증 1. next를 parameter에 넣어줘야하는가? 해결(꼭 넣어줘야한다!!)
    //여기서 인증처리를 한다.

    let token = req.cookies.x_auth;

    // 먼저 req에서 토큰을 decoding해야겠지? -> 근데 이 토큰을 비교하는 함수는 여기서 수행하지 않는다. (User.js에서 method를 구현한다.)

    User.findByToken(token, (err,user) => {
        if(err) return err;
        
        if(!user) return res.json({isAuth: false, error: true})
        
        //return res.json({isAuth: true}) ->> 여기서 이렇게 return을 해버리면 auth의 기능을 하지 못하지... 
        req.user = user; // middleware에서의 req는 그 해당 method애서의 req와 같다. (!!!)
        req.token = token;
        next(); // next는 꼭 넣어줘야한다!!
    })

    
}

module.exports = {auth}