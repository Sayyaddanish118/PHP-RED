const express=require('express');
const router=express.Router()
const APIKEYVERIFY=require('../Middleware/apikeyVerify')

const ApiController=require('../controller/apiController')
const Login=require('../controller/LoginController')
// const ALLRUNNINGVEHICLE=require('../controller/allRunningVehicle')
const VIEWPROFILE=require('../controller/ViewUserInformationController')
const CHANGEPASSWORD=require('../controller/ChangePasswordByIdController')
const LOGOLIST=require('../controller/listLogoController')
const CLASSLIST=require('../controller/ClassListController')
const UPDATEUSER=require('../controller/UpdateUser')
const IMAGEUPLOAD=require('../controller/ImageUpload')
const HELPERLIST=require('../controller/HelperController')
const LISTSHIFT=require('../controller/ListShiftController')


router.get("/",ApiController.EntryFunction)
router.post("/login/transportmanager",Login.employeeLogin)

// router.post("/track/allrunning",ALLRUNNINGVEHICLE.allRunningVehicleController)

router.get("/user/view",APIKEYVERIFY.apikeyVerify,VIEWPROFILE.ViewUserDetails)

router.post("/user/changepasswordbyid",APIKEYVERIFY.apikeyVerify,CHANGEPASSWORD.ChangePasswordById)

router.get('/logo/list',APIKEYVERIFY.apikeyVerify,LOGOLIST.listLogoController)

router.get('/classes/list',APIKEYVERIFY.apikeyVerify,CLASSLIST.ClassListController)

router.post('/user/update',APIKEYVERIFY.apikeyVerify,UPDATEUSER.UpdateUser)

// router.post('/UpoadImage',IMAGEUPLOAD.UploadImage)

router.get('/helper/list',APIKEYVERIFY.apikeyVerify,HELPERLIST.HelperListController)

router.get('/shift/list',APIKEYVERIFY.apikeyVerify,LISTSHIFT.ListshiftController)

module.exports=router;