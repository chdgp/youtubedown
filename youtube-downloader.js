// YouTube Downloader usando yt-dlp (Mejor UI/UX)
// Instalación: npm install yt-dlp-wrap chalk cli-progress

const YTDlpWrap = require('yt-dlp-wrap').default;
const fs = require('fs');
const path = require('path');

// Colores ANSI para mejor visualización
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m',
  bgBlue: '\x1b[44m'
};

// Configuración
const CONFIG = {
  outputDir: './downloads',
  ytDlpPath: null
};

// Crear directorio de descargas si no existe
if (!fs.existsSync(CONFIG.outputDir)) {
  fs.mkdirSync(CONFIG.outputDir, { recursive: true });
}

let ytDlpWrap;

/**
 * Imprime un banner estilizado
 */
function printBanner() {
  console.clear();
  console.log(`
${colors.cyan}${colors.bright}╔════════════════════════════════════════════════════════╗
║                                                        ║
║           🎬  YOUTUBE DOWNLOADER PRO  🎵               ║
║                                                        ║
║              Descarga videos y audio de YouTube       ║
║                                                        ║
╚════════════════════════════════════════════════════════╝${colors.reset}
`);
}

/**
 * Imprime un mensaje con estilo
 */
function log(icon, message, color = colors.white) {
  console.log(`${color}${icon} ${message}${colors.reset}`);
}

/**
 * Imprime una línea de separación
 */
function printSeparator() {
  console.log(`${colors.dim}${'─'.repeat(56)}${colors.reset}`);
}

/**
 * Crea una barra de progreso visual
 */
function createProgressBar(percent) {
  const barLength = 30;
  const filled = Math.round((percent / 100) * barLength);
  const empty = barLength - filled;
  
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  
  let barColor = colors.cyan;
  if (percent > 75) barColor = colors.green;
  else if (percent > 50) barColor = colors.yellow;
  
  return `${barColor}[${bar}]${colors.reset}`;
}

/**
 * Formatea bytes a formato legible
 */
function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Formatea segundos a formato MM:SS
 */
function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Inicializa yt-dlp
 */
async function initYTDlp() {
  try {
    const platform = process.platform;
    const binaryName = platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';
    const ytDlpBinaryPath = path.join(__dirname, binaryName);
    
    if (!fs.existsSync(ytDlpBinaryPath)) {
      log('📥', 'Descargando yt-dlp por primera vez...', colors.yellow);
      printSeparator();
      
      const dots = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
      let i = 0;
      const interval = setInterval(() => {
        process.stdout.write(`\r  ${colors.cyan}${dots[i++ % dots.length]} Descargando binario...${colors.reset}`);
      }, 100);
      
      try {
        const downloadPath = ytDlpBinaryPath.replace(/\.exe$/, '');
        await YTDlpWrap.downloadFromGithub(downloadPath);
        clearInterval(interval);
        process.stdout.write('\r' + ' '.repeat(50) + '\r');
        log('✓', 'yt-dlp descargado exitosamente', colors.green);
        
        if (platform !== 'win32' && fs.existsSync(ytDlpBinaryPath)) {
          fs.chmodSync(ytDlpBinaryPath, 0o755);
        }
      } catch (downloadError) {
        clearInterval(interval);
        process.stdout.write('\r' + ' '.repeat(50) + '\r');
        log('✗', 'Error al descargar yt-dlp', colors.red);
        console.log(`\n${colors.yellow}💡 Solución alternativa:${colors.reset}`);
        console.log(`  1. Descarga desde: ${colors.cyan}https://github.com/yt-dlp/yt-dlp/releases${colors.reset}`);
        console.log(`  2. Coloca ${colors.bright}${binaryName}${colors.reset} en: ${__dirname}`);
        throw downloadError;
      }
    }

    ytDlpWrap = new YTDlpWrap(ytDlpBinaryPath);
    
    try {
      const version = await ytDlpWrap.getVersion();
      log('✓', `yt-dlp inicializado (v${version})`, colors.green);
    } catch {
      log('✓', 'yt-dlp inicializado correctamente', colors.green);
    }
    
  } catch (error) {
    throw new Error(`Error al inicializar yt-dlp: ${error.message}`);
  }
}

/**
 * Obtiene información del video
 */
