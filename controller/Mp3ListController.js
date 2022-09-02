const { async, nextTick } = require("q");
const List=require('../model/Mp3ListModel')
const upload =require('../Middleware/upload').array("available_mp3")

const Mp3ListController=async(req,res,next)=>{
    try {
        if (req.apikeyVerify = 'valid') {
            upload(req, res, async (err) => {
            var customer_id=req.body.customer_id
            var api_key=req.body.api_key
            var available_mp3=req.files
            // console.log(customer_id);
            // console.log(api_key);
            // console.log(available_mp3);
            // console.log(available_mp3[0]);
            // console.log(available_mp3[1]);
            // console.log(available_mp3[2]);

            if(customer_id == "" || api_key == ""){
                let failureInputResponse = {
                    status: false,
                    msg: 'Insufficient Parameters'
                }
                res.send(failureInputResponse);
                return false 
            }else{
                if (customer_id != undefined && typeof(customer_id == Number)) {
// console.log(customer_id);
                    let user_status=await List.IsUser_App(customer_id,api_key)
// console.log(user_status);
                    if (user_status != 'valid') {
                        res.status(400).send(user_status)
                    }else{
                       let currentrval=await List.Mp3List()
// console.log(currentrval.rows);
                       if(currentrval.rowCount > 0){
                        let presentaudioarray="";
                        // console.log(presentaudioarray);
                        let audioarray=[];
                        for (let i = 0; i < currentrval.rows.length; i++) {
                            // console.log(i);
                            if(currentrval.rows[i].audio_file == ""){
                               currentrval.rows[i].audio_file = null
                            }else{
                                audioarray[i]=currentrval.rows[i].audio_file 
                            }                     
                        }
                        let audio_title=[]
                        for (let j = 0; j < currentrval.rows.length; j++) {
                            if(currentrval.rows[j].audio_title == ""){
                                currentrval.rows[j].audio_title = null
                             }else{
                                audio_title[j]=currentrval.rows[j].audio_title 
                             }        
                        }
                        // console.log(audio_title);
                        for (let i = 0; i < audioarray.length; i++) {
                            audioarray[i]=audioarray[i].replace("uploads/1/announcement/","")
                            // console.log(audioarray);
                            for (let k = 0; k < audio_title.length; k++) {
                                audio_title[k]=audio_title[k].replace(" ","")
                                audioarray[i]=audioarray[i].replace(audio_title[k],"")
                            }
                        }
                        console.log(audioarray);
                        let Presentaudioarray=[]
                        // console.log(Presentaudioarray);
                        if(available_mp3.length > 0){
                            // console.log(available_mp3.length);
                            // console.log(available_mp3[0]);
                            for (let l = 0; l < available_mp3.length; l++) {
                                if(available_mp3[l].filename == ""){
                                    available_mp3[l].filename = null
                                 }else{
                                    Presentaudioarray[l]=available_mp3[l].filename 
                                 }   
                            }
                            // console.log(Presentaudioarray);
                            // available_mp3.forEach(async(value) => {
                            //     Presentaudioarray=await value
                            // });
                        }
                        // console.log(Presentaudioarray);
                                           
                           if (Array.isArray(audioarray) && Array.isArray(Presentaudioarray)) {
                          
                            let result=audioarray.filter(x => presentaudioarray.indexOf(x) === -1)
                console.log(result);
                            let resultarray=result

                            let Output={
                                result:true,
                                message:"retrived",
                                list:resultarray
                            }
                            res.status(200).send(Output)
                           }else{
                            let Output={
                                result:true,
                                message:"There are no audios"
                            }
                            res.status(404).send(Output)
                           }
                       }
                    }
                }
            }
        })
        }
        
    } catch (error) {
        next(error.message)
    }
}


module.exports={
    Mp3ListController
}