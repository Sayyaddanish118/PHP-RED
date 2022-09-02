const multer = require("multer");
const path = require('path')

//File_Storage
const Storage=multer.diskStorage({
     // File_Path
    destination: (req,file,cb) =>{
        cb(null,'uploads/user')
    },
    // File_Name
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({storage: Storage,});

module.exports = upload;