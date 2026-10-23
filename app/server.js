const express = require('express');
const { Pool } = require('pg');
const client = require('prom-client');
const path = require('path');
const winston = require('winston');

const app = express();
const port = process.env.PORT || 3000;

// Structured logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'fleet-app' },
  transports: [
    new winston.transports.Console()
  ]
});

// Database pool
const pool = new Pool({
  host: process.env.DB_HOST || 'fleet-postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'fleetdb',
  user: process.env.DB_USER || 'fleet_user',
  password: process.env.DB_PASSWORD || 'FleetSecret2026!Secure',
});

// Prometheus Metrics setup
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status']
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2]
});

// Middleware for metrics & request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    httpRequestCounter.inc({ method: req.method, route, status: res.statusCode });
    httpRequestDuration.observe({ method: req.method, route, status: res.statusCode }, duration);
    logger.info({
      message: 'HTTP Request completed',
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${(duration * 1000).toFixed(2)}ms`,
      ip: req.ip || req.headers['x-forwarded-for']
    });
  });
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Auto initialize tables and sample data
async function initDatabase() {
  let retries = 5;
  while (retries > 0) {
    try {
      logger.info({ message: 'Connecting to database and verifying schema...' });
      
      // Drivers table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS drivers (
          id SERIAL PRIMARY KEY,
          full_name VARCHAR(100) NOT NULL,
          license_number VARCHAR(50) UNIQUE NOT NULL,
          phone VARCHAR(20) NOT NULL,
          experience_years INT DEFAULT 1,
          status VARCHAR(30) DEFAULT 'Sẵn sàng',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Vehicles table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS vehicles (
          id SERIAL PRIMARY KEY,
          plate_number VARCHAR(20) UNIQUE NOT NULL,
          model VARCHAR(100) NOT NULL,
          vehicle_type VARCHAR(50) NOT NULL,
          load_capacity NUMERIC(10,2) DEFAULT 0,
          status VARCHAR(30) DEFAULT 'Sẵn sàng',
          current_odometer INT DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Schedules / Trips table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS schedules (
          id SERIAL PRIMARY KEY,
          vehicle_id INT REFERENCES vehicles(id) ON DELETE CASCADE,
          driver_id INT REFERENCES drivers(id) ON DELETE CASCADE,
          departure VARCHAR(255) NOT NULL,
          destination VARCHAR(255) NOT NULL,
          departure_time TIMESTAMP NOT NULL,
          estimated_arrival TIMESTAMP,
          cargo_weight NUMERIC(10,2),
          status VARCHAR(30) DEFAULT 'Đã xếp lịch',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Maintenance table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS maintenances (
          id SERIAL PRIMARY KEY,
          vehicle_id INT REFERENCES vehicles(id) ON DELETE CASCADE,
          maintenance_date DATE NOT NULL,
          description TEXT NOT NULL,
          cost NUMERIC(12,2) DEFAULT 0,
          service_provider VARCHAR(255),
          status VARCHAR(30) DEFAULT 'Hoàn thành',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Check if sample data exists
      const checkCount = await pool.query('SELECT count(*) FROM vehicles');
      if (parseInt(checkCount.rows[0].count) === 0) {
        logger.info({ message: 'Seeding initial fleet demo data...' });
        
        await pool.query(`
          INSERT INTO drivers (full_name, license_number, phone, experience_years, status) VALUES
          ('Nguyễn Văn An', 'B2-8921471', '0901234567', 5, 'Đang chạy chuyến'),
          ('Trần Đình Bình', 'FC-1192834', '0912345678', 8, 'Sẵn sàng'),
          ('Lê Hồng Cường', 'C-7748192', '0983456789', 3, 'Sẵn sàng'),
          ('Phạm Minh Dũng', 'FC-9948123', '0974567890', 10, 'Nghỉ phép');

          INSERT INTO vehicles (plate_number, model, vehicle_type, load_capacity, status, current_odometer) VALUES
          ('29H-123.45', 'Hyundai HD120', 'Xe tải thùng 8 tấn', 8.5, 'Đang chạy chuyến', 45200),
          ('29C-789.10', 'Isuzu Forward FVR', 'Xe tải đông lạnh 5 tấn', 5.0, 'Sẵn sàng', 28100),
          ('29KT-334.56', 'Hino 500 Series FL', 'Xe tải 15 tấn', 15.0, 'Đang bảo dưỡng', 112000),
          ('30A-998.88', 'Ford Transit 16 chỗ', 'Xe đưa đón chở khách', 1.5, 'Sẵn sàng', 63500);

          INSERT INTO schedules (vehicle_id, driver_id, departure, destination, departure_time, estimated_arrival, cargo_weight, status) VALUES
          (1, 1, 'Hà Nội (Kho Long Biên)', 'Hải Phòng (Cảng Đình Vũ)', CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP + INTERVAL '1 hour', 7.8, 'Đang di chuyển'),
          (2, 2, 'Hà Nội (Kho Đông Anh)', 'Bắc Ninh (KCN Quế Võ)', CURRENT_TIMESTAMP + INTERVAL '4 hours', CURRENT_TIMESTAMP + INTERVAL '6 hours', 4.2, 'Đã xếp lịch');

          INSERT INTO maintenances (vehicle_id, maintenance_date, description, cost, service_provider, status) VALUES
          (3, CURRENT_DATE, 'Đại tu hệ thống phanh ABS và thay dầu nhớt động cơ', 8500000, 'Hino Auto Service Hà Nội', 'Đang thực hiện'),
          (1, CURRENT_DATE - INTERVAL '15 days', 'Thay lọc gió, bảo dưỡng định kỳ 40,000 km', 3200000, 'Hyundai Truck Care', 'Hoàn thành'),
          (4, CURRENT_DATE - INTERVAL '30 days', 'Thay 4 lốp Michelin và căn chỉnh độ chụm', 12400000, 'Michelin Car Care', 'Hoàn thành');
        `);
        logger.info({ message: 'Seeding completed successfully.' });
      }

      logger.info({ message: 'Database schema is ready.' });
      break;
    } catch (err) {
      retries--;
      logger.error({ message: 'Database initialization failed, retrying in 3s...', error: err.message });
      await new Promise(r => setTimeout(r, 3000));
    }
  }
}

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// Health check
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'UP', database: 'connected', timestamp: new Date() });
  } catch (err) {
    res.status(503).json({ status: 'DOWN', error: err.message });
  }
});

// API: Stats Overview
app.get('/api/stats', async (req, res) => {
  try {
    const vRes = await pool.query('SELECT count(*) as total, count(*) FILTER (WHERE status = \'Sẵn sàng\') as available, count(*) FILTER (WHERE status = \'Đang chạy chuyến\') as on_trip, count(*) FILTER (WHERE status = \'Đang bảo dưỡng\') as in_maintenance FROM vehicles');
    const dRes = await pool.query('SELECT count(*) as total, count(*) FILTER (WHERE status = \'Sẵn sàng\') as available FROM drivers');
    const sRes = await pool.query('SELECT count(*) as total, count(*) FILTER (WHERE status = \'Đang di chuyển\') as active FROM schedules');
    const mRes = await pool.query('SELECT count(*) as total, coalesce(sum(cost), 0) as total_cost FROM maintenances');

    res.json({
      vehicles: vRes.rows[0],
      drivers: dRes.rows[0],
      schedules: sRes.rows[0],
      maintenances: mRes.rows[0]
    });
  } catch (err) {
    logger.error({ message: 'Error fetching stats', error: err.message });
    res.status(500).json({ error: err.message });
  }
});

// API: Vehicles
app.get('/api/vehicles', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vehicles ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/vehicles', async (req, res) => {
  const { plate_number, model, vehicle_type, load_capacity, status, current_odometer } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO vehicles (plate_number, model, vehicle_type, load_capacity, status, current_odometer)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [plate_number, model, vehicle_type, load_capacity || 0, status || 'Sẵn sàng', current_odometer || 0]
    );
    logger.info({ message: 'Vehicle created', plate: plate_number });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    logger.error({ message: 'Failed to create vehicle', error: err.message });
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/vehicles/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM vehicles WHERE id = $1', [req.params.id]);
    logger.info({ message: 'Vehicle deleted', id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Drivers
app.get('/api/drivers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM drivers ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/drivers', async (req, res) => {
  const { full_name, license_number, phone, experience_years, status } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO drivers (full_name, license_number, phone, experience_years, status)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [full_name, license_number, phone, experience_years || 1, status || 'Sẵn sàng']
    );
    logger.info({ message: 'Driver created', driver: full_name });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    logger.error({ message: 'Failed to create driver', error: err.message });
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/drivers/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM drivers WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Schedules (Lịch trình)
app.get('/api/schedules', async (req, res) => {
  try {
    const query = `
      SELECT s.*, v.plate_number, v.model, d.full_name as driver_name, d.phone as driver_phone
      FROM schedules s
      LEFT JOIN vehicles v ON s.vehicle_id = v.id
      LEFT JOIN drivers d ON s.driver_id = d.id
      ORDER BY s.id DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/schedules', async (req, res) => {
  const { vehicle_id, driver_id, departure, destination, departure_time, estimated_arrival, cargo_weight, status } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO schedules (vehicle_id, driver_id, departure, destination, departure_time, estimated_arrival, cargo_weight, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [vehicle_id, driver_id, departure, destination, departure_time, estimated_arrival || null, cargo_weight || 0, status || 'Đã xếp lịch']
    );
    logger.info({ message: 'Schedule trip created', scheduleId: result.rows[0].id });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    logger.error({ message: 'Failed to create schedule', error: err.message });
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/schedules/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM schedules WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: Maintenance (Bảo dưỡng)
app.get('/api/maintenances', async (req, res) => {
  try {
    const query = `
      SELECT m.*, v.plate_number, v.model
      FROM maintenances m
      LEFT JOIN vehicles v ON m.vehicle_id = v.id
      ORDER BY m.id DESC
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/maintenances', async (req, res) => {
  const { vehicle_id, maintenance_date, description, cost, service_provider, status } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO maintenances (vehicle_id, maintenance_date, description, cost, service_provider, status)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [vehicle_id, maintenance_date || new Date(), description, cost || 0, service_provider, status || 'Hoàn thành']
    );
    logger.info({ message: 'Maintenance recorded', id: result.rows[0].id, vehicle_id });
    res.status(201).json(result.rows[0]);
  } catch (err) {
    logger.error({ message: 'Failed to record maintenance', error: err.message });
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/maintenances/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM maintenances WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(port, () => {
  logger.info({ message: `Fleet Management Server is running on port ${port}` });
  initDatabase();
});
