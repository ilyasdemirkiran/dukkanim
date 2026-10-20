import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { connectDB } from './db';
import { authRoutes } from './routes/auth';
import { unitRoutes } from './routes/units';
import { currentCategoryRoutes } from './routes/currentCategories';
import { currentAccountRoutes } from './routes/currentAccounts';
import { productRoutes } from './routes/products';
import { saleRoutes } from './routes/sales';

const app = new Hono();

// Global Middlewares
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

// Health Check
app.get('/', (c) => {
  return c.json({
    status: 'online',
    app: 'Özyurt Zahire Muhasebe API',
    version: '1.0.0',
    port: 4444,
  });
});

// Routes
app.route('/api/auth', authRoutes);
app.route('/api/units', unitRoutes);
app.route('/api/current-categories', currentCategoryRoutes);
app.route('/api/current-accounts', currentAccountRoutes);
app.route('/api/products', productRoutes);
app.route('/api/sales', saleRoutes);

const PORT = Number(process.env.PORT) || 4444;

async function bootstrap() {
  await connectDB();
  console.log(`🚀 Özyurt Zahire Backend running on http://0.0.0.0:${PORT}`);
}

bootstrap();

export default {
  port: PORT,
  fetch: app.fetch,
};
