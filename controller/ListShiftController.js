const ListShiftModel = require('../model/ListShiftModel');

const { async } = require('q');
const User = require('../model/ListShiftModel');

const ListshiftController = async (req, res, next) => {
            try {
                
                var customer_id = req.query.customer_id;
                var api_key = req.query.api_key;

                if (customer_id == '' || api_key == '') {
                    res.send(User.isValidset);
                } else { 
                    if (typeof (customer_id == 'number')) {
                        
                        let user_status = await User.IsUser_App(customer_id, api_key);

                        if (user_status != "valid") {
                            res.send(user_status);
                        } else {

                            let rval_exc = await User.rval()

                            if (rval_exc.rowCount > 0) {
                                var output = {
                                    status: true,
                                    message: 'retrieved',
                                    logos: rval_exc.rows
                                }
                                res.send(output);
                            } else {
                                var output = {
                                    status: false,
                                    message: 'No result found'
                                }
                                res.send(output)
                            }
                            
                        }
                    } else {
                        var output = {
                            status : false,
                            message : 'Customer id can not be blank and should contain Numeric characters only'
                        }
                    }
                    
                }
            } catch (error) {
                res.send(error.message)
            }
}


module.exports={
    ListshiftController
}