const { async } = require("q");
const User=require('../model/vehicle')
const params=require('../Config/params')
const upload =require('../Middleware/upload').single('user_profile_pic')




const ChangePasswordById=async(req,res,next)=>{
    try {
        if (req.apikeyVerify = 'valid'){
            upload(req, res, async (err) => {
        var customer_id=req.body.customer_id
        var user_id=req.body.user_id
        var new_password=req.body.new_password
        var current_password=req.body.current_password
        var api_key=req.body.api_key

        console.log(customer_id);
        console.log(user_id);

        if(customer_id == "" || user_id == "" || new_password == "" || current_password == "" || api_key == ""){
            let failureInputResponse = {
                status: false,
                msg: 'Insufficient Parameters'
            }
            res.send(failureInputResponse)
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
//Line no 56 to 58 Not Done
                if(user_id != undefined){
                    if(new_password != undefined){

                        let checkValid=await User.MasterUser(user_id)
                        // console.log(checkValid.rows[0]);
                        let passverification=await  User.passwordVerification(checkValid,current_password)

                        if(checkValid.rows[0] != undefined && passverification == true){
                           let New_Password=await User.generatePasswordHash(new_password,user_id)
                             let UpdatedUser=New_Password
                             if(UpdatedUser){
                                let SucessResult={
                                    result:true,
                                    message:"Password Changed Successfully"
                                }
                                res.send(SucessResult)
                             }else{
                                let FailureResult={
                                    result:false,
                                    message:"Problem in Change Password"
                                }
                                res.send(FailureResult)
                             }
                        }else{
                            let IncorrectPasswordResult={
                                result:false,
                                message:"Incorrect Old Password!"
                            }
                            res.send(IncorrectPasswordResult)
                        }
                    }else{
                        let EmptyNewPasswordResult={
                            result:false,
                            message:"Please Enter New Password"
                        }
                        res.send(EmptyNewPasswordResult)
                    }
                }else{
                    let EmptyUserID={
                        result:false,
                        message:"Please enter user id"
                    }
                    res.send(EmptyUserID)
                }
            }
            }
        }else{
            let InvalidParameters={
                result:false,
                message:"Customer id can not be blank and should contain Numeric characters only"
            }
            res.send(InvalidParameters)
        }
    }) 
    }
    } catch (error) {
        next(error.message)
    }
}


module.exports={
    ChangePasswordById
}