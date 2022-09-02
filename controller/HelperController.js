const { async } = require("q");
const  User= require("../model/vehicle");

const HelperListController=async(req,res,next)=>{
    try {
        if(req.apikeyVerify = 'valid'){

            var customer_id = req.query.customer_id;
            var api_key = req.query.api_key;

            if (customer_id == '' || api_key == '') {
                let failureInputResponse = {
                    status: false,
                    msg: 'Insufficient Parameters'
                }
                res.send(failureInputResponse);
                return false    
            }else{
                if (typeof (customer_id == Number)) {
                var user_status = await User.IsUser_App(customer_id, api_key );
                
                if (user_status != "valid") {
                    res.status(400).send(user_status);
                    return false;
                 }else{
                    var rval=await User.HelperRole()
                    
                    if(rval.rowCount == 0){
                        let NoHelperResult={
                            result:false,
                            message:"There are no helpers added yet"
                        }
                        res.status(200).send(NoHelperResult)
                    }else{
                        let sql=await User.HelperData()
                        let Output={
                            result:true,
                            message:"data retrived sucessfully",
                            list:sql.rows
                        }
                        res.status(200).send(Output)
                    }
                 }
                }else{
                    ErrorOutput={
                        result:false,
                        message:"Customer id can not be blank and should contain Numeric characters only"
                    }
                    res.status(400).send(ErrorOutput)
                }
            }

        }
    } catch (error) {
        next(error.message)
    }

}



module.exports={
    HelperListController
}