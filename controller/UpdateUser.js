const { async } = require("q");
const User=require('../model/vehicle')
const upload =require('../Middleware/upload').single('user_profile_pic')
const params=require('../Config/params')
const path=require('path')
const fileupload=require('express-fileupload')


const UpdateUser=async(req,res,next)=>{
    try {
    
        if(req.apikeyVerify = 'valid'){
        upload(req, res, async (err) => {
            var customer_id=req.body.customer_id
            var user_id=req.body.user_id
            var user_name=req.body.user_name
            var user_email=req.body.user_email
            var user_mobile=req.body.user_mobile
            var user_last_name =req.body.user_last_name
            var user_gender=req.body.user_gender
            var user_city=req.body.user_city
            var user_nationality=req.body.user_nationality
            var user_address=req.body.user_address
            var user_dob=req.body.user_dob
            var api_key=req.body.api_key
            var user_profile_pic=req.file.filename

            if(customer_id == "" || user_id == "" || user_name =="" || user_email == "" || user_mobile == "" || user_last_name == "" || user_gender == "" || user_city == "" || user_nationality == "" || user_address == "" || user_dob == "" || api_key == "" || user_profile_pic == ""){
               let failureInputResponse = {
                   status: false,
                   msg: 'Insufficient Parameters'
               }
               res.send(failureInputResponse);
               return false    
            }

            if(customer_id != "" && typeof (customer_id == "number")){
               if(customer_id == params[0].DEMO_ACCOUNT_ID || customer_id == params[0].DEMO_ACCOUNT2_ID){
                   let result={
                       result:false,
                       message:"You are in Demo account.You have no privilege to access the action"
                   }
                   res.send(result)
               }else{
                   let user_status=await User.IsUser_App(customer_id,api_key)
                   if(user_status != "valid"){
                       res.send(user_status)
                   }else{

                   if(user_id != undefined){
                       let checkUser=await User.MasterUser(user_id)
                       if(checkUser.rowCount > 0){
                           let check_email=await User.MasterUserByEmail(user_email,user_id)

                           if(check_email.rowCount == 0){
                               let Check_mobile=await User.MasterUserByMobile(user_mobile,user_id)
                               if(Check_mobile.rowCount == 0){
                                   //Line no 90 not Done due to understanding issue
                                    //  let pattern=/[^0-9 +]/i;
                                   if(!user_mobile.match(/[^0-9 +]/i) && user_mobile.length <= "15" && user_mobile.length >= "7" && user_mobile > 0){
                                       if(user_profile_pic != undefined){
                                       

                                        var MasterUserUpdateDetails=[
                                            user_mobile,user_name,user_last_name,user_email,user_dob,user_gender,user_city,user_nationality,user_address,user_profile_pic,user_id
                                        ]
                                          
                                           let UpdateUser=await User.MasterUserUpdateAll(MasterUserUpdateDetails)
                                       

                                         var UserUpdateDetails=[
                                            user_mobile,user_name,user_last_name,user_email,user_dob,user_gender,user_city,user_nationality,user_address,user_profile_pic,user_id
                                        ]

                                           let UpdateParent=await User.UserUpdateAll(UserUpdateDetails)
                                       }else{
                                        var MasterUserUpdateDetails=[
                                            user_mobile,user_name,user_last_name,user_email,user_dob,user_gender,user_city,user_nationality,user_address,user_id
                                        ]
                                           let UpdateUser=await User.MasterUserUpdateAllExceptImage(MasterUserUpdateDetails)

                                           var UserUpdateDetails=[
                                            user_mobile,user_name,user_last_name,user_email,user_dob,user_gender,user_city,user_nationality,user_address,user_id
                                        ]

                                           let UpdateParent=await User.UserUpdateAllExceptImage(UserUpdateDetails)

                                       }

                                       let user_data=await User.UserAfterUpdate(user_id)
                                       let SucessResult={
                                           result:true,
                                           message:"User Updated Successfully",
                                           user:user_data.rows[0]
                                       }
                                       res.status(200).send(SucessResult)
                                   }else{
                                       let InvalidNumberResult={
                                           result:false,
                                           message:"Invalid Mobile number"
                                       }
                                       res.status(400).send(InvalidNumberResult)
                                   }
                               }else{
                                   let InvalidNumberAssignedResult={
                                       result:false,
                                       message:"This mobile number is already assigned for some other user"
                                   }
                                   res.status(400).send(InvalidNumberAssignedResult)
                               }
                           }else{
                               let InvalidEmailResult={
                                   result:false,
                                   message:"This email id is already assigned for some other user"
                               }
                               res.status(400).send(InvalidEmailResult)
                           }
                       }else{
                           let UnknownUserResult={
                               result:false,
                               message:"User does not exist!"
                           }
                           res.status(400).send(UnknownUserResult)
                       }
                   }else{
                       let InvalidUserResult={
                           result:false,
                           message:"Please enter user id"
                       }
                       res.status(400).send(InvalidUserResult)
                   }
                }
               }
           }else{
               let InvalidCustomerIdResult={
                   result:false,
                   message:"Customer id can not be blank and should contain Numeric characters only"
               }
               res.status(400).send(InvalidCustomerIdResult)
           }

      }) 
    }
    } catch (error) {
        next(error.message)
    }
}





module.exports={
    UpdateUser
}