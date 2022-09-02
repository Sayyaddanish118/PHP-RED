const { async} = require('q');
const vehicle=require('../model/vehicle')
var datetime = require('node-datetime');

const ViewUserDetails=async(req,res,next)=>{
    try {
        if(req.apikeyVerify = 'valid'){
        var customer_id=req.query.customer_id
        var api_key=req.query.api_key
        var user_id=req.query.user_id

        if(customer_id == "" || api_key == "" || user_id == "" ){
            let failureInputResponse = {
                status: false,
                msg: 'Insufficient Parameters'
            }
            res.send(failureInputResponse);
            return false
        }

        if(customer_id != "" && typeof (customer_id == "number")){
            let user_status=await vehicle.IsUser_App(customer_id,api_key);
            if(user_status != "valid"){
                return user_status
            }
            if(user_id != undefined){
                let check_user=await vehicle.UserData(user_id)
                console.log(check_user);
                if(check_user.rowCount > 0){
                    user_details=await vehicle.UserData(user_id)
                    if(user_details.rows[0] != undefined){
                        let result={
                            status:true,
                            message:"retrieved",
                            user_Details:user_details.rows[0]
                        }
                        res.send(result)
                    }else{
                        let ErrResult={
                            status:false,
                            message:"No result found",
                        }
                        res.send(ErrResult)
                    }
                }else{
                    let UserNotFoundResult={
                        status:false,
                        message:"User does not exist",
                    }
                    res.send(UserNotFoundResult)
                }
            }else{
                let UserIdBlankResult={
                    status:false,
                    message:"Please enter user id",
                }
                res.send(UserIdBlankResult)
            }
        }else{
            let InvalidInputs={
                status:false,
                message:"Customer id can not be blank and should contain Numeric characters only",
            }
            res.send(InvalidInputs)
        }
    }      
  } catch (error) {
        next(error.message)
    }
}



module.exports={
    ViewUserDetails
}