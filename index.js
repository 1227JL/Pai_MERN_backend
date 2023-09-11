import express from "express"; 
import cors from 'cors'
import conexion from "./config/db.js";
import dotenv from 'dotenv';
import usuarioRoutes from './routes/usuarioRoutes.js'

const app = express()
app.use(express.json())

dotenv.config()
conexion()

// Routing

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


const PORT = process.env.PORT || 4000
const servidor = app.listen(PORT, ()=>{
    console.log(`Servidor corriendo en el puerto ${PORT}`);
})