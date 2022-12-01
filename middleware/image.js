var multer = require("multer");
const util = require("util");

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.name + "-" + Date.now());
  },
});

var upload = multer({ dest: "uploads/" }).single("image");
var uploadFilesMiddleware = util.promisify(upload);
// const upload = multer({ dest: "uploads/" });

module.exports = uploadFilesMiddleware;
