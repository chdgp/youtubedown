# 🎬 YouTube Downloader PRO (Node.js + yt-dlp)

Script en **Node.js** para descargar **videos (MP4)** o **audio (MP3)** desde YouTube utilizando **yt-dlp**, con una interfaz de consola mejorada (barra de progreso, colores, información del video y manejo de errores).

---

## 🚀 Características

- Descarga videos en **MP4** con la mejor calidad disponible  
- Descarga solo audio en **MP3**  
- Barra de progreso visual en tiempo real  
- Obtención automática de información del video (título, duración, autor, vistas)  
- Descarga automática del binario **yt-dlp** si no existe  https://github.com/yt-dlp/yt-dlp/releases/
- Compatible con **Windows, Linux y macOS**  
- Manejo de errores comunes (429, videos privados, no disponibles, etc.)

---

## 📦 Requisitos

- **Node.js 18+** (probado en Node.js 22)
- Conexión a internet
- Permisos de escritura en el directorio del proyecto

---

## 📥 Instalación

```bash
npm install yt-dlp-wrap chalk cli-progress
```

---

## ▶️ Uso

```bash
node youtube-downloader.js <URL> [formato]
```

### Ejemplos

**Descargar video en MP4**
```bash
node youtube-downloader.js "https://www.youtube.com/watch?v=XXXXXXX" mp4
```

**Descargar solo audio en MP3**
```bash
node youtube-downloader.js "https://www.youtube.com/watch?v=XXXXXXX" mp3
```

---

## 🎧 Formatos soportados

| Formato | Descripción |
|-------|------------|
| mp4 | Video con audio (por defecto) |
| mp3 | Solo audio |

---

## 📁 Carpeta de salida

Los archivos descargados se guardan en:

```
./downloads
```

La carpeta se crea automáticamente si no existe.

---

## ⚠️ Notas

- El binario **yt-dlp** se descarga automáticamente si no está presente.
- No se descargan playlists, solo videos individuales.
- Uso recomendado solo para fines personales y educativos.

---

## 🧑‍💻 Autor

**Christian Daniel Garcia**  
📧 chdgp1988@gmail.com  
👤 GitHub: chdgp

---

## 📄 Licencia

MIT License
