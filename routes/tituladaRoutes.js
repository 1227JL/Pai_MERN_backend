import express from "express";
import multer from "multer";
import {
  crearTitulada,
  obtenerTituladas,
  obtenerTitulada,
  editarTitulada,
  eliminarTitulada,
} from "../controllers/tituladaController.js";
import checkAuth from "../middleware/checkAuth.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/disenosCurriculares");
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split(".").pop(); // Obtiene la extensión del archivo original
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "." + ext); // Nombre del arch
  },
});

const upload = multer({ storage });

router
  .route("/")
  .get(checkAuth, obtenerTituladas)
  .post(checkAuth, upload.single("file"), crearTitulada);

router
  .route("/:id")
  .get(checkAuth, obtenerTitulada)
  .put(checkAuth, editarTitulada)
  .delete(checkAuth, eliminarTitulada);

export default router;
