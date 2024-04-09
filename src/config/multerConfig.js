import multer from "multer";

// Configurar el almacenamiento en memoria
const storage = multer.memoryStorage();

// Configurar Multer con las opciones de almacenamiento
const upload = multer({ storage });

// Exportar el middleware de subida de archivos
export default upload;
