import express from "express";
import multer from "multer";
import { registrarAprendiz } from "../controllers/aprendizController.js";
import checkAuth from "../middleware/checkAuth.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/documentosAprendices");
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split(".").pop(); // Obtiene la extensión del archivo original
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "." + ext); // Nombre del arch
  },
});

const upload = multer({ storage });

router
  .route("/:ficha")
  .post(checkAuth, upload.single("file"), registrarAprendiz);

export default router;
