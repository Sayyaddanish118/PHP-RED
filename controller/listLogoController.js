const { async } = require('q');
// const databasedb = require('../db/db');
const listLogoModel = require('../model/listLogoModel');


const listLogoController = async (req, res, next) => {

    try {
        if(req.apikeyVerify = 'valid'){
        var customer_id = req.query.customer_id;
        var api_key = req.query.api_key;


        if (customer_id == '' || api_key == '') {
            res.send(listLogoModel.isValidset);
        } 
            else {
                if (typeof (customer_id == 'number')) {
                    
                    
                    let user_status = await listLogoModel.IsUser_App(customer_id, api_key);

                if (user_status != "valid") {
                    res.send(user_status);
                } else {

                    var rval_exc = await listLogoModel.rval();
                    
                    if (rval_exc.rowCount > 0) {

                        var output = {
                            status: true,
                            message: 'retrieved',
                            logos: rval_exc.rows[0]
                        }

                        res.send(output)

                    } else {
                        var output = {
                            status: false,
                            message: 'No logos added'
                        }
                    }
                }


            } else {
                
                res.send(output);
                
                var output = {
                    status: false,
                    message: 'Customer id can not be blank and should contain Numeric characters only'
                }
            }
        }
    }
    } catch (error) {
        res.send(error.message)
    }

}

module.exports = {
    listLogoController
}