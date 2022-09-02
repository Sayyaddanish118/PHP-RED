const express=require('express');
const router=express.Router()
const APIKEYVERIFY=require('../Middleware/apikeyVerify')

const ApiController=require('../controller/apiController')
const LOGIN=require('../controller/LoginController')
// const ALLRUNNINGVEHICLE=require('../controller/allRunningVehicle')
const VIEWPROFILE=require('../controller/ViewUserInformationController')
const CHANGEPASSWORD=require('../controller/ChangePasswordByIdController')
const LOGOLIST=require('../controller/listLogoController')
const CLASSLIST=require('../controller/ClassListController')
const UPDATEUSER=require('../controller/UpdateUser')
const HELPERLIST=require('../controller/HelperController')
const LISTSHIFT=require('../controller/ListShiftController')
const HELPERUPDATEMOBILE=require('../controller/HelperUpdateMobile')
const DRIVERLIST=require('../controller/DriverListController')
const LISTANNOUNCEMENT=require('../controller/List AnnouncementController (1)')
const DRIVERUPDATE=require('../controller/DriverUpdateController')
const MP3LIST=require('../controller/Mp3ListController')


router.get("/",ApiController.EntryFunction)

router.post("/login/transportmanager",LOGIN.employeeLogin)

// router.post("/track/allrunning",ALLRUNNINGVEHICLE.allRunningVehicleController)

router.get("/user/view",APIKEYVERIFY.apikeyVerify,VIEWPROFILE.ViewUserDetails)

router.post("/user/changepasswordbyid",APIKEYVERIFY.apikeyVerify,CHANGEPASSWORD.ChangePasswordById)

router.get('/logo/list',APIKEYVERIFY.apikeyVerify,LOGOLIST.listLogoController)

router.get('/classes/list',APIKEYVERIFY.apikeyVerify,CLASSLIST.ClassListController)

router.put('/user/update',APIKEYVERIFY.apikeyVerify,UPDATEUSER.UpdateUser)

router.get('/helper/list',APIKEYVERIFY.apikeyVerify,HELPERLIST.HelperListController)

router.get('/shift/list',APIKEYVERIFY.apikeyVerify,LISTSHIFT.ListshiftController)

router.put('/helper/mobileupdate',APIKEYVERIFY.apikeyVerify,HELPERUPDATEMOBILE.MobileUpdate)

router.get('/driver/list',APIKEYVERIFY.apikeyVerify,DRIVERLIST.DriverListController)

router.get('/announcement/list',APIKEYVERIFY.apikeyVerify,LISTANNOUNCEMENT.ListAnnouncementController)

router.put('/driver/mobileupdate',APIKEYVERIFY.apikeyVerify,DRIVERUPDATE.DriverUpdateController)

router.post('/audio/list',APIKEYVERIFY.apikeyVerify,MP3LIST.Mp3ListController)


module.exports=router;