import Usuario from '../models/Usuario.js'
import generarId from '../helpers/generarId.js'
import generarJWT from '../helpers/generarJWT.js'
import { emailOlvidePassword, emailRegistro } from '../helpers/email.js'


export const registrar = async (req, res) => {

    //Evitar registros duplicados
    const { email } = req.body
    const existeUsuario = await Usuario.findOne({ email })

    if(existeUsuario){
       const error = new Error('Usuario ya registrado')
       return res.status(400).json({ msg: error.message })
    }
    
    try {
        const usuario = new Usuario(req.body)
        usuario.token = generarId()
        await usuario.save()

        //Email
        emailRegistro({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        })

        res.json({
            msg: 'Usuario creado correctamente, revisa tu email para confirmar tu cuenta'
        })
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
}

export const autenticar = async (req, res) => {
    const { email, password } = req.body
    //Comprobar si existe
    const usuario = await Usuario.findOne({ email })
    if(!usuario){
        const error = new Error('El usuario no existe')
        return res.status(404).json({ msg: error.message })
    }
    //Comprobar si el usuario está confirmado
    if(!usuario.confirmado){
        const error = new Error('Tu cuenta no ha sido confirmada')
        return res.status(403).json({ msg: error.message })
    }
    //Comprobar su password
    if(await usuario.comprobarPassword(password)){
        res.json({
            id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            token: generarJWT(usuario._id)
        })
    } else {
        const error = new Error('El password es incorrecto')
        return res.status(403).json({ msg: error.message })
    }
}

export const confirmar = async (req, res) => {
    const { token } = req.params
    const usuarioConfirmar = await Usuario.findOne({ token })
    if(!usuarioConfirmar){
        const error = new Error('Token no válido')
        return res.status(403).json({ msg: error.message })
    }

    try {
        usuarioConfirmar.confirmado = true
        usuarioConfirmar.token = ''
        await usuarioConfirmar.save()
        res.json({
            msg: 'Usuario confirmado correctamente'
        })
    } catch (error) {
        console.log(error)
    }
}

export const olvidePassword = async (req, res) => {
    const { email } = req.body
    const usuario = await Usuario.findOne({ email })
    if(!usuario){
        const error = new Error('El usuario no existe')
        return res.status(404).json({ msg: error.message })
    }
    
    try {
        usuario.token = generarId()
        await usuario.save()

        //Email
        emailOlvidePassword({
            email: usuario.email,
            nombre: usuario.nombre,
            token: usuario.token
        })

        res.json({ msg: 'Hemos enviado un email con las instrucciones' })
    } catch (error) {
        return res.status(500).json({
            msg: error.message
        })
    }
}

export const comprobarToken = async (req, res) => {
    const { token } = req.params
    const tokenValido = await Usuario.findOne({ token })
    if(tokenValido){
        res.json({ msg: 'Token válido y el usuario existe' })
    } else {
        const error = new Error('Token no válido')
        return res.status(404).json({ msg: error.message })   
    }
}

export const nuevoPassword = async (req, res) => {
    const { token } = req.params
    const { password } = req.body
    const usuario = await Usuario.findOne({ token })
    if(usuario){
        try {
            usuario.password = password
            usuario.token = ''
            await usuario.save()
            res.json({ msg: 'Password modificado correctamente' })
            
        } catch (error) {
            return res.status(500).json({ error: error.message })
        }
    } else {
        const error = new Error('Token no válido')
        return res.status(404).json({ msg: error.message })
    }
}

export const perfil = async (req, res) => {
    const { usuario } = req
    res.json(usuario)
}