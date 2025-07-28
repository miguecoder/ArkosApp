const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Asegurar que el directorio de destino existe
const uploadDir = 'uploads/estampados/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configurar el almacenamiento
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
    // Permitir solo imágenes
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos de imagen'), false);
    }
};

// Configurar multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 60 * 1024 * 1024 // 60MB
    }
});

// Middleware para manejar errores de multer
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                error: 'El archivo es demasiado grande. Máximo 60MB.' 
            });
        }
        return res.status(400).json({ 
            error: 'Error al subir el archivo',
            details: error.message 
        });
    } else if (error) {
        return res.status(400).json({ 
            error: 'Error en el archivo',
            details: error.message 
        });
    }
    next();
};

module.exports = { upload, handleUploadError }; 