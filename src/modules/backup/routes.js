const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const mysqldump = require('mysqldump');
const { exec } = require('child_process');
const auth = require('../../middlewares/auth');
const dbConfig = require('../../config/database');

const env = process.env.NODE_ENV || 'development';
const db = dbConfig[env];

// Pasta onde os backups são salvos no servidor
const BACKUP_DIR = path.resolve(process.cwd(), 'backups');
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

// Multer para upload de arquivos .sql
const upload = multer({
  dest: path.join(BACKUP_DIR, 'tmp'),
  fileFilter: (req, file, cb) => {
    if (file.originalname.endsWith('.sql')) cb(null, true);
    else cb(new Error('Apenas arquivos .sql são permitidos.'));
  },
  limits: { fileSize: 500 * 1024 * 1024 },
});

// Lista os backups salvos no servidor (mais recentes primeiro, máx 50)
router.get('/historico', auth, (req, res, next) => {
  try {
    const arquivos = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.endsWith('.sql'))
      .map(f => {
        const fullPath = path.join(BACKUP_DIR, f);
        const stat = fs.statSync(fullPath);
        return { nome: f, tamanho: stat.size, data: stat.mtime };
      })
      .sort((a, b) => b.data - a.data)
      .slice(0, 50);
    res.json(arquivos);
  } catch (err) { next(err); }
});

// Gera um novo backup, salva no servidor e devolve o arquivo
router.post('/gerar', auth, async (req, res, next) => {
  try {
    const agora = new Date();
    const timestamp = agora.toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const nomeArquivo = `backup_fabrica_${timestamp}.sql`;
    const destPath = path.join(BACKUP_DIR, nomeArquivo);

    await mysqldump({
      connection: {
        host: db.host,
        port: db.port || 3306,
        user: db.username,
        password: db.password || '',
        database: db.database,
      },
      dumpToFile: destPath,
    });

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${nomeArquivo}"`);
    fs.createReadStream(destPath).pipe(res);
  } catch (err) {
    console.error('[backup] erro ao gerar backup:', err.message);
    next(err);
  }
});

// Download de um backup específico pelo nome
router.get('/arquivo/:nome', auth, (req, res, next) => {
  try {
    const nome = path.basename(req.params.nome);
    if (!nome.endsWith('.sql')) return res.status(400).json({ error: 'Arquivo inválido.' });
    const filePath = path.join(BACKUP_DIR, nome);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Arquivo não encontrado.' });
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${nome}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (err) { next(err); }
});

// Exclui um backup do servidor
router.delete('/arquivo/:nome', auth, (req, res, next) => {
  try {
    const nome = path.basename(req.params.nome);
    if (!nome.endsWith('.sql')) return res.status(400).json({ error: 'Arquivo inválido.' });
    const filePath = path.join(BACKUP_DIR, nome);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Arquivo não encontrado.' });
    fs.unlinkSync(filePath);
    res.json({ message: 'Backup excluído com sucesso.' });
  } catch (err) { next(err); }
});

// Restaura banco a partir de arquivo .sql enviado pelo usuário
router.post('/restaurar', auth, upload.single('arquivo'), (req, res, next) => {
  if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  const tmpPath = req.file.path;
  executarRestauracao(tmpPath, true, res, next);
});

// Restaura banco a partir de backup salvo no servidor
router.post('/restaurar-servidor/:nome', auth, (req, res, next) => {
  try {
    const nome = path.basename(req.params.nome);
    if (!nome.endsWith('.sql')) return res.status(400).json({ error: 'Arquivo inválido.' });
    const filePath = path.join(BACKUP_DIR, nome);
    if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Arquivo não encontrado.' });
    executarRestauracao(filePath, false, res, next);
  } catch (err) { next(err); }
});

function executarRestauracao(filePath, removerApos, res, next) {
  // Tenta encontrar o binário mysql no sistema
  const mysqlBin = encontrarMysql();
  const senha = db.password ? `-p${db.password}` : '';
  const bin = mysqlBin.includes(' ') ? `"${mysqlBin}"` : mysqlBin;
  const cmd = [bin, `-h ${db.host}`, `-P ${db.port || 3306}`, `-u ${db.username}`, senha, db.database, `< "${filePath}"`].filter(Boolean).join(' ');

  exec(cmd, { shell: true }, (err, stdout, stderr) => {
    if (removerApos) { try { fs.unlinkSync(filePath); } catch {} }
    if (err) {
      console.error('[backup] erro na restauração:', stderr || err.message);
      return res.status(500).json({ error: 'Erro ao restaurar. Certifique-se que o cliente MySQL está instalado e no PATH.' });
    }
    res.json({ message: 'Banco de dados restaurado com sucesso!' });
  });
}

function encontrarMysql() {
  const { execSync } = require('child_process');
  try {
    const r = execSync('where mysql', { timeout: 2000 }).toString().trim().split(/\r?\n/)[0].trim();
    if (r && fs.existsSync(r)) return r;
  } catch {}
  const candidatos = [];
  for (let v = 9; v >= 5; v--) {
    for (let m = 9; m >= 0; m--) {
      candidatos.push(`C:\\Program Files\\MySQL\\MySQL Server ${v}.${m}\\bin\\mysql.exe`);
    }
  }
  candidatos.push('C:\\xampp\\mysql\\bin\\mysql.exe', 'C:\\wamp64\\bin\\mysql\\bin\\mysql.exe');
  for (const c of candidatos) { if (fs.existsSync(c)) return c; }
  return 'mysql';
}

module.exports = router;
