const bcrypt = require('bcrypt');
const { response} = require('express');
const { async} = require('q');
var dbConnect = require('../db');
var client = dbConnect.client;
var datetime = require('node-datetime');
var dt = datetime.create();
var thisYear = dt.format('Y')
var todaysDate = dt.format('Y-m-d')


//------Date Method----------------
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

let getUserByEmail = (req, callback, next) => {
 let username = req.body.username;
    // console.log(username)
    let selectUser = "SELECT user_id,user_name,user_role,user_last_name,user_profile_pic,user_password,user_customer_id,user_status,user_joining_date	 FROM master_user WHERE (user_role='customer') AND (user_status !='removed') AND (user_email is not NULL AND lower(user_email)=$1) OR (user_mobile is not NULL AND lower(user_mobile)=$2)";

    client['master'].query(selectUser, [username, username], (err, result) => {
        if (err) throw err;
        console.log(result)
        return callback(result)

    })

}

let passwordVerification = async (result, password, next) => {
    let storedPassWord = result.rows[0].user_password;
    let storedPassWord2 = result.rows[0].user_password;
    // console.log(storedPassWord)
    // console.log(storedPassWord2)

    let nodeVersionPassword = storedPassWord.replace('$2y$', '$2a$');

    let afterComparePassword = await bcrypt.compare(password, nodeVersionPassword)
    // console.log(afterComparePassword);
    return afterComparePassword

}

let updateUser = (device_os, unknownUserResponse, next) => {
    let customer_id = unknownUserResponse.user.user_customer_id;
    let user_id = unknownUserResponse.user.user_id;
    let todayDateVlaue = todayDate();
    let queryValue = [todayDateVlaue, device_os, todayDateVlaue, device_os, user_id]
    dbConnect.getCustomerDb(customer_id);
    let testSelect = "UPDATE public.tsb_user SET user_last_access=$1,user_access_mode=$2,user_last_login=$3,user_last_login_mode=$4 WHERE user_id=$5 returning user_id";
     client['master'].query(testSelect, queryValue, (err, result) => {
        if (err) throw err;
        // console.log(result);
         return result
         })

}

let checkCustomer = async (unknownUserResponse) => {
    let customerId = unknownUserResponse.user.user_customer_id;
    dbConnect.connectMasterDb();
    let queryCheckCustomer = "SELECT 	customer_id,customer_name,customer_mobile,customer_email,customer_api_key,customer_status,customer_time_zone,customer_transportation_type FROM master_customer WHERE customer_id =$1";

    var result = await client['master'].query(queryCheckCustomer, [customerId]);
    if (result.rowCount != 0) {
        return result.rows[0]
    } else {
        return []
    }

}
//////////////////////////////////////////////////////////////////later countinue
let set_Timezone = async (customer_time_zone_id) => {
    let timeZoneQuery = "SELECT timezone_id,timezone_name,timezone_utc_offset FROM public.master_timezone WHERE timezone_id=$1";
    let timeZonerResult = await client['master'].query(timeZoneQuery, [customer_time_zone_id]);
    return timeZonerResult.rows[0]
}

let getUserApps = async (unknownUserResponse, device_id, device_os, next) => {
    let customer_id = unknownUserResponse.user.user_customer_id;
    let userId = unknownUserResponse.user.user_id;
    // console.log(customer_id);
    // console.log(userId);
    // console.log(device_os);
    // console.log(device_id);
    let selectToDltQuery = "SELECT * FROM public.tsb_user_apps WHERE user_apps_user_id=$1 AND user_apps_device_id=$2  AND user_apps_device_os=$3"
    // console.log(selectToDltQuery);
    let dataBeforeDelete = await client['master'].query(selectToDltQuery, [userId, device_id, device_os]);
    // console.log(dataBeforeDelete);
    return dataBeforeDelete
}


let deleteUserApps = async (unknownUserResponse, device_id, device_os, next) => {
    let customer_id = unknownUserResponse.user.user_customer_id;
    let userId = unknownUserResponse.user.user_id;
       let deleteAllQuery = "DELETE FROM public.tsb_user_apps WHERE user_apps_user_id !=$1 AND user_apps_device_id=$2  AND user_apps_device_os=$3";
    let deleteResult= await client['master'].query(deleteAllQuery, [userId, device_id, device_os]);
    // console.log(deleteResult);
 return deleteResult
}

let updateDeviceToken = async (unknownUserResponse, device_token, next) => {
    let customer_id = unknownUserResponse.user.user_customer_id;
    let userId = unknownUserResponse.user.user_id;

    let updataTokenQuery = "UPDATE public.tsb_user_apps SET user_apps_device_token = $1 WHERE  user_apps_user_id =$2 "
    let updatedResult = await client[customer_id].query(updataTokenQuery, [device_token, userId]);
    // console.log(updatedResult);
}

let insertAppDeviceDetail = async (unknownUserResponse, device_id, app_type, device_os, next) => {
    let customer_id = unknownUserResponse.user.user_customer_id;
    let userId = unknownUserResponse.user.user_id;

    let insertAppDeviceDetailQuery = " INSERT INTO public.tsb_user_apps (user_apps_user_id,user_apps_device_id,user_apps_type,user_apps_device_os) VALUES ($1,$2,$3,$4)"
    await client[customer_id].query(insertAppDeviceDetailQuery, [userId, device_id, app_type, device_os]);
}

let getMasterStatistics = async (unknownUserResponse, next) => {
    let customer_id = unknownUserResponse.user.user_customer_id;
    let masteStaticQuery = "SELECT * FROM public.master_statistics WHERE statistics_customer_id	= $1";
    let staticResult = await client['master'].query(masteStaticQuery, [customer_id]);
    return staticResult;
}

let deviceCount = async (unknownUserResponse, totalDevice, columnName, next) => {
    let customer_id = unknownUserResponse.user.user_customer_id;

    let deviceCountQuery = "UPDATE public.master_statistics SET " + columnName + "=$1 Where statistics_customer_id =$2"
    await client['master'].query(deviceCountQuery, [totalDevice, customer_id]);
}

let getStudent = async (unknownUserResponse, next) => {
    let customer_id = unknownUserResponse.user.user_customer_id;
    let userId = unknownUserResponse.user.user_id;
    console.log(customer_id);
    console.log(userId);

    let getStudentQuery = "SELECT student_id as employee_id,school_name as company_name,student_class as department_name,student_name as employee_name,student_address as employee_address,student_mobile as employee_mobile,student_admission_num as employee_code,student_email as employee_email,student_mifare_card_id as mifare_card_id,student_session as shift,student_dob as employee_dob,student_gender as gender,student_status as status,student_profilepicture as profilepicture,student_transportation as employee_transportation,student_division as division,student_nationality as nationality,student_landmark as employee_landmark,student_disability as employee_disability,student_blood_group as blood_group,student_last_name as employee_last_name,student_first_name as employee_first_name,student_communication_language as communication_language,student_city as employee_city,student_next_invoice_date as next_invoice_date,student_busfare_frequency as busfare_frequency,student_middle_name as employee_middle_name,student_door_number as employee_door_number,student_building_name as employee_building_name,student_street_name as employee_street_name,student_emergency_contact_name as employee_emergency_contact_name, student_emergency_contact_number as employee_emergency_contact_number,student_user_id as employee_user_id FROM public.tsb_student as a INNER JOIN public.et_school AS b ON b.school_id = a.student_school_id WHERE student_user_id = $1 AND student_type = 'Employee'  AND a.student_status = 'active'";

    let employeeDatas = await client[customer_id].query(getStudentQuery, [userId]);
    return employeeDatas;
}

let masterSettings = async (unknownUserResponse, next) => {
    let customer_id = unknownUserResponse.user.user_customer_id;

    let settingQuery = "SELECT settings_pickup_point_switch,settings_pickup_point_move,settings_cashless,settings_teacher_role,settings_busassistant_role,settings_schooling_leave,settings_trip_card,settings_green_card,settings_transport_type FROM master_settings WHERE settings_customer_id = $1";
    let settingResult = await client['master'].query(settingQuery, [customer_id]);
    return settingResult;
}

let masterLogo = async (unknownUserResponse, next) => {
    let customer_id = unknownUserResponse.user.user_customer_id;
    // console.log(customer_id);
     let LogoQuery = "SELECT logo_logo,logo_map_logo,logo_map_bus,logo_map_bus_available,logo_map_bus_untracked,logo_trip_start_point,logo_trip_end_point  FROM master_logo WHERE logo_customer_id = $1";
    let LogoResult = await client['master'].query(LogoQuery, [customer_id]);
    return LogoResult;
}

let chkMasterAddon = async (unknownUserResponse, next) => {
    let customer_id = unknownUserResponse.user.user_customer_id;

    let addonChkQuery = "SELECT addon_cashless,addon_autorouting,addon_manual_routing,addon_accountant,addon_tag_vendor,addon_support,addon_surveyor_planner,addon_command,addon_excursion FROM master_addon WHERE addon_customer_id=$1";
    let addonChkResult = await client['master'].query(addonChkQuery, [customer_id]);
    return addonChkResult;
}

let academicYear = async (unknownUserResponse, next) => {
    let customer_id = unknownUserResponse.user.user_customer_id;

    let academicQuery = "SELECT academic_year_start_date ,academic_year_end_date from master_academic_year WHERE academic_year_status='current' AND academic_year_customer_id = $1";
    let academicYearResult = await client['master'].query(academicQuery, [customer_id]);

    let academic_year_start_date = academicYearResult.rows[0].academic_year_start_date;
    let academic_year_end_date = academicYearResult.rows[0].academic_year_end_date;

    var dateFormetterS = datetime.create(academic_year_start_date);
    var aftrFromatAcademicStartDate = dateFormetterS.format('Y-m-d');

    var dateFormetterL = datetime.create(academic_year_end_date);
    var aftrFromatAcademicEndDate = dateFormetterL.format('Y-m-d');
    let academicYearData = {
        academic_year_end_date: aftrFromatAcademicStartDate,
        academic_year_start_date: aftrFromatAcademicEndDate
    }

    return academicYearData;

}

let sudentAttendence = async (studentId, unknownUserResponse, next) => {
    let customer_id = unknownUserResponse.user.user_customer_id;

    let yearstartdate = thisYear + '-01-01';
    let todayDate = todaysDate
    let attendenceQuery = "SELECT Distinct(attendance_date) from tsb_attendance where attendance_student_id=$1 and attendance_date BETWEEN '" + yearstartdate + "' AND '" + todayDate + "'";
    let attendenceResult = await client[customer_id].query(attendenceQuery, [studentId]);
    let presentdays = attendenceResult.rowCount;
    let totalworkingdays = getWorkingDays(yearstartdate, todayDate);
    let absentdayscount = totalworkingdays - presentdays;
    return absentdayscount;
}

let getWorkingDays = (yearstartdate, todayDate, next) => {
    let lastDate = Math.floor(new Date(todayDate).getTime() / 1000);
    let startDate = Math.floor(new Date(yearstartdate).getTime() / 1000);
    let days = (lastDate - startDate) / 86400 + 1;
    var no_remaining_days = days % 7;
    //console.log(no_remaining_days);
    let getDaysValue = getDayNumber(lastDate, startDate);

    let the_first_day_of_week = getDaysValue[0];
    let the_last_day_of_week = getDaysValue[1];

    if (the_first_day_of_week <= the_last_day_of_week) {
        if (the_first_day_of_week <= 6 && 6 <= the_last_day_of_week) {
            no_remaining_days--;
        }
        if (the_first_day_of_week <= 7 && 7 <= the_last_day_of_week) {
            no_remaining_days--;
        }
    } else {

        if (the_first_day_of_week == 7) {
            no_remaining_days--;

            if (the_last_day_of_week == 6) {
                no_remaining_days--;
            }
        } else {
            no_remaining_days -= 2;

        }
    }
    return no_remaining_days;
}

let getDayNumber = (lastDate, startDate, next) => {
    var dt = datetime.create(startDate);
    var startDateValue = dt.format('W');

    var dt = datetime.create(lastDate);
    var lastDateValue = dt.format('W');

    let days = ['dummpy', "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    let the_first_day_of_week = days.indexOf(startDateValue);
    let the_last_day_of_week = days.indexOf(lastDateValue);

    return [the_first_day_of_week, the_last_day_of_week];
}

let logoFromParentApp = async (unknownUserResponse, next) => {
    let customer_id = unknownUserResponse.user.user_customer_id;
    // console.log(customer_id);
    let queryGetLogo = "SELECT logo_parent_app	FROM tsb_logo WHERE logo_id =$1";
    let logoResult = await client[customer_id].query(queryGetLogo, [customer_id]);
    return logoResult;
}

// let AddonCashless = async (unknownUserResponse, next) => {
//     let customer_id = unknownUserResponse.user.addon_customer_id;
//     console.log(customer_id);
//     let ADDONCASHLESS = "SELECT addon_cashless,addon_autorouting,addon_manual_routing,addon_accountant FROM tsb_addon WHERE addon_customer=$1 ";
//     let addonResult = await client[customer_id].query(ADDONCASHLESS, [customer_id]);
//     return addonResult;
// }



module.exports = {
    getUserByEmail,
    passwordVerification,
    updateUser,
    checkCustomer,
    set_Timezone,
    getUserApps,
    deleteUserApps,
    insertAppDeviceDetail,
    updateDeviceToken,
    getMasterStatistics,
    deviceCount,
    getStudent,
    masterSettings,
    masterLogo,
    chkMasterAddon,
    academicYear,
    sudentAttendence,
    logoFromParentApp
}