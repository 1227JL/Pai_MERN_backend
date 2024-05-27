import express from "express";
import {
    registrar,
    autenticar,
    confirmar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    perfil,
} from "../controllers/usuarioController.js";
import checkAuth from "../middleware/checkAuth.js";
import { PublicClientApplication } from '@azure/msal-node';
import { msalConfig } from "../config/azureADconfig.js";

const pca = new PublicClientApplication(msalConfig);


const router = express.Router();

router.post('/', registrar)
router.post('/login', autenticar) // Autentica el usuario registrado
router.get('/confirmar/:token', confirmar) // Autentica el usuario registrado
router.post('/olvide-password', olvidePassword) // Genera el token que se envia al email para realizar el cambio de la contraseña
router.route('/olvide-password/:token').get(comprobarToken).post(nuevoPassword)

router.get('/perfil', checkAuth, perfil)


router.get('/signin', (req, res) => {
    const authUrlParameters = {
      scopes: ["user.read"],
      redirectUri: "http://localhost:3000/auth/callback",
    };
  
    pca.getAuthCodeUrl(authUrlParameters)
      .then((authUrl) => {
        res.redirect(authUrl);
      })
      .catch((error) => {
        res.status(500).send(error);
      });
  });
  
  router.get('/auth/callback', (req, res) => {
    const tokenRequest = {
      code: req.query.code,
      scopes: ["user.read"],
      redirectUri: "http://localhost:3000/auth/callback",
    };
  
    pca.acquireTokenByCode(tokenRequest)
      .then((response) => {
        console.log(response);
        res.send('Autenticación exitosa');
      })
      .catch((error) => {
        console.log(error);
        res.status(500).send('Error al adquirir el token');
      });
  });

export default router