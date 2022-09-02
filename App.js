const express=require('express');
const app=express()
const dotenv=require('dotenv')
dotenv.config({path:'config.env'})
const port=process.env.PORT  || 3000
const bodyParser=require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const routes=require('./route/routing')

app.use("/api",routes)

function ErrorHandler(err,req,res,next){
    setTimeout(() => {
        res.send({
          error: err,
          path: req.path,
          type: err.type
        })
    
      }, 100)
}

app.use(ErrorHandler)

app.listen(port,()=>{
    console.log(`Server started at ${port}`)
})