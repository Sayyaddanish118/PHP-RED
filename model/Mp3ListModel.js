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

let Mp3List=()=>{
    let ListQuery="SELECT audio_file,audio_title FROM tsb_audio"
    let ListResult=client['master'].query(ListQuery)
    return ListResult
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
    Mp3List
}