import express from "express";
import multer from "multer";
import {
  crearTitulada,
  obtenerTituladas,
  obtenerTitulada,
  editarTitulada,
  eliminarTitulada,
  obtenerCompetencia,
} from "../controllers/tituladaController.js";
import checkAuth from "../middleware/checkAuth.js";
import { getFileTitulada, obtenerAprendices, obtenerCompetencias, obtenerInstructores } from "../services/tituladaServices.js";

const router = express.Router();

const storage = multer.diskStorage({
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
  .post(
    checkAuth,
    upload.single("file"),
    crearTitulada
  );

router
  .route("/:id")
  .get(checkAuth, obtenerTitulada)
  .put(checkAuth, upload.single("file"), editarTitulada)
  .delete(checkAuth, eliminarTitulada);

router.get("/:id/aprendices", checkAuth, obtenerAprendices);
router.get("/:id/instructores", checkAuth, obtenerInstructores);
router.get("/:id/competencias", checkAuth, obtenerCompetencias);

router.get("/:id/:competencia", checkAuth, obtenerCompetencia);
router.get('/file-access/:tituladaName/:filename', checkAuth, getFileTitulada)

export default router;
