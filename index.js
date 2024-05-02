import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import tituladaRoutes from "./routes/tituladaRoutes.js";
import instructorRoutes from "./routes/instructorRoutes.js";
import ambienteRoutes from "./routes/ambienteRoutes.js";
import aprendizRoutes from "./routes/aprendizRoutes.js";
import ingresoRoutes from "./routes/ingresoRoutes.js";
import conexion from "./config/db.js";
import { listFiles } from "./config/google_cloud.js";

dotenv.config();
const app = express();
app.use(express.json());

conexion();

const whitelist = [process.env.FRONTEND_URL];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) {
      //Postman request have not origin
      return callback(null, true);
    } else if (whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Cors Error"));
    }
  },
};

app.use(cors(corsOptions));
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/tituladas", tituladaRoutes);
app.use("/api/instructores", instructorRoutes);
app.use("/api/ambientes", ambienteRoutes);
app.use("/api/aprendices", aprendizRoutes);
app.use("/api/ingresos", ingresoRoutes);
app.use("/uploads", express.static("uploads"));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Error interno del servidor");
});

const PORT = process.env.PORT || 4000;
const servidor = app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
