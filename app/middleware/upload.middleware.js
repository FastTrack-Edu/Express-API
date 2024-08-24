const multer = require("multer");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = "public/uploads/";

    if (file.fieldname === "video") {
      uploadPath += "video/";
    } else if (file.fieldname === "thumbnail") {
      uploadPath += "thumbnail/";
    } else if (file.fieldname === "photo") {
      uploadPath += "photo/";
    } else if (file.fieldname === "guide_book") {
      uploadPath += "guide_book/";
    } else if (file.fieldname === "file") {
      uploadPath += "file/";
    } else if (file.fieldname === "modul") {
      uploadPath += "modul/";
    }

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
