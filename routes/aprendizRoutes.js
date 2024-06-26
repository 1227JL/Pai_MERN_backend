import express from "express";
import multer from "multer";
import { agregarTituladaAAprendiz, eliminarAprendiz, obtenerAprendiz, obtenerTituladasAprendiz, registrarAprendiz } from "../controllers/aprendizController.js";
import checkAuth from "../middleware/checkAuth.js";
import { getFileAprendiz } from "../services/aprendizService.js";

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
  .route("/:id")
  .get(checkAuth, obtenerAprendiz)
  .post(checkAuth, upload.single("file"), registrarAprendiz)
  .delete(checkAuth, eliminarAprendiz)

router.get('/:id/tituladas', obtenerTituladasAprendiz)
router.post('/:idAprendiz/tituladas/:idTitulada', agregarTituladaAAprendiz);
router.get('/file-access/:aprendiz/:filename', checkAuth, getFileAprendiz)


export default router;
