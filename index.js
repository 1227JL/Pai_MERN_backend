import express from "express"; 
import cors from 'cors'
import conexion from "./config/db.js";
import dotenv from 'dotenv';
import usuarioRoutes from './routes/usuarioRoutes.js'
import tituladaRoutes from './routes/tituladaRoutes.js'
import instructorRoutes from './routes/instructorRoutes.js'
import ambienteRoutes from './routes/ambienteRoutes.js'

const app = express()
app.use(express.json())
dotenv.config()
conexion()

const whitelist = [process.env.FRONTEND_URL]

const corsOptions = {
    origin:function(origin, callback) {
        if(!origin){ //Postman request have not origin 
            return callback(null, true)
        }else if (whitelist.includes(origin)){
            callback(null, true)
        }else{
            callback(new Error("Cors Error"))
        }
    }
}
app.use(cors(corsOptions))

app.use('/api/usuarios', usuarioRoutes)
app.use('/api/tituladas', tituladaRoutes)
app.use('/api/instructores', instructorRoutes)
app.use('/api/ambientes', ambienteRoutes)
app.use('/uploads', express.static('uploads'))
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send('Error interno del servidor');
  });

const PORT = process.env.PORT || 4000
const servidor = app.listen(PORT, ()=>{
    console.log(`Servidor corriendo en el puerto ${PORT}`);
})