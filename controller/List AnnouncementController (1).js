const { async } = require('q');
const ListAnnouncementModel = require('../model/ListAnnouncementModel (1)');
var dbConnect = require('../db');
var client = dbConnect.client;

const ListAnnouncementController = async (req, res, next) => {

    try {

        var customer_id = req.query.customer_id;

        var api_key = req.query.api_key;

        if (customer_id == '' || api_key == '') {

            res.send(ListAnnouncementModel.isValidset);

        } else {
            if (typeof (customer_id == 'number')) {

                let user_status = await ListAnnouncementModel.IsUser_App(customer_id, api_key);
             
                if (user_status != "valid") {
                    
                    res.send(user_status);

                } else {

                        let Rval = await ListAnnouncementModel.rval()

                        Rval.rows.forEach( Data=async(rvals) => {

                            let current_academic_year = async () => {

                                let data = "SELECT academic_year_start_date,academic_year_end_date FROM public.tsb_academic_year WHERE academic_year_status='current' "

                                let Savedata = await client['master'].query(data);
                            
                                return Savedata;

                            }

                            let Current_academic_year = await current_academic_year()

                            let academic_year_start_date = Current_academic_year.rows[0].academic_year_start_date;

                            let academic_year_end_date = Current_academic_year.rows[0].academic_year_end_date;


                            if (academic_year_start_date >= rvals.announcement_date && rvals.announcement_date <= academic_year_end_date) {

                                let List = Rval.rows

                                let ListCount = List.sort()

                                if (ListCount.length > 0) {

                                    Output = {
                                        result: true,
                                        message: "retrieved",
                                        list: ListCount
                                    }
                                    res.send(Output);
                                
                                  
                                } else {

                                    Output = {
                                        result: false,
                                        message: 'There are no announcements'
                                    }
                                    res.send(Output);
                                }
                                // console.log('hello');
                                // rvals.stop()
                                // break rvals;
                                
                            }
                            
                            
                    });
                }

            }
        }


    } catch (error) {

        res.send(error.message)

    }

}

















module.exports = {
    ListAnnouncementController
}