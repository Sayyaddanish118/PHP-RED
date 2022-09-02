/*
 * serve each clients (for each user - all his/her browsers and all its tabs) individually [ie. not as a single service for a user]
 */
"use strict";


var path = require('path'),
 q = require('q');

// Application Config
var config = require('./db/db.json')
//var socIo = require('./channel/app/controllers/server-socket');
// var socIoNew =  require('./channel/app/controllers/server-socket-new');

const { Client, Query } = require('pg');
var extend = require('extend'),
    db_prefix = config.db_prefix,
    db_config = config.master_db,
    client = {},
    customers_data = {};



// export variables from this file
module.exports = {
    getCustomers: getCustomers,
    connectToCustomer, connectToCustomer,
    queryDb: queryDb,
    // create: create,
    //update: update,
    //deleteRow: deleteRow,
    client: client,
    getCustomerDb: getCustomerDb,
    connectMasterDb: connectMasterDb
};

function 

handleHandshake(db_config, db_id, db_key, io, ioNew) {
    var deferred = q.defer();
    client[db_id] = new Client(db_config);
    // If there is an error connecting to the database
// console.log(db_id);
    client[db_id].connect(function (err) {
        if (err) {
            // console.log("fdf");
            //logMessage({'msg': 'handleHandshake', 'data': err});
            setTimeout(function () {
                handleHandshake(db_config, db_id, db_key, io, ioNew);
            }, 2000);
        } else {
            if (db_id != 'master') {
                //socIo.startSIO(io,'/api/school/'+db_id);
                // socIoNew.startSIO(ioNew,'/api/school/'+db_id);

                console.log('********************************************');
                console.log('*    Socket connected for DB %s     *', db_id);
                console.log('********************************************\n');

                // getDivision(db_id,io,ioNew)
            }
            deferred.resolve({ 'db_config': db_config, 'db_id': db_id });
            console.log('********************************************');
            console.log('*    postgreSqlDB %s connected     *', db_config.database);
            console.log('********************************************\n');
        }
    });


    client[db_id].on('error', function (err) {
        //logMessage({'msg': 'client db connection err', 'data': err});
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleHandshake(db_config, db_id, db_key, io, ioNew);
        } else {
            throw err;
        }
    });
    return deferred.promise;
}

function connectToCustomer(cus_id, io = null) {

    //console.log('vannu '+cus_id);
    // console.log(cus_id);
    var connection_established = handleHandshake(db_config, 'master');
    connection_established.then(function (established_response) {
        // Doing the database query
        var sql_params = [];
        var sql = "SELECT c.customer_id,c.customer_plan,c.customer_display_key,t.timezone_name FROM master_customer c\
                    join master_timezone t on t.timezone_id = c.customer_time_zone\
                    where customer_status='active' and customer_id="+ cus_id;
        var connection_args = { 'db_id': 'master', 'user_unique_id': 0, 'socketIndex': 0 };
        var query_params = { 'sql': sql, 'sql_params': sql_params, 'connection_args': connection_args, 'fn_caller': 'getCustomers' };

        queryDb(query_params).then(function (customers) {
            // connect each databases in customers_data 

            customers.forEach(function (customer) {
                customers_data[customer.customer_id] = customer;
                var customer_db = extend({}, db_config);
                customer_db.database = db_prefix + customer.customer_id; // database name
                handleHandshake(customer_db, customer.customer_id, customer.customer_display_key, io, io);
            });
        });
    });
}

function getCustomers(io, ioNew) {

    var connection_established = handleHandshake(db_config, 'master', '', io, ioNew);
    connection_established.then(function (established_response) {
        // Doing the database query
        var sql_params = [];
        console.log(sql_params);
        var sql = "SELECT customer_id,customer_plan,customer_display_key,timezone_name FROM master_customer c JOIN master_timezone t on t.timezone_id =c.customer_time_zone  WHERE customer_status='active'";
        var connection_args = { 'db_id': 'master', 'user_unique_id': 0, 'socketIndex': 0 };
        var query_params = { 'sql': sql, 'sql_params': sql_params, 'connection_args': connection_args, 'fn_caller': 'getCustomers' };
        queryDb(query_params).then(function (customers) {
            // connect each databases in customers_data 
            customers.forEach(function (customer) {
                customers_data[customer.customer_id] = customer;
                var customer_db = extend({}, db_config);
                customer_db.database = db_prefix + customer.customer_id; // database name
                handleHandshake(customer_db, customer.customer_id, customer.customer_display_key, io, ioNew);
            });
        });
    });
}
console.log(getCustomers());

function queryDb(args) {
    var deferred = q.defer();
    // validate input params
    var insufficient_params = 0;
    var params = ['sql', 'sql_params', 'connection_args'];
    var optional_params = ['fn_caller', 'return_type'];
    var fn_caller = typeof args.fn_caller != 'undefined' ? args.fn_caller : '';

    params.forEach(function (param) {
        if (typeof args[param] == 'undefined' || !args[param]) {
            var err_msg = 'insufficient params : ' + fn_caller + ' - ' + param;
            //logMessage({'msg': err_msg, 'data': err});
            insufficient_params = 1;
            return false;
        }
    });
    if (insufficient_params)
        return false;

    // set variables
    var sql = args.sql, sql_params = args.sql_params, connection_args = args.connection_args;
    var return_type = args.return_type == 'row' ? 'row' : 'array';

    //var db_id = connection_args.db_id;
    var db_id = connection_args.db_id;
    var user_unique_id = connection_args.user_unique_id;
    var socketIndex = connection_args.socketIndex;

    // Doing the database query
    //var query = client[db_id].query(sql, sql_params);
    const query = client[db_id].query(new Query(sql))
    query.on('row', function (row, result) {
        result.addRow(row);
    })
    query.on('end', function (result) {
        let data = result.rows;
        if (return_type == 'row') {
            data = result.rows.length ? result.rows[0] : {};
        }
        deferred.resolve(data);
    })
    query.on('error', function (err) {
        var err_msg = user_unique_id + ' - ' + fn_caller + ' database query failed \n' + sql + '\n' + sql_params;
        console.log(err_msg)
        //logMessage({'msg': err_msg, 'data': err});
    });
    return deferred.promise;
}


function getCustomerDb(customerId) {
    if (client[customerId] == undefined) {
        // connectToCustomer(customerId)
        var customer_db = extend({}, db_config);
        customer_db.database = db_prefix + customerId;
        var connection_established = handleHandshake(customer_db, customerId,null);
    }

    return client[customerId]
}


function connectMasterDb() {
    handleHandshake(db_config, 'master');
}

