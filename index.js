const express = require('express')
const app = express()
const port = 5000;
const { User } = require('./model/User');
const config = require('./config/key')

const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()) // parse application/json


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/register',(req,res) => {
    
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

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

const mongoose = require('mongoose');

mongoose.connect(config.mongoURI,{
    useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false 
}).then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err))