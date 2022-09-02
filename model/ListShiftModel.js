const bcrypt = require('bcrypt');
const { response} = require('express');
const { async} = require('q');
var dbConnect = require('../db');
var client = dbConnect.client;
var datetime = require('node-datetime');
var dt = datetime.create();
var thisYear = dt.format('Y')
var todaysDate = dt.format('Y-m-d')



// UserApps Model

let UserApps = async (api_key) => {
    var getUserAppsQuery = 'SELECT user_apps_type,user_apps_id,user_apps_user_id,user_apps_device_token,user_apps_device_id,user_apps_device_os,user_apps_key FROM public.tsb_user_apps WHERE user_apps_key=$1';
    let getUserAppsResult =await client['master'].query(getUserAppsQuery, [api_key]);
    // console.log(getUserAppsResult);
    return getUserAppsResult
}


// User Model

let User = async (user_id) => {
    let getUserQuery = "SELECT user_last_access,user_access_mode,user_id,user_customer_id,user_name,user_email,user_role,user_status FROM public.tsb_user WHERE user_id=$1"
    let getUserResult = await client['master'].query(getUserQuery, [user_id]);

    return getUserResult
}



//  IsUser_App Model

let IsUser_App = async (customer_id, api_key, user_app_type) => {

    let getCustomerStatusAndId = await getUserById(customer_id)
    
    if (getCustomerStatusAndId.rowCount > 0) {
        
        let timeZoneResult = await set_Timezone(getCustomerStatusAndId.rows[0].customer_id);
        
        if (getCustomerStatusAndId.rows[0].customer_status == 'inactive') {
            return (Inactive_customer);
        }

        else if (getCustomerStatusAndId.rows[0].customer_status == 'removed') {
            return (Removed_customer);

        }

        var check_user = await UserApps(api_key)
        // console.log(check_user.rows[0]);
        
        // console.log(check_user.rowCount);
        if (check_user.rowCount > 0) {
            
            if (check_user.rows[0].user_apps_type != undefined) {
                
                var user_id = check_user.rows[0].user_apps_user_id;
                
                var user_info = await User(user_id);
                
                var user_status = user_info.rows[0].user_status;
                
                if (user_status == 'inactive') {
                    return (Inactive_user);
                }
                else if (user_status == 'removed') {
                    return Removed_user;
                }

                return "valid";

            } else {
                
                return (settingOutdated);
            }
        }
        else {
            
            return (invalid_User);
        }
    }
    else {
        return (invalidCustomer);
    }
}






// getUserById

let getUserById = async (customer_id) => {
    let customerQuery = "SELECT customer_id,customer_status from public.master_customer WHERE customer_id=$1";
    let customerResult = await client['master'].query(customerQuery, [customer_id])
    
    return customerResult
}


// set_Timezone

let set_Timezone = async (customer_time_zone_id) => {
    let timeZoneQuery = "SELECT timezone_id,timezone_name,timezone_utc_offset FROM public.master_timezone WHERE timezone_id=$1";
    let timeZonerResult = await client['master'].query(timeZoneQuery, [customer_time_zone_id]);
    return timeZonerResult.rows[0]
}



// rval function for Saving Query of tsb_logo Table

let rval = async () => {

    var rvalData = " SELECT * FROM public.tsb_shift WHERE shift_status = 'active' ORDER BY shift_start_time "
    var savervalData = await client['master'].query(rvalData);
    
    return savervalData;

}


// Objects

// isValidset Object 

var isValidset = {
    status: false,
    message: "Insufficient Parameters"
}

// settingOutdated Object

let settingOutdated = {
    result:false,
    message:"It seems your settings out dated, please logout and login again!"
}

// invalid_User Object

let invalid_User = { 
    result:false,
    message:"Invalid user authentication,Please try to relogin with exact credentials."
}

// invalidCustomer Object

let invalidCustomer = { 
    result:false,
    message:"School account seems invalid. Please try to logout and login again with exact credentials!"
}







module.exports = {
    IsUser_App,
    UserApps,
    User,
    set_Timezone,
    getUserById,
    rval,
    isValidset ,
    invalid_User,
    invalid_User,
    settingOutdated
}
