const databasedb = require('../db/db')





// getUserById

let getUserById = async (customer_id) => {
    let customerQuery = "SELECT customer_id,customer_status from public.master_customer WHERE customer_id=$1";
    let customerResult = await databasedb.connectdb.query(customerQuery, [customer_id])
    
    return customerResult
}


// set_Timezone

let set_Timezone = async (customer_time_zone_id) => {
    let timeZoneQuery = "SELECT timezone_id,timezone_name,timezone_utc_offset FROM public.master_timezone WHERE timezone_id=$1";
    let timeZonerResult = await databasedb.connectdb.query(timeZoneQuery, [customer_time_zone_id]);
    return timeZonerResult.rows[0]
}



// UserApps Model

var UserApps = async (api_key) => {
    var getUserAppsQuery = 'SELECT user_apps_type,user_apps_id,user_apps_user_id,user_apps_device_token,user_apps_device_id,user_apps_device_os,user_apps_key FROM public.tsb_user_apps WHERE user_apps_key=$1';
    let getUserAppsResult =await databasedb.connectdb.query(getUserAppsQuery, [api_key]);
    // console.log(getUserAppsResult);
    return getUserAppsResult
}


// `User Model`

var User = async (user_id) => {
    let getUserQuery = "SELECT user_last_access,user_access_mode,user_id,user_customer_id,user_name,user_email,user_role,user_status FROM public.tsb_user WHERE user_id=$1"
    let getUserResult = await databasedb.connectdb.query(getUserQuery, [user_id]);

    return getUserResult
}



//  IsUser_App ModeL

var IsUser_App = async (customer_id, api_key, user_app_type) => {

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
        console.log(check_user.rows[0]);

        
        if (check_user.rowCount > 0) {
            // console.log(check_user);
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
                
                return (SettingOutdated);
            }
        }
        else {
            
        }
        return (Invalid_User);
    }
    else {
        return (InvalidCustomer);
    }
}
























// Objects

// isValidset Object 

var isValidset = {
    status: false,
    message: "Insufficient Parameters"
}

// Inactive_user Object

let Inactive_user={
    status:false,
    message: 'Your account is disabled by School,Please contact with your School authority for further details.'
}

// Removed_user Object

let Removed_user={
    status:false,
    message: 'Your account is deactivated by  School,Please contact with your School authority for further details.'
}

// settingOutdated Object

let SettingOutdated = {
    result:false,
    message:"It seems your settings out dated, please logout and login again!"
}

// invalid_User Object

let Invalid_User = { 
    result:false,
    message:"Invalid user authentication,Please try to relogin with exact credentials."
}

// invalidCustomer Object

let InvalidCustomer = { 
    result:false,
    message:"School account seems invalid. Please try to logout and login again with exact credentials!"
}

var class_list  = async (customer_id) => {
    let getUserQuery = "SELECT class_id, class_name FROM public.tsb_class WHERE class_status = 'active' "
    var getUserresult = await databasedb.connectdb.query(getUserQuery,[customer_id])
    return getUserresult
}




module.exports = {
    getUserById,
    set_Timezone,
    UserApps,
    User,
    IsUser_App,
    class_list,
    isValidset,
    Inactive_user,
    Removed_user,
    SettingOutdated,
    Invalid_User,
    InvalidCustomer
    
}