const { nextTick, async } = require("q")
const User=require('../model/HelperUpdateMobileModel')
const upload =require('../Middleware/upload').single('helper_profile_pic')


const MobileUpdate=async(req,res,next)=>{
    try {
        if(req.apikeyVerify = 'valid'){
            upload(req, res, async (err) => {
           let user_id=req.body.user_id
           let User_id=parseInt(user_id)
           let helper_name=req.body.helper_name
           let helper_profile_pic=req.file.filename
           let helper_mobile=req.body.helper_mobile
           let mob_trim=helper_mobile.trim()
           let mobile=mob_trim.substr(-10)
           let mob_Limit=mob_trim.length
           let api_key=req.body.api_key
           let customer_id=req.body.customer_id
           let Customer_id=parseInt(customer_id)
           let helper_last_name=req.body.helper_last_name
           let updatedUser=null
           let UpdateMasterUser=null

           if(Customer_id == "" || User_id == "" || helper_name =="" || helper_profile_pic == "" || helper_mobile == "" || api_key == "" || helper_last_name == "" ){
            let failureInputResponse = {
                status: false,
                msg: 'Insufficient Parameters'
            }
            res.send(failureInputResponse);
            return false    
         }else{

           if (Customer_id != undefined && typeof(Customer_id == Number)) {

            let user_status=await User.IsUser_App(Customer_id,api_key)
            if(user_status != "valid"){
           
                res.send(user_status)
            }else{
                if(User_id != undefined && typeof(User_id == Number)){

                    if( helper_name != undefined ){

                        if(mobile != undefined){
                           
                            if(!mobile.match(/[^0-9 +]/i) && mob_Limit <= "15" && mob_Limit >= "10"){
                               
                                if(helper_profile_pic != undefined){

                                    let upload_path="uploads/"+ Customer_id + "/helper/" + helper_name + "_" ;

                                    let file_name=upload_path + " " +helper_profile_pic
                                
                                let UserUpdate=[helper_name,helper_last_name,mobile,file_name,User_id]
                                
                                 updatedUser=await User.UserUpdateAll(UserUpdate)

                                let MasterUserUpdate=[helper_name,helper_last_name,mobile,file_name,user_id]

                                 UpdateMasterUser=await User.MasterUserUpdateAll(MasterUserUpdate)
                               } else{
                                let UserUpdate=[helper_name,helper_last_name,mobile,User_id]
                                
                                 updatedUser=await User.UserUpdateAllExceptImage(UserUpdate)

                                let MasterUserUpdate=[helper_name,helper_last_name,mobile,User_id]

                                 UpdateMasterUser=await User.MasterUserUpdateAllExceptImage(MasterUserUpdate)
                               }
                               if(updatedUser.rowCount > 0 && UpdateMasterUser.rowCount > 0) {
                                let SucessResult={
                                    result:true,
                                    message:"data updated successfully"
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
                                let InvalidMobileNoResult={
                                    result:false,
                                    message:"Invalid mobile number"
                                }
                                res.status(400).send(InvalidMobileNoResult)
                            }
                        }else{
                            let EmptyMobileNoResult={
                                result:false,
                                message:"Please enter mobile number"
                            }
                            res.status(400).send(EmptyMobileNoResult)
                        }
                    }else{
                        let EmptyHelperNameResult={
                            result:false,
                            message:"Please enter helper name"
                        }
                        res.status(400).send(EmptyHelperNameResult)
                    }
                }else{
                    let EmptyHelperIdResult={
                        result:false,
                        message:"Helper id can not be blank and should contain Numeric characters only"
                    }
                    res.status(400).send(EmptyHelperIdResult)
                }
            }
           }else{
            let EmptyCustomerIdResult={
                result:false,
                message:"Customer id can not be blank and should contain Numeric characters only"
            }
            res.status(400).send(EmptyCustomerIdResult)
           }
        }
        })
        }
    } catch (error) {
        next(error.message)
    }
}


module.exports={
    MobileUpdate
}