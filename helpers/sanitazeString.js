export default function sanitizeString(str) {
  if (!str) return ""; // Retorna una cadena vacía si el valor es undefined o null
  return str
    .replace(/[^a-zA-Z0-9 -]/g, "") // Elimina caracteres no alfanuméricos excepto espacios y guiones
    .replace(/\s+/g, "-") // Reemplaza espacios con guiones
    .toLowerCase(); // Convierte a minúsculas para uniformidad
}