async function getVideoInfo(url) {
  try {
    log('🔍', 'Conectando con YouTube...', colors.cyan);
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), 30000);
    });
    
    const infoPromise = (async () => {
      const dots = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
      let i = 0;
      
      const interval = setInterval(() => {
        process.stdout.write(`\r  ${colors.cyan}${dots[i++ % dots.length]} Obteniendo información del video...${colors.reset}`);
      }, 100);
      
      try {
        const info = await ytDlpWrap.getVideoInfo(url);
        clearInterval(interval);
        process.stdout.write('\r' + ' '.repeat(60) + '\r');
        
        return {
          title: info.title,
          duration: info.duration,
          author: info.uploader || info.channel || 'Desconocido',
          thumbnail: info.thumbnail,
          viewCount: info.view_count,
          uploadDate: info.upload_date
        };
      } catch (error) {
        clearInterval(interval);
        process.stdout.write('\r' + ' '.repeat(60) + '\r');
        throw error;
      }
    })();
    
    return await Promise.race([infoPromise, timeoutPromise]);
  } catch (error) {
    if (error.message.includes('Timeout')) {
      log('⚠', 'La solicitud está tardando demasiado', colors.yellow);
      log('→', 'Continuando con descarga directa...', colors.dim);
      return null;
    }
    throw error;
  }
}

/**
 * Muestra información del video de forma estilizada
 */
function displayVideoInfo(info) {
  printSeparator();
  console.log(`\n${colors.bright}📺 INFORMACIÓN DEL VIDEO${colors.reset}\n`);
  console.log(`  ${colors.cyan}Título:${colors.reset}    ${colors.bright}${info.title}${colors.reset}`);
  console.log(`  ${colors.cyan}Autor:${colors.reset}     ${info.author}`);
  console.log(`  ${colors.cyan}Duración:${colors.reset}  ${formatTime(info.duration)}`);
  
  if (info.viewCount) {
    console.log(`  ${colors.cyan}Vistas:${colors.reset}    ${info.viewCount.toLocaleString()}`);
  }
  
  console.log();
  printSeparator();
}

/**
 * Descarga video en MP4
 */
async function downloadVideo(url) {
  console.log(`\n${colors.bright}${colors.bgBlue} VIDEO MP4 ${colors.reset}\n`);
  
  const outputTemplate = path.join(CONFIG.outputDir, '%(title)s.%(ext)s');
  
  const ytDlpEventEmitter = ytDlpWrap.exec([
    url,
    '-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
    '--merge-output-format', 'mp4',
    '-o', outputTemplate,
    '--no-playlist',
    '--progress',
    '--newline',
    '--no-warnings'
  ]);

  let lastUpdate = Date.now();
  let downloadStarted = false;
  let fileName = '';

  return new Promise((resolve, reject) => {
    ytDlpEventEmitter.on('progress', (progress) => {
      if (!downloadStarted) {
        log('🚀', 'Iniciando descarga...', colors.green);
        console.log();
        downloadStarted = true;
      }
      
      const now = Date.now();
      if (now - lastUpdate > 300) {
        if (progress.percent) {
          const percent = typeof progress.percent === 'string' 
            ? parseFloat(progress.percent.replace('%', '').trim())
            : parseFloat(progress.percent);
          
          const progressBar = createProgressBar(percent);
          const size = progress.totalSize || '---';
          const speed = progress.currentSpeed || '---';
          const eta = progress.eta || '--:--';
          
          process.stdout.write(`\r  ${progressBar} ${colors.bright}${percent.toFixed(1)}%${colors.reset}`);
          process.stdout.write(`  ${colors.dim}│${colors.reset}  ${size}  ${colors.dim}│${colors.reset}  ${speed}  ${colors.dim}│${colors.reset}  ETA: ${eta}     `);
        }
        lastUpdate = now;
      }
    });

    ytDlpEventEmitter.on('ytDlpEvent', (eventType, eventData) => {
      if (eventType === 'download' && eventData) {
        const match = eventData.match(/Destination: (.+)/);
        if (match) {
          fileName = path.basename(match[1]);
        }
      }
    });

    ytDlpEventEmitter.on('error', (error) => {
      console.log('\n');
      log('✗', 'Error en la descarga', colors.red);
      reject(error);
    });

    ytDlpEventEmitter.on('close', () => {
      console.log('\n');
      log('✓', 'Video descargado exitosamente', colors.green);
      if (fileName) {
        console.log(`  ${colors.dim}→ ${fileName}${colors.reset}`);
      }
      resolve();
    });
  });
}

/**
 * Descarga solo audio en MP3
 */
