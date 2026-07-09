import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 8751;
const DATA_DIR = join(__dirname, 'data');
const VISITORS_FILE = join(DATA_DIR, 'visitors.json');

// Ensure data directory exists
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
if (!existsSync(VISITORS_FILE)) writeFileSync(VISITORS_FILE, '[]');

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Serve static files from dist
app.use(express.static(join(__dirname, 'dist')));

// ===== API: Receive visitor data =====
app.post('/api/track', (req, res) => {
  try {
    const visitor = {
      ...req.body,
      serverTimestamp: new Date().toISOString(),
      serverIP: req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.socket.remoteAddress
    };

    const visitors = JSON.parse(readFileSync(VISITORS_FILE, 'utf8'));
    visitors.push(visitor);
    writeFileSync(VISITORS_FILE, JSON.stringify(visitors, null, 2));

    console.log(`[${new Date().toLocaleTimeString()}] 📡 Nuevo visitante: ${visitor.ip_red?.ip || visitor.serverIP} - ${visitor.dispositivo?.ciudad || ''} ${visitor.dispositivo?.pais || ''}`);
    res.json({ ok: true });
  } catch (e) {
    console.error('Error guardando datos:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ===== API: Get all visitors =====
app.get('/api/visitors', (req, res) => {
  try {
    const visitors = JSON.parse(readFileSync(VISITORS_FILE, 'utf8'));
    res.json(visitors);
  } catch (e) {
    res.json([]);
  }
});

// ===== API: Clear visitors =====
app.delete('/api/visitors', (req, res) => {
  writeFileSync(VISITORS_FILE, '[]');
  res.json({ ok: true, message: 'Datos eliminados' });
});

// ===== Admin Panel =====
app.get('/admin', (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Starlink Tracker - Panel Admin</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0a; color: #e0e0e0; }
    .header { background: #111; border-bottom: 1px solid #222; padding: 20px 30px; display: flex; justify-content: space-between; align-items: center; }
    .header h1 { font-size: 20px; color: #00d4ff; }
    .header span { color: #666; font-size: 13px; }
    .stats-bar { display: flex; gap: 20px; padding: 20px 30px; background: #111; border-bottom: 1px solid #1a1a1a; }
    .stat-box { background: #1a1a1a; border: 1px solid #222; border-radius: 8px; padding: 16px 24px; min-width: 150px; }
    .stat-box .label { font-size: 12px; color: #666; margin-bottom: 4px; }
    .stat-box .value { font-size: 28px; font-weight: 700; color: #00d4ff; }
    .controls { padding: 16px 30px; display: flex; gap: 12px; }
    .btn { padding: 8px 20px; border-radius: 4px; border: 1px solid #333; background: #1a1a1a; color: #ccc; cursor: pointer; font-size: 13px; }
    .btn:hover { border-color: #00d4ff; color: #00d4ff; }
    .btn-danger { border-color: #ef4444; color: #ef4444; }
    .btn-danger:hover { background: #ef4444; color: #fff; }
    .table-wrap { padding: 0 30px 30px; overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { background: #1a1a1a; color: #00d4ff; padding: 12px 10px; text-align: left; border-bottom: 1px solid #222; position: sticky; top: 0; }
    td { padding: 10px; border-bottom: 1px solid #1a1a1a; vertical-align: top; }
    tr:hover td { background: rgba(0,212,255,0.03); }
    .tag { display: inline-block; padding: 2px 8px; border-radius: 3px; font-size: 11px; font-weight: 600; }
    .tag-mobile { background: #7c3aed20; color: #a78bfa; }
    .tag-desktop { background: #0ea5e920; color: #38bdf8; }
    .tag-tablet { background: #f59e0b20; color: #fbbf24; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 1000; display: none; align-items: center; justify-content: center; }
    .modal-overlay.show { display: flex; }
    .modal { background: #111; border: 1px solid #222; border-radius: 12px; padding: 30px; max-width: 700px; width: 90%; max-height: 80vh; overflow-y: auto; }
    .modal h3 { color: #00d4ff; margin-bottom: 20px; }
    .modal pre { background: #0a0a0a; padding: 16px; border-radius: 8px; font-size: 12px; overflow-x: auto; border: 1px solid #222; }
    .modal .close-btn { position: absolute; top: 16px; right: 20px; background: none; border: none; color: #666; font-size: 24px; cursor: pointer; }
    .badge { background: #22c55e20; color: #22c55e; padding: 2px 8px; border-radius: 10px; font-size: 11px; }
    .empty { text-align: center; padding: 60px; color: #444; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📡 Starlink Tracker - Panel Admin</h1>
    <span id="lastUpdate"></span>
  </div>
  <div class="stats-bar" id="statsBar"></div>
  <div class="controls">
    <button class="btn" onclick="loadData()">🔄 Actualizar</button>
    <button class="btn" onclick="exportCSV()">📥 Exportar CSV</button>
    <button class="btn btn-danger" onclick="clearData()">🗑️ Borrar todo</button>
  </div>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Fecha</th>
          <th>IP</th>
          <th>Ubicación</th>
          <th>ISP</th>
          <th>Dispositivo</th>
          <th>SO</th>
          <th>Navegador</th>
          <th>Pantalla</th>
          <th>Tiempo</th>
          <th></th>
        </tr>
      </thead>
      <tbody id="tbody"></tbody>
    </table>
  </div>

  <div class="modal-overlay" id="modal" onclick="if(event.target===this)closeModal()">
    <div class="modal" style="position:relative">
      <button class="close-btn" onclick="closeModal()">&times;</button>
      <h3 id="modalTitle">Detalle del visitante</h3>
      <pre id="modalContent"></pre>
    </div>
  </div>

  <script>
    let allData = [];

    async function loadData() {
      try {
        const res = await fetch('/api/visitors');
        allData = await res.json();
        renderStats();
        renderTable();
        document.getElementById('lastUpdate').textContent = 'Actualizado: ' + new Date().toLocaleTimeString();
      } catch (e) {
        console.error('Error cargando datos:', e);
      }
    }

    function renderStats() {
      const uniqueIPs = new Set(allData.map(v => v.ip_red?.ip || v.serverIP)).size;
      const countries = new Set(allData.map(v => v.ip_red?.pais || 'N/A')).size;
      const mobile = allData.filter(v => v.dispositivo?.tipo === 'Móvil').length;
      const desktop = allData.filter(v => v.dispositivo?.tipo === 'Escritorio').length;
      document.getElementById('statsBar').innerHTML = 
        '<div class="stat-box"><div class="label">Total visitas</div><div class="value">' + allData.length + '</div></div>' +
        '<div class="stat-box"><div class="label">IPs únicas</div><div class="value">' + uniqueIPs + '</div></div>' +
        '<div class="stat-box"><div class="label">Países</div><div class="value">' + countries + '</div></div>' +
        '<div class="stat-box"><div class="label">Móvil</div><div class="value">' + mobile + '</div></div>' +
        '<div class="stat-box"><div class="label">Escritorio</div><div class="value">' + desktop + '</div></div>';
    }

    function renderTable() {
      const tbody = document.getElementById('tbody');
      if (allData.length === 0) {
        tbody.innerHTML = '<tr><td colspan="11" class="empty">Sin datos aún. Esperando visitantes...</td></tr>';
        return;
      }
      tbody.innerHTML = allData.slice().reverse().map((v, i) => {
        const ip = v.ip_red || {};
        const dev = v.dispositivo || {};
        const scr = v.pantalla || {};
        const hw = v.hardware || {};
        const tipo = dev.tipo || 'N/A';
        const tipoClass = tipo === 'Móvil' ? 'tag-mobile' : tipo === 'Tablet' ? 'tag-tablet' : 'tag-desktop';
        const tiempo = v._resumen ? v._resumen.tiempoEnPagina + 's' : 'N/A';
        const fecha = v.sesion?.timestamp || v.serverTimestamp || 'N/A';
        return '<tr>' +
          '<td>' + (allData.length - i) + '</td>' +
          '<td>' + new Date(fecha).toLocaleString() + '</td>' +
          '<td><strong>' + (ip.ip || v.serverIP || 'N/A') + '</strong></td>' +
          '<td>' + (ip.ciudad || 'N/A') + ', ' + (ip.region || '') + '<br><small>' + (ip.pais || 'N/A') + '</small></td>' +
          '<td><small>' + (ip.proveedor || ip.isp || 'N/A') + '</small></td>' +
          '<td><span class="tag ' + tipoClass + '">' + tipo + '</span><br><small>' + (dev.marca || '') + '</small></td>' +
          '<td>' + (dev.sistemaOperativo || 'N/A') + '</td>' +
          '<td>' + (dev.navegador || 'N/A') + ' ' + (dev.versionNavegador || '') + '</td>' +
          '<td>' + (scr.ancho || '?') + 'x' + (scr.alto || '?') + '<br><small>' + (scr.pixelRatio || '1') + 'x</small></td>' +
          '<td>' + tiempo + '</td>' +
          '<td><button class="btn" onclick="showDetail(' + (allData.length - 1 - i) + ')">🔍</button></td>' +
          '</tr>';
      }).join('');
    }

    function showDetail(idx) {
      const v = allData[idx];
      document.getElementById('modalTitle').textContent = 'Visitante: ' + (v.ip_red?.ip || v.serverIP || 'N/A');
      document.getElementById('modalContent').textContent = JSON.stringify(v, null, 2);
      document.getElementById('modal').classList.add('show');
    }

    function closeModal() {
      document.getElementById('modal').classList.remove('show');
    }

    function exportCSV() {
      if (allData.length === 0) return alert('No hay datos');
      const headers = ['#', 'Fecha', 'IP', 'Ciudad', 'Región', 'País', 'ISP', 'ASN', 'Lat', 'Lon', 'Tipo', 'Marca', 'SO', 'Navegador', 'Resolución', 'CPU Cores', 'RAM', 'Tiempo'];
      const rows = allData.map((v, i) => {
        const ip = v.ip_red || {};
        const dev = v.dispositivo || {};
        const scr = v.pantalla || {};
        const hw = v.hardware || {};
        const t = v._resumen ? v._resumen.tiempoEnPagina : '';
        return [i+1, v.sesion?.timestamp, ip.ip || v.serverIP, ip.ciudad, ip.region, ip.pais, ip.proveedor || ip.isp, ip.asn, ip.latitud, ip.longitud, dev.tipo, dev.marca, dev.sistemaOperativo, dev.navegador, (scr.ancho||'')+'x'+(scr.alto||''), hw.cpuCores, hw.ramGB, t].map(x => '"'+(x||'')+'"').join(',');
      });
      const csv = [headers.join(','), ...rows].join('\\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'starlink-visitantes-' + new Date().toISOString().slice(0,10) + '.csv';
      a.click();
    }

    async function clearData() {
      if (!confirm('¿Borrar todos los datos?')) return;
      await fetch('/api/visitors', { method: 'DELETE' });
      loadData();
    }

    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
    loadData();
    setInterval(loadData, 10000);
  </script>
</body>
</html>`);
});

// SPA fallback
app.use((req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════════════╗');
  console.log('  ║  📡 Starlink Server corriendo                ║');
  console.log('  ║                                              ║');
  console.log('  ║  Página:  http://0.0.0.0:' + PORT + '              ║');
  console.log('  ║  Admin:   http://0.0.0.0:' + PORT + '/admin        ║');
  console.log('  ║  API:     http://0.0.0.0:' + PORT + '/api/visitors ║');
  console.log('  ╚══════════════════════════════════════════════╝');
  console.log('');
});
