const { async } = require("q");
const User=require('../model/vehicle')

const TeacherList=async(req,res,next)=>{
try {
    if(req.apikeyVerify = 'valid'){
        let customer_id=req.query.customer_id
        let api_key=req.query.api_key

        if(customer_id == "" || api_key == "" ){
            let failureInputResponse = {
                status: false,
                msg: 'Insufficient Parameters'
            }
            res.send(failureInputResponse)
        }

        if(customer_id != "" && typeof (tomer_id == 'number')){
            let user_status=User.IsUser_App(customer_id,api_key)

            if(user_status != "valid"){
                res.send(user_status)
            }

            let teacher=await User.teacherList()
             if(teacher.rowCount > 0){
                let Result={
                    result:true,
                    message:"retrieved",
                    teacherList:teacher.rows[0]
                }
                res.status(200).send(Result)
             }else{
                let ElseResult={
                    result:true,
                    message:"Customer_id and Api key Mismatch"
                }
                res.status(404).send(ElseResult)
             }
        }else{
            let InvalidResult={
                result:true,
                message:"Customer id can not be blank and should contain Numeric characters only"
            } 
        }
    }
} catch (error) {
    next(error.message)
}
}

module.exports={
    TeacherList
}