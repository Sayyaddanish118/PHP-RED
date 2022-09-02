const { async } = require("q");
const User=require('../model/DriverListModel')

const DriverListController=async(req,res,next)=>{
try {
    if(req.apikeyVerify = 'valid'){
        let customer_id=req.query.customer_id
        let api_key=req.query.api_key

        if(customer_id != undefined && typeof(customer_id == Number)){
          let user_status=await User.IsUser_App(customer_id,api_key)
          if(user_status != 'valid'){
            res.status(400).send(user_status);
          }else{
            let rval1=await User.sql()

            if(rval1.rowCount > 0){
                let SucessResult={
                    result:true,
                    message:"retrieved",
                    list:rval1.rows
                }
                res.status(200).send(SucessResult)
            }else{
                let ErrorResult={
                    result:false,
                    message:"There are no drivers added yet",
                }
                res.status(200).send(ErrorResult)
            }
          }
        }else{
            let EmptyIdResult={
                result:false,
                message:"Customer id can not be blank and should contain Numeric characters only",
            }
            res.status(404).send(EmptyIdResult)
        }
    }
} catch (error) {
    next(error.message)
}
}


module.exports={
    DriverListController
}