async function downloadAudio(url) {
  console.log(`\n${colors.bright}${colors.bgBlue} AUDIO MP3 ${colors.reset}\n`);
  
  const outputTemplate = path.join(CONFIG.outputDir, '%(title)s.%(ext)s');
  
  const ytDlpEventEmitter = ytDlpWrap.exec([
    url,
    '-x',
    '--audio-format', 'mp3',
    '--audio-quality', '0',
    '-o', outputTemplate,
    '--no-playlist',
    '--progress',
    '--newline',
    '--no-warnings'
  ]);

  let lastUpdate = Date.now();
  let downloadStarted = false;
  let fileName = '';

  return new Promise((resolve, reject) => {
    ytDlpEventEmitter.on('progress', (progress) => {
      if (!downloadStarted) {
        log('🚀', 'Iniciando descarga...', colors.green);
        console.log();
        downloadStarted = true;
      }
      
      const now = Date.now();
      if (now - lastUpdate > 300) {
        if (progress.percent) {
          const percent = typeof progress.percent === 'string' 
            ? parseFloat(progress.percent.replace('%', '').trim())
            : parseFloat(progress.percent);
          
          const progressBar = createProgressBar(percent);
          const size = progress.totalSize || '---';
          const speed = progress.currentSpeed || '---';
          const eta = progress.eta || '--:--';
          
          process.stdout.write(`\r  ${progressBar} ${colors.bright}${percent.toFixed(1)}%${colors.reset}`);
          process.stdout.write(`  ${colors.dim}│${colors.reset}  ${size}  ${colors.dim}│${colors.reset}  ${speed}  ${colors.dim}│${colors.reset}  ETA: ${eta}     `);
        }
        lastUpdate = now;
      }
    });

    ytDlpEventEmitter.on('ytDlpEvent', (eventType, eventData) => {
      if (eventType === 'download' && eventData) {
        const match = eventData.match(/Destination: (.+)/);
        if (match) {
          fileName = path.basename(match[1]);
        }
      }
    });

    ytDlpEventEmitter.on('error', (error) => {
      console.log('\n');
      log('✗', 'Error en la descarga', colors.red);
      reject(error);
    });

    ytDlpEventEmitter.on('close', () => {
      console.log('\n');
      log('✓', 'Audio descargado exitosamente', colors.green);
      if (fileName) {
        console.log(`  ${colors.dim}→ ${fileName}${colors.reset}`);
      }
      resolve();
    });
  });
}

/**
 * Función principal
 */
async function downloadYouTube(url, format = 'mp4') {
  const startTime = Date.now();
  
  try {
    printBanner();
    
    // Inicializar yt-dlp
    await initYTDlp();
    printSeparator();
    
    // Obtener información del video
    const info = await getVideoInfo(url);
    
    if (info) {
      displayVideoInfo(info);
    } else {
      console.log();
    }

    // Descargar según el formato
    if (format === 'mp4') {
      await downloadVideo(url);
    } else if (format === 'mp3') {
      await downloadAudio(url);
    } else {
      throw new Error('Formato no soportado. Use "mp4" o "mp3"');
    }

    // Resumen final
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    printSeparator();
    console.log(`\n${colors.green}${colors.bright}✓ DESCARGA COMPLETADA${colors.reset}`);
    console.log(`  ${colors.dim}Tiempo total: ${elapsed}s${colors.reset}`);
    console.log(`  ${colors.dim}Ubicación: ${path.resolve(CONFIG.outputDir)}${colors.reset}\n`);
    printSeparator();
    
  } catch (error) {
    console.log('\n');
    printSeparator();
    log('✗', `ERROR: ${error.message}`, colors.red);
    
    if (error.message.includes('HTTP Error 429')) {
      console.log(`\n  ${colors.yellow}💡 Demasiadas solicitudes. Espera unos minutos.${colors.reset}`);
    } else if (error.message.includes('Video unavailable')) {
      console.log(`\n  ${colors.yellow}💡 El video no está disponible o es privado.${colors.reset}`);
    } else if (error.message.includes('Sign in')) {
      console.log(`\n  ${colors.yellow}💡 El video requiere inicio de sesión.${colors.reset}`);
    }
    
    printSeparator();
    console.log();
    throw error;
  }
}

// Uso del script
const args = process.argv.slice(2);

if (args.length === 0) {
  printBanner();
  console.log(`${colors.bright}USO:${colors.reset}`);
  console.log(`  node youtube-downloader-ytdlp.js <URL> [formato]\n`);
  console.log(`${colors.bright}EJEMPLOS:${colors.reset}`);
  console.log(`  ${colors.dim}# Descargar video en MP4${colors.reset}`);
  console.log(`  ${colors.cyan}node youtube-downloader-ytdlp.js "URL" mp4${colors.reset}\n`);
  console.log(`  ${colors.dim}# Descargar solo audio en MP3${colors.reset}`);
  console.log(`  ${colors.cyan}node youtube-downloader-ytdlp.js "URL" mp3${colors.reset}\n`);
  console.log(`${colors.bright}FORMATOS:${colors.reset}`);
  console.log(`  ${colors.green}mp4${colors.reset} - Video con audio (por defecto)`);
  console.log(`  ${colors.green}mp3${colors.reset} - Solo audio\n`);
  printSeparator();
  console.log();
  process.exit(1);
}

const url = args[0];
const format = args[1] || 'mp4';

downloadYouTube(url, format)
  .then(() => {
    process.exit(0);
  })
  .catch(() => {
    process.exit(1);
  });