import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import apiRouter from './server/api';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // API router
  app.use('/api', apiRouter);

  // Serve frontend assets or mount Vite dev server
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite development server is integrated as middleware.');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Production server serves assets from:', distPath);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[WorkPulse Server] Running on ingress gateway port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start WorkPulse fullstack container server:', err);
});
