const TRIPDB = require('../model/Trip');
const PARAMS = require('../db/params.json');
var datetime = require('node-datetime');
var dt = datetime.create();

module.exports.apikeyVerify = async (req, res, next) => {
    //INPUT FROM CLIENT SIDE//
    let customer_id = req.query.customer_id;
    let api_key = req.query.api_key;
    //INPUT FROM CLIENT SIDE//
    let Customer_id=parseInt(customer_id)
    // console.log(Customer_id);

    let array = ['driver-console', 'attendant', 'transport_manager', 'parent', 'employee'];
    //SEND RESOPNSE IF DEMO ACCOUNT//
    if (Customer_id == PARAMS.DEMO_ACCOUNT_ID || Customer_id == PARAMS.DEMO_ACCOUNT2_ID) {
        res.send({
            result: false,
            message: 'You are in Demo account.You have no privilege to access the action'
        });
        return true;
    }
    //SEND RESOPNSE IF DEMO ACCOUNT//

    //CHECK VALID INPUT PARAMETER//
    if ((Customer_id == "" || Number.isInteger(Customer_id) == false) || api_key == "") {
        res.send({
            result: false,
            message: 'Insufficient Parameters/Customer Id is not integer'
        })

    }
    //CHECK VALID INPUT PARAMETER//

    //IF VALID BELOW CODE WILL EXECUTE//
    else{
    let getApiKeyData = await TRIPDB.getApiKey(Customer_id, api_key);

    if (getApiKeyData.rowCount > 0) {


        let user_app_type = getApiKeyData.rows[0].user_apps_type;

        let user_apps_type = array.indexOf(user_app_type);

          
        if (user_apps_type > -1) {
            let user_id = getApiKeyData.rows[0].user_apps_user_id;
            let user_info = await TRIPDB.getUserInfo(user_id, Customer_id);
            if (user_info.rowCount > 0) {
                let userStatus = user_info.rows[0].user_status;
                if (userStatus == 'inactive') {
                    res.send({
                        result: false,
                        message: 'Your School account is inactive or expired now,Please contact {brand_name} support for further details.',
                        brand_name: ''
                    });
                    // return next();

                } else if (userStatus == 'removed') {
                    res.send({
                        result: false,
                        message: 'Your School account is deactivated by Track School Bus Administrator,Please contact Track School Bus support for further details.'
                    });
                    // return next();

                }
                let user_last_access = dt.format('Y-m-d H:M:S');
                let user_access_mode = getApiKeyData.rows[0].user_apps_device_os;
                let lastUserStatusUpdate = await TRIPDB.statusUpdate(Customer_id, user_last_access, user_access_mode, user_id); //update the status
                req.apikeyVerify = 'valid';
                next();

            } else {
                res.send({
                    result: false,
                    message: 'It seems your settings out dated, please logout and login again!'
                });

            }
        }
        //IF VALID BELOW CODE WILL EXECUTE//

    } else {
        res.send({
            result: false,
            message: 'Your account is disabled by School,Please contact with your School authority for further details.'
        });

    }

} 
}