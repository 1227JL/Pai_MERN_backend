import multer from "multer"

const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null,'./uploads') //TODO: Cruda!
    },
    filename:(req, file, cb)=>{
        const ext = file.originalname.split('.').pop() //TODO: imagen.png --> png
        cb(null, `${Date.now()}.${ext}`)
    }
})
  
const upload = multer({storage}).single('file')

export default upload