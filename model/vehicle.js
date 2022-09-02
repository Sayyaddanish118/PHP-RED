const bcrypt = require('bcrypt');
const { response} = require('express');
const { async} = require('q');
var dbConnect = require('../db');
var client = dbConnect.client;
var datetime = require('node-datetime');
var dt = datetime.create();
var thisYear = dt.format('Y')
var todaysDate = dt.format('Y-m-d')

function todayDate() {
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();
    var today = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;

    return today;
}

let getUserById =async (customer_id) => {
    // console.log(customer_id);
    let customerQuery = "SELECT customer_id,customer_status from public.master_customer WHERE customer_id=$1";
    let customerResult =await client['master'].query(customerQuery, [customer_id])
    // console.log(customerResult);
 return customerResult
}

let set_Timezone = async (customer_time_zone_id) => {
    let timeZoneQuery = "SELECT timezone_id,timezone_name,timezone_utc_offset FROM public.master_timezone WHERE timezone_id=$1";
    let timeZonerResult = await client['master'].query(timeZoneQuery, [customer_time_zone_id]);
    return timeZonerResult.rows[0]
}

let UserApps=async(api_key)=>{
    var getUserAppsQuery='SELECT user_apps_type,user_apps_id,user_apps_user_id,user_apps_device_token,user_apps_device_id,user_apps_device_os,user_apps_key FROM public.tsb_user_apps WHERE user_apps_key=$1';
    let getUserAppsResult = await client['master'].query(getUserAppsQuery, [api_key]);
    return getUserAppsResult
}

let User=async(user_id)=>{
    let getUserQuery="SELECT user_last_access,user_access_mode,user_id,user_customer_id,user_name,user_email,user_role,user_status FROM public.tsb_user WHERE user_id=$1"
    let getUserResult=client['master'].query(getUserQuery,[user_id]);
    return getUserResult
}

let MasterUser=async(user_id)=>{
    let getMasterUserQuery="SELECT * FROM public.master_user WHERE user_id=$1 AND user_status='active' "
    let getMasterUserResult=client['master'].query(getMasterUserQuery,[user_id]);
    return getMasterUserResult
}


let MasterUserByEmail=async(user_email,user_id)=>{
    let getMasterUserQuery="SELECT * FROM public.master_user WHERE user_email=$1 AND user_status='active' AND user_id !=$2 "
    let getMasterUserResult=client['master'].query(getMasterUserQuery,[user_email,user_id]);
    return getMasterUserResult
}

let MasterUserByMobile=async(user_mobile,user_id)=>{
    let getMasterUserQuery="SELECT * FROM public.master_user WHERE user_mobile=$1 AND user_status='active' AND user_id !=$2 "
    let getMasterUserResult=client['master'].query(getMasterUserQuery,[user_mobile,user_id]);
    return getMasterUserResult
}

let UserData=async(user_id)=>{
    let getUserQuery="SELECT user_id,user_customer_id,user_name,user_email,user_mobile,user_role,user_status,user_last_name,user_dob,user_gender,user_address,user_city,user_profile_pic,user_internal_no,user_joining_date,user_nationality,user_email_verification FROM public.tsb_user WHERE user_id=$1 AND user_status='active'"
    let getUserResult=await client['master'].query(getUserQuery,[user_id]);
    return getUserResult
}

let Inactive_customer={
    status:false,
    message: `Your School account is inactive or expired now,Please contact  support for further details.`
}

let Removed_customer={
    status:false,
    message: 'Your School account is deactivated by Track School Bus Administrator,Please contact Track School Bus support for further details.'
}

let Inactive_user={
    status:false,
    message: 'Your account is disabled by School,Please contact with your School authority for further details.'
}

let Removed_user={
    status:false,
    message: 'Your account is deactivated by  School,Please contact with your School authority for further details.'
}

let settingOutdated={
    result:false,
    message:"It seems your settings out dated, please logout and login again!"
}

let invalid_User={
    result:false,
    message:"Invalid user authentication,Please try to relogin with exact credentials."
}

let invalidCustomer={
    result:false,
    message:"School account seems invalid. Please try to logout and login again with exact credentials!"
}

let Save=(user_info,check_user)=>{
    let User_last_access=todayDate()
    let user_access_mode=check_user.rows[0].user_apps_device_os
    let user_id=user_info.rows[0].user_id
    let SaveQuery='UPDATE public.tsb_user SET user_last_access=$1,user_access_mode=$2 WHERE user_id=$3'
    let SaveResult=client['master'].query(SaveQuery,[User_last_access,user_access_mode,user_id])
    return SaveResult
}

