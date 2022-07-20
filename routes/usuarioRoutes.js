import express from 'express'
import { autenticar, comprobarToken, confirmar, nuevoPassword, olvidePassword, perfil, registrar } from '../controllers/usuario.controller.js'
import checkAuth from '../middleware/checkAuth.js'
const router = express.Router()


//Autenticación, registro y confirmación de usuarios
router.post('/', registrar)
router.post('/login', autenticar)
router.get('/confirmar/:token', confirmar)
router.post('/olvide-password', olvidePassword)
router.route('/olvide-password/:token').get(comprobarToken).post(nuevoPassword)

router.get('/perfil', checkAuth, perfil)

export default router

