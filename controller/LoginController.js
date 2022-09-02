const { async} = require('q');
const user=require('../model/userLoginModel')
var datetime = require('node-datetime');
const upload =require('../Middleware/upload').single('user_profile_pic')

const employeeLogin = (req, res, next) => {
    try {
        /** INPUT FROM CLIENT SIDE */
        upload(req, res, async (err) => {
        let username = req.body.username;
        let password = req.body.password
        let app_type = req.body.app_type;
        let device_id = req.body.device_id;
        let device_os = req.body.device_os;
        let device_token = req.body.device_token;
        let customer_id=null;
        let user_key=null;
        /** INPUT FROM CLIENT SIDE */
        
        if (username == "" || password == ""  || device_id == "" || device_os == "" || device_token == "") {
            let failureInputResponse = {
                status: false,
                msg: 'Insufficient Parameters'
            }
            // console.log(failureInputResponse);
            res.send(failureInputResponse);
            return false
        }

        user.getUserByEmail(req, async (result) => {        //get the userMail
            if (result.rows[0] == undefined  || await user.passwordVerification(result, password) == false) {
                let unknownUserResponse = {
                    result: false,
                    message: 'Email and Password does not match'
                }
                res.send(unknownUserResponse)
            } else {
                let unknownUserResponse = {
                    result: true,
                    message: 'Employee logged in successfully',
                    user_id: result.rows[0].user_id,
                    user: result.rows[0]
                }

                user.updateUser(device_os, unknownUserResponse);

                let customerDetail = await user.checkCustomer(unknownUserResponse)
// console.log(customerDetail);
                if (customerDetail.customer_status == 'inactive') {
                    res.send({
                        message: `Your School account is inactive or expired now,Please contact ${customerDetail.customer_name} support for further details.`
                     })
                } 
                else if (customerDetail.customer_status == 'removed') {
                    res.send({ 
                        message: 'Your School account is deactivated by Track School Bus Administrator,Please contact Track School Bus support for further details.'
                    })
                }


                if (result.rows[0].user_status == 'inactive') {
                    res.send({
                        message: 'Your account is disabled by School,Please contact with your School authority for further details.'
                    });
                } else if (result.rows[0].user_status == 'removed'){
                    res.send({
                        message: 'Your account is deactivated by  School,Please contact with your School authority for further details.'
                    })
                }

                let timeZoneResult = await user.set_Timezone(customerDetail.customer_time_zone); //countinuee..

                let selectBeforeDlt = await user.getUserApps(unknownUserResponse, device_id, device_os);

             let deleteUserAPPS=await user.deleteUserApps(unknownUserResponse, device_id, device_os);

                if (selectBeforeDlt.rowCount > 0) {
                    // console.log(selectBeforeDlt.rowCount);
                    if (selectBeforeDlt.rows[0].user_apps_device_token != device_token) {
                        user.updateDeviceToken(unknownUserResponse, device_token); //ask the doubt about the version
                    }
                } 
                else  {

                    await user.insertAppDeviceDetail(unknownUserResponse, device_id, app_type, device_os); //ask the doubt about the version

                    let getMasterStatistics = await user.getMasterStatistics(unknownUserResponse);
                    if (getMasterStatistics.rowCount > 0) {
                       
                        if (device_os == 'android') {
                            let columnName = 'statistics_employee_android_count';
                            let androidDevice = parseInt(getMasterStatistics.rows[0].statistics_employee_android_count) + 1;
                            user.deviceCount(unknownUserResponse, androidDevice, columnName)

                        } else if (device_os == 'iOS') {
                            let columnName = 'statistics_parent_ios_count';
                            let iosDevice = parseInt(getMasterStatistics.rows[0].statistics_parent_ios_count) + 1;
                            user.deviceCount(unknownUserResponse, iosDevice, columnName)

                        }
                    }
                }

                
                let transMasterSettingDatas = await user.masterSettings(unknownUserResponse);
                let transportMasterLogoDatas=await user.masterLogo(unknownUserResponse);
                let addonDatas = await user.chkMasterAddon(unknownUserResponse);


                if (transMasterSettingDatas.rows[0].cashless_settings == 1 && addonDatas.rows[0].addon_cashless == 1) {
                    cashless = '1';
                } else {
                    cashless = '0';
                }


                res.status(200).send({
                    result: true,
                    message: 'Employee logged in successfully',
                    user_id: result.rows[0].user_id,
                    user: {
                        "user_id": result.rows[0].user_id,
                        "user_name":  result.rows[0].user_name,
                        "user_last_name":   result.rows[0].user_last_name,
                        "user_profile_pic": result.rows[0].user_profile_pic,
                    },
                    "customer_id":parseInt( customerDetail.customer_id),
                    "customer_first_name": customerDetail.customer_first_name,
                    "customer_role": customerDetail.customer_role,
                    "customer_last_name": customerDetail.customer_last_name,
                    "api_key": customerDetail.customer_api_key,
                    logos:{
                        logo:transportMasterLogoDatas.rows[0].logo_logo,
                        logo_map_logo:transportMasterLogoDatas.rows[0].logo_map_logo,
                        logo_map_bus:transportMasterLogoDatas.rows[0].logo_map_bus,
                        logo_available:transportMasterLogoDatas.rows[0].logo_map_bus_available,
                        logo_untracked:transportMasterLogoDatas.rows[0].logo_map_bus_untracked,
                        logo_trip_start_point:transportMasterLogoDatas.rows[0].logo_trip_start_point,
                        logo_trip_end_point:transportMasterLogoDatas.rows[0].logo_trip_end_point,
                    },
                    settings_teacher_role: transMasterSettingDatas.rows[0].settings_teacher_role,
                    settings_busassistant_role: transMasterSettingDatas.rows[0].settings_busassistant_role,
                    settings_schooling_leave: transMasterSettingDatas.rows[0].settings_schooling_leave,
                    settings_class_division: transMasterSettingDatas.rows[0].settings_class_division,
                    driver_attendance: transMasterSettingDatas.rows[0].settings_driver_attendance,
                    trip_card:transMasterSettingDatas.rows[0].settings_trip_card,
                    green_card:transMasterSettingDatas.rows[0].settings_green_card,
                    cashless: cashless,
                    addon:{
                      addon_cashless:addonDatas.rows[0].addon_cashless,
                      addon_autorouting:addonDatas.rows[0].addon_autorouting,
                      addon_manual_routing:addonDatas.rows[0].addon_manual_routing,
                      addon_accountant:addonDatas.rows[0].addon_accountant,
                      addon_tag_vendor:addonDatas.rows[0].addon_tag_vendor,
                      addon_support:addonDatas.rows[0].addon_support,
                      addon_surveyor_planner:addonDatas.rows[0].addon_surveyor_planner,
                      addon_command:addonDatas.rows[0].addon_command,
                      addon_excursion:addonDatas.rows[0].addon_excursion
                    }
                })
            }
        })
    })
    } catch (err) {
        next(err.message)
    }
}

module.exports = {
    employeeLogin
}