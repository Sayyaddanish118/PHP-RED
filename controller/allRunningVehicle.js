const { async} = require('q');
const vehicle=require('../model/vehicle')
var datetime = require('node-datetime');

const allRunningVehicleController=async(req,res,next)=>{
    try {
       var customer_id=req.body.customer_id;
       var api_key=req.body.api_key;
       var user_id=req.body.user_id;
// console.log(customer_id);
// console.log(api_key);
       if(customer_id == "" || api_key == ""){
        let failureInputResponse = {
            status: false,
            msg: 'Insufficient Parameters'
        }
        res.send(failureInputResponse);
        return false
       } else{
           if(customer_id !== "" && typeof (customer_id == "number") ){
          var  user_status=await vehicle.IsUser_App(customer_id,api_key);
          console.log(user_status);
           if(user_status != "valid"){
            return res.send(user_status);
         }
        //  if(){}
        var cur_sysdate=await vehicle.newDate()

// Line no69 to 86 not done because of no data is present in database
        // var school=        
    }
       }
    } catch (error) {
        next(error.message)
    }
}


module.exports={
    allRunningVehicleController
}