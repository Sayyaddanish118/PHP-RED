const { async } = require("q")
const User=require('../model/vehicle')
const databasedb = require('../db/db');
// const { message } = require("statuses");



const ClassListController = async (req, res, next)=> {
    try {
        if(req.apikeyVerify = 'valid'){
        var customer_id = req.query.customer_id;
        var api_key = req.query.api_key;

        if (customer_id == '' || api_key == '') {

            res.send(ClassListModel.isValidset);

        } else {
            
            if (typeof (customer_id == Number )) {
                var user_status = await User.IsUser_App(customer_id, api_key );
                if (user_status != "valid") {
                   res.send(user_status);
                   return false;
                }else{
                  let class_list=await User.class_list()
                if (class_list.rowCount > 0) {
                    var Output = {
                        status : true ,
                        message : "retrieved" ,
                        list : class_list.rows
                    }
                    res.send(Output)
                } else {
                    OutputError = {
                        status : false ,
                        message : 'There are no classes added yet'
                    }
                    res.send(OutputError)
                }
            }
            }
        }
        }
    } catch (error) {
        next(error.message)
    }
}




module.exports = {
    ClassListController
}