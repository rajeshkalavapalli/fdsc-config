require('dotenv').config({ quiet: true });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const db = require('./db');
const Enquiries = require('./controllers/Enquiries');

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.set('trust proxy', 1);
app.use(express.json({ limit: '20kb' }));

// CORS_ORIGINS: the website addresses allowed to send enquiries. Empty: any (development only).
const allowedOrigins = (process.env.CORS_ORIGINS || '').split(',').map((o) => o.trim()).filter(Boolean);
app.use(cors(allowedOrigins.length ? { origin: allowedOrigins, methods: ['POST'] } : {}));

app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/api', Enquiries);
app.use((req, res) => res.status(404).json({ message: 'Not found.' }));

const PORT = Number(process.env.PORT) || 5010;
app.listen(PORT, () => {
    console.log(`FDSC Public API running on port ${PORT}`);
    db.warmUp();
});
