const { async } = require('q')
const User=require('../model/vehicle')

const uploads=require('../Middleware/upload').single('user_profile_pic')

const UploadImage=async(req,res,next)=>{
    uploads(req,res,async(next)=>{
        try {
            const user_profile_pic=req.file.filename
            console.log(user_profile_pic);
 const InsertImageDone=await User.InsertImage(user_profile_pic)
 console.log(InsertImageDone);
 if(InsertImageDone.rowCount > 0){
    console.log(InsertImageDone);
    res.send('Image Inserted Sucessfully')
 }else{
    res.send('Image Not Inserted')
 }
           
        } catch (error) {
            next(error.message)
        }
    })
}

module.exports={
    UploadImage
}