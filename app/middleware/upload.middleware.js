const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = "public/uploads/";

    if (file.fieldname === "video") {
      uploadPath += "video/";
    } else if (file.fieldname === "thumbnail") {
      uploadPath += "thumbnail/";
    } else if (file.fieldname === "photo") {
      uploadPath += "photo/";
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
