const {
    async
} = require('q');
var dbConnect = require('../db');
var client = dbConnect.client;

let getCstomerStatus = async (customer_id, next) => {
    dbConnect.connectMasterDb();
    let getCustomQuery = 'SELECT customer_id,customer_status FROM master_customer where customer_id=$1';
    let customerStatus = await client['master'].query(getCustomQuery, [customer_id]);
    return customerStatus;
}

let getApiKey = async (customer_id, api_key, next) => {
    appKeyQuery = "SELECT * FROM tsb_user_apps WHERE user_apps_key =$1 ";
    let getApiKeyData = await client['master'].query(appKeyQuery, [api_key]);

    return getApiKeyData;
}

let getUserInfo = async (appUserId, customer_id, next) => {
    let chkUserStatusQuery = " SELECT * FROM public.tsb_user WHERE user_id=$1";
    let gotUserStatus = await client['master'].query(chkUserStatusQuery, [appUserId]);
    return gotUserStatus;
}

let statusUpdate = async (customer_id, user_last_access, user_access_mode, user_id, next) => {
    let updateQuery = 'UPDATE tsb_user SET user_last_access=$1,user_access_mode=$2 WHERE user_id=$3';
    let updatedResult = await client['master'].query(updateQuery, [user_last_access, user_access_mode, user_id]);
    return updatedResult;
}
let schoolCustomer = async (customer_id, next) => {
    let customerDataQuery = "SELECT customer_name as destination,customer_browser_google_key,customer_latitude as dest_lat,customer_longitude as dest_long,customer_school_geofence,customer_pickup_geofence,customer_weekend_days FROM tsb_customer WHERE customer_id=$1";
    let customerDetail = await client[customer_id].query(customerDataQuery, [customer_id]);
    return customerDetail;
}

let checkStudent = async (customer_id, admission_num, next) => {
    let findStudentQuery = "SELECT student_id FROM tsb_student WHERE student_admission_num=$1";
    let validStudent = await client[customer_id].query(findStudentQuery, [admission_num]);
    return validStudent;
}

let getStudentInfo = async (admission_num, cur_sysdate, cur_systime, current_time, customer_id, next) => {
    let sql = "select distinct f.trip_id,a.student_id,a.student_name,b.pickup_pickup_point_id,pp.pickup_point_trip_id as pickup_route_id,c.vehicle_id,c.vehicle_number,c.vehicle_reg_no,c.vehicle_imei,c.vehicle_model_no,d.vehicle_type_code as vehicle_type,d.vehicle_type_description,e.shift_id,pp.pickup_point_name, pp.pickup_point_latitude, pp.pickup_point_longitude, f.trip_type,f.trip_time,f.trip_start_time,f.trip_end_time,f.trip_category, u.user_name as driver_name, u.user_mobile as driver_mobile,u.user_profile_pic as driver_image,u1.user_name as helper_name, u1.user_mobile as helper_mobile,u1.user_profile_pic as helper_image,f.trip_name,e.shift_name,e.shift_start_time,e.shift_end_time from tsb_student a join tsb_pickup b on a.student_id=b.pickup_student_id and (('" + cur_sysdate + "' >= pickup_from_date and '" + cur_sysdate + "' <= pickup_to_date) or (pickup_from_date IS NULL and pickup_to_date IS NULL)) join tsb_pickup_point pp on pp.pickup_point_id=b.pickup_pickup_point_id join tsb_shift e on e.shift_id=student_session join tsb_trip f on  f.trip_id=pp.pickup_point_trip_id  join tsb_vehicle c on f.trip_vehicle_id=c.vehicle_id left join tsb_vehicle_type d on c.vehicle_type=d.vehicle_type_id join tsb_user u on user_id=trip_driver_id left join tsb_user u1 on u1.user_id=trip_helper_id where a.student_admission_num='" + admission_num + "' and a.student_status='active' and b.pickup_status='active' and c.vehicle_status='active' and d.vehicle_type_status='active' and e.shift_status='active' and f.trip_status='active' AND  TRIP_START_TIME >='" + cur_systime + "' and TRIP_START_TIME<='" + current_time + "'";
    let students = await client[customer_id].query(sql);
    return students;
}




module.exports = {
    getCstomerStatus,
    getApiKey,
    getUserInfo,
    statusUpdate,
    schoolCustomer,
    checkStudent,
    getStudentInfo,
}