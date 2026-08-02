import express from 'express';
import path from 'path';
import http from 'http';
import { spawn, spawnSync } from 'child_process';
import { createServer as createViteServer } from 'vite';

function findPythonCommand() {
  const candidates = ['python3', 'python', 'py'];
  for (const command of candidates) {
    try {
      const result = spawnSync(command, ['--version'], { stdio: 'ignore' });
      if (result.status === 0) {
        return command;
      }
    } catch (_err) {
      continue;
    }
  }
  return 'python3';
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  const pythonCommand = findPythonCommand();
  console.log(`🚀 Launching Python 3.10 Backend Engine on port 8000 using ${pythonCommand}...`);
  const pyProcess = spawn(pythonCommand, ['server.py'], {
    stdio: 'inherit',
    env: { ...process.env },
  });

  pyProcess.on('error', (err) => {
    console.error('❌ Failed to launch Python backend process:', err);
  });

  // Brief pause to allow Python HTTP server to bind to port 8000
  await new Promise((resolve) => setTimeout(resolve, 600));

  // Proxy ALL /api/* requests to Python backend running at http://127.0.0.1:8000
  app.use('/api', (req, res) => {
    const targetUrl = `/api${req.url}`;
    
    const proxyReq = http.request(
      {
        hostname: '127.0.0.1',
        port: 8000,
        path: targetUrl,
        method: req.method,
        headers: {
          ...req.headers,
          host: '127.0.0.1:8000',
        },
      },
      (pyRes) => {
        res.writeHead(pyRes.statusCode || 200, pyRes.headers);
        pyRes.pipe(res, { end: true });
      }
    );

    proxyReq.on('error', (err) => {
      console.error('API Proxy Error to Python server:', err.message);
      if (!res.headersSent) {
        res.status(502).json({ error: 'Python backend service starting or unavailable' });
      }
    });

    req.pipe(proxyReq, { end: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Central Mall Server running on http://0.0.0.0:${PORT} (Powered by Python 3.10 Backend)`);
  });
}

startServer();