let IsUser_App=async(customer_id,api_key,user_app_type)=>{

       let getCustomerStatusAndId=await getUserById(customer_id);
    //    console.log(getCustomerStatusAndId);
       if(getCustomerStatusAndId.rowCount > 0){
       let timeZoneResult=await set_Timezone(getCustomerStatusAndId.rows[0].customer_id);
       if(getCustomerStatusAndId.rows[0].customer_status == 'inactive'){
            return Inactive_customer;
       }
       else if(getCustomerStatusAndId.rows[0].customer_status == 'removed'){
        return Removed_customer;
       }

       var check_user=await UserApps(api_key)
    //    console.log(check_user);
       if(check_user.rowCount > 0){
        // console.log(check_user.rowCount);
           if(check_user.rows[0].user_apps_type != undefined){
            //   console.log(check_user.rows[0].user_apps_type);
              var user_id=check_user.rows[0].user_apps_user_id;

               var user_info=await User(user_id);

               var user_status=user_info.rows[0].user_status;

               if(user_status == 'inactive'){
                return Inactive_user;
                 }
                 else if(user_status == 'removed'){
                return Removed_user;
                 }

                await Save(user_info,check_user)
                 return "valid";
           }else{
            return settingOutdated;
           }  
        }
        else{
            return invalid_User;
        }
       }else{
         return invalidCustomer;
       }
}

let newDate=()=>{
    let today=new Date()
const utcDay = today.getUTCDate();  
const utcMonth = today.getUTCMonth(); 
const utcYear = today.getUTCFullYear();    
var result=utcYear + "-" + utcMonth +  "-" + utcDay ;
return result;
}

// var School=()=>{
//     var SchoolQuery='SELECT customer_name as destination,customer_browser_google_key,customer_latitude as dest_lat,customer_longitude as dest_long FROM tsb_customer'
//     var SchoolResult=client['master'].query(SchoolQuery,[])
//     return School
// }

// var Language=()=>{

// }

let passwordVerification = async (checkValid, password, next) => {
 let storedPassWord = checkValid.rows[0].user_password;
 let nodeVersionPassword = storedPassWord.replace('$2y$', '$2a$');
 let afterComparePassword = await bcrypt.compare(password, nodeVersionPassword)
//  console.log(afterComparePassword);
    return afterComparePassword

}




let generatePasswordHash = async (new_password, email, next) => {
    const hash = await bcrypt.hash(new_password, 10);

    let insertNewPswdQuery = "UPDATE master_user SET user_password=$1 WHERE user_id=$2 AND user_status='active'";
    let resultOfNewPaswd = await client['master'].query(insertNewPswdQuery, [hash, email]);
    return resultOfNewPaswd;
}

// let teacherList=async()=>{
//     let teacherQuery="SELECT user_id as teacher_id,user_name as name,user_last_name as teacher_last_name,teacher_designation,user_profile_pic as profile_image,user_email as teacher_email,user_mobile as teacher_mobile FROM tsb_user u JOIN tsb_teacher t ON t.teacher_id=u.user_id WHERE t.teacher_status='active' ";
//     let teacherResult=await client['master'].query(teacherQuery,[])
//     return teacherResult
// }

let MasterUserUpdateAll=async(MasterUserUpdateDetails)=>{
    const user_mobile=MasterUserUpdateDetails[0]
    // console.log(user_mobile);
    const user_name=MasterUserUpdateDetails[1]
    const user_last_name=MasterUserUpdateDetails[2]
    const user_email=MasterUserUpdateDetails[3]
    const user_dob=MasterUserUpdateDetails[4]
    const user_gender=MasterUserUpdateDetails[5]
    const user_city=MasterUserUpdateDetails[6]
    const user_nationality=MasterUserUpdateDetails[7]
    const user_address=MasterUserUpdateDetails[8]
    const user_profile_pic=MasterUserUpdateDetails[9]
    const user_id=MasterUserUpdateDetails[10]
    let UpdateQuery="UPDATE public.master_user SET user_mobile=$1,user_name=$2,user_last_name=$3,user_email=$4,user_dob=$5,user_gender=$6,user_city=$7,user_nationality=$8,user_address=$9,user_profile_pic=$10  WHERE user_id=$11";
    let UpdatedResult=await client['master'].query(UpdateQuery,[user_mobile,user_name,user_last_name,user_email,user_dob,user_gender,user_city,user_nationality,user_address,user_profile_pic,user_id])
    // console.log(UpdatedResult);
    return UpdatedResult
}


let UserUpdateAll=async(UserUpdateDetails)=>{
    const user_mobile=UserUpdateDetails[0]
    // console.log(user_mobile);
    const user_name=UserUpdateDetails[1]
    const user_last_name=UserUpdateDetails[2]
    const user_email=UserUpdateDetails[3]
    const user_dob=UserUpdateDetails[4]
    const user_gender=UserUpdateDetails[5]
    const user_city=UserUpdateDetails[6]
    const user_nationality=UserUpdateDetails[7]
    const user_address=UserUpdateDetails[8]
    const user_profile_pic=UserUpdateDetails[9]
    const user_id=UserUpdateDetails[10]
    let UpdateQuery="UPDATE public.tsb_user SET user_mobile=$1,user_name=$2,user_last_name=$3,user_email=$4,user_dob=$5,user_gender=$6,user_city=$7,user_nationality=$8,user_address=$9,user_profile_pic=$10  WHERE user_id=$11";
    let UpdatedResult=await client['master'].query(UpdateQuery,[user_mobile,user_name,user_last_name,user_email,user_dob,user_gender,user_city,user_nationality,user_address,user_profile_pic,user_id])
    return UpdatedResult
}

let MasterUserUpdateAllExceptImage=async(MasterUserUpdateDetails)=>{
    const user_name=MasterUserUpdateDetails[1]
    const user_last_name=MasterUserUpdateDetails[2]
    const user_email=MasterUserUpdateDetails[3]
    const user_dob=MasterUserUpdateDetails[4]
    const user_gender=MasterUserUpdateDetails[5]
    const user_city=MasterUserUpdateDetails[6]
    const user_nationality=MasterUserUpdateDetails[7]
    const user_address=MasterUserUpdateDetails[8]
    const user_id=MasterUserUpdateDetails[9]
    let UpdateQuery="UPDATE public.master_user SET user_mobile=$1,user_name=$2,user_last_name=$3,user_email=$4,user_dob=$5,user_gender=$6,user_city=$7,user_nationality=$8,user_address=$9  WHERE user_id=$10";
    let UpdatedResult=await client['master'].query(UpdateQuery,[user_mobile,user_name,user_last_name,user_email,user_dob,user_gender,user_city,user_nationality,user_address,user_id])
    return UpdatedResult
}

let UserUpdateAllExceptImage=async(UserUpdateDetails)=>{
    const user_mobile=UserUpdateDetails[0]
    const user_name=UserUpdateDetails[1]
    const user_last_name=UserUpdateDetails[2]
    const user_email=UserUpdateDetails[3]
    const user_dob=UserUpdateDetails[4]
    const user_gender=UserUpdateDetails[5]
    const user_city=UserUpdateDetails[6]
    const user_nationality=UserUpdateDetails[7]
    const user_address=UserUpdateDetails[8]
    const user_id=UserUpdateDetails[9]
    let UpdateQuery="UPDATE public.tsb_user SET user_mobile=$1,user_name=$2,user_last_name=$3,user_email=$4,user_dob=$5,user_gender=$6,user_city=$7,user_nationality=$8,user_address=$9  WHERE user_id=$10";
    let UpdatedResult=await client['master'].query(UpdateQuery,[user_mobile,user_name,user_last_name,user_email,user_dob,user_gender,user_city,user_nationality,user_address,user_id])
    return UpdatedResult
}

let UserAfterUpdate=async(user_id)=>{
let UserDataQuery="SELECT user_name,user_last_name,user_profile_pic FROM public.tsb_user WHERE user_id=$1";
let UserDataResult=await client['master'].query(UserDataQuery,[user_id])
return UserDataResult
}

var class_list=async()=> {
    let getClassQuery ="SELECT class_id, class_name FROM public.tsb_class WHERE class_status = 'active'  "
    let getUserresult = await client['master'].query(getClassQuery)
    return getUserresult
}

let InsertImage=async(user_profile_pic)=>{
    let InsertImageQuery="UPDATE Public.master_user SET user_profile_pic=$1 WHERE user_email='prajul@technoallianceindia.com'";
    let InsertImageResult=await client['master'].query(InsertImageQuery,[user_profile_pic]) ;
    // console.log(InsertImageResult);
    return InsertImageResult
}


let HelperRole=async()=>{
    let HelperRoleQuery="SELECT user_id FROM public.tsb_user WHERE  user_role='helper' AND user_status='active' ";
    let HelperRoleResult=client['master'].query(HelperRoleQuery)
    return HelperRoleResult
}

let HelperData=async()=>{
    let helperQuery="SELECT user_name as helper_name,user_mobile as helper_mobile,user_profile_pic as helper_profile_pic,user_email as helper_email,user_nationality as helper_nationality FROM tsb_user where user_status='active' and user_role='helper'";
    let HelperResult=client['master'].query(helperQuery)
    return HelperResult
}

module.exports={
    todayDate,
    getUserById,
    UserApps,
    IsUser_App,
    Save,
    User,
    UserData,
    newDate,
    MasterUser,
    MasterUserByEmail,
    MasterUserByMobile,
    passwordVerification,
    generatePasswordHash,
    MasterUserUpdateAll,
    UserUpdateAll,
    MasterUserUpdateAllExceptImage,
    UserUpdateAllExceptImage,
    UserAfterUpdate,
    class_list,
    InsertImage,
    HelperRole,
    HelperData
}
