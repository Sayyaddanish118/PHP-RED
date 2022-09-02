const { emptyQuery } = require("pg-protocol/dist/messages");
const { async } = require("q");
const upload =require('../Middleware/upload').single('profile_pic')
const Driver=require('../model/DriverUpdateModel')


const DriverUpdateController=async(req,res,next)=>{
    try {
        if (req.apikeyVerify = 'valid') {
            upload(req,res,async (err) =>{ 
                let id=req.body.driver_id
                let Id=parseInt(id)
                let driver_name=req.body.driver_name
                let profile_pic=req.file.filename
                let driver_mobile=req.body.driver_mobile
                let mob_trim=driver_mobile.trim()
                let mobile=mob_trim.substr(-10)
                let mob_Limit=mob_trim.length
                let email=req.body.email
                let api_key=req.body.api_key
                let customer_id=req.body.customer_id
                let Customer_id=parseInt(customer_id)
                let driver_last_name=req.body.driver_last_name
                let updatedUser=null
                let updatedMasterUser=null

                if(Customer_id == "" || id == "" || driver_name =="" ||  driver_mobile == "" || api_key == "" || driver_last_name == "" ){
                    let failureInputResponse = {
                        status: false,
                        msg: 'Insufficient Parameters'
                    }
                    res.send(failureInputResponse);
                    return false    
                 } 
                 else{
                    if (Customer_id != undefined && typeof(Customer_id == Number)) {
                       
                        let user_status=await Driver.IsUser_App(Customer_id,api_key)
                         
                        if (user_status != 'valid') {
                            res.status(400).send(user_status)
                        }
                        else{
                              if(Id != undefined && typeof(Id == Number)){

                                if (driver_name != undefined) {
                                    
                                    if (mobile == undefined || !mobile.match(/[^0-9 +]/i) && mob_Limit <= "15" && mob_Limit >= "10" && mobile > 0) {
                                        
                                        if (profile_pic != undefined) {
                                            
                                            let upload_path='uploads/' + Customer_id + '/driver/' + driver_name 

                                            let upload_file=upload_path + '/'  + profile_pic

                                            let UserUpdate=[driver_name,driver_last_name,mobile,email,upload_file,Id]

                                             updatedUser=await Driver.UserUpdateAll(UserUpdate)

                                            let MasterUserUpdate=[driver_name,driver_last_name,mobile,email,upload_file,Id]

                                             updatedMasterUser=await Driver.MasterUserUpdateAll(MasterUserUpdate)
                                        }else{

                                            let UserUpdate=[driver_name,driver_last_name,mobile,email,Id]
                                           
                                            updatedUser=await Driver.UserUpdateAllExceptImage(UserUpdate)

                                            let MasterUserUpdate=[driver_name,driver_last_name,mobile,email,Id]

                                             updatedMasterUser=await Driver.MasterUserUpdateAllExceptImage(MasterUserUpdate)


                                        }

                                        if(updatedUser.rowCount > 0 && updatedMasterUser.rowCount > 0){
                                            let SucessResult={
                                                result:true,
                                                message:"User updated successfully"
                                            }
                                            res.status(200).send(SucessResult)
                                        }else{
                                            let ErrorResult={
                                                result:false,
                                                message:"No results found"
                                            }
                                            res.status(404).send(ErrorResult)
                                        }
                                    }else{
                                        let InvalidMobileNumber={
                                            result:false,
                                            message:"Invalid Mobile number"
                                        }
                                        res.status(404).send(InvalidMobileNumber)
                                    }
                                }else{
                                    let InvalidDriverName={
                                        result:false,
                                        message:"Please enter driver name"
                                    }
                                    res.status(404).send(InvalidDriverName)
                                }
                            }else{
                                let InvalidDriverId={
                                    result:false,
                                    message:"Driver id can not be blank and should contain Numeric characters only"
                                }
                                res.status(404).send(InvalidDriverId)
                            }
                        }
                    } else{
                        let InvalidCustomerId={
                            result:false,
                            message:"Customer id can not be blank and should contain Numeric characters only"
                        }
                        res.status(404).send(InvalidCustomerId)
                    }
                 }
            })
        }
    } catch (error) {
        next(error.message)
    }
}


module.exports={
    DriverUpdateController
}