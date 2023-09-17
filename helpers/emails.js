import nodemailer from 'nodemailer'

export const emailRegistro = async (datos) => {
    const { email, nombre, token } = datos

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
    });

    // Informacion del email

    const info = await transport.sendMail({
        from : '"Pai - Administrador de Proyectos" <cuentas@Pai.com>',
        to : email,
        subject : "Pai - Comprueba tu cuenta",
        text: "Comprueba tu cuenta en Pai",
        html: `<p>Hola ${nombre} Comprueba tu cuenta en Pai</p>
        <p>Tu cuenta ya esta casi lista, solo debes comprobarla en el siguiente enlace:</p>
        <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Comprobar Cuenta</a>
        <p>Si tu no creaste esta cuenta, puedes ignorar el mensaje</p>
        `
    })
}

export const emailRegistroInstructor = async (datos) => {
    const { email, nombre, token, password } = datos

    console.log(datos);

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
    });

    // Informacion del email

    const info = await transport.sendMail({
        from : '"Pai - Administrador de Proyectos" <cuentas@Pai.com>',
        to : email,
        subject : "Pai - Comprueba tu cuenta",
        text: "Comprueba tu cuenta en Pai",
        html: `<p>Hola ${nombre} Comprueba tu cuenta en Pai</p>
        <p>Tu cuenta ya esta casi lista, solo debes comprobarla en el siguiente enlace:</p>
        <strong>Esta es tu password: </strong> <p>${password}</p>
        <p>Puedes realizar el cambio desde los ajustes de tu perfil despues de comprobar tu cuenta e iniciar sesión</p>
        <a href="${process.env.FRONTEND_URL}/confirmar/${token}">Comprobar Cuenta</a>
        <p>Si tu no creaste esta cuenta, puedes ignorar el mensaje</p>
        `
    })
}


export const emailOlvidePassword = async (datos) => {
    const { email, nombre, token } = datos

    const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
    });

    // Informacion del email

    const info = await transport.sendMail({
        from : '"Pai - Administrador de Proyectos" <cuentas@Pai.com>',
        to : email,
        subject : "Pai - Restablece tu Password",
        text: "Restablece tu Password en Pai",
        html: `<p>Hola ${nombre} has solicitado restablecer tu password</p>
        <p>Sigue el siguiente enlace para generar un nuevo password:</p>
        <a href="${process.env.FRONTEND_URL}/olvide-password/${token}">Restablecer Password</a>
        <p>Si tu no solicitaste el restablecimiento de tu password, puedes ignorar el mensaje</p>
        `
    })
}