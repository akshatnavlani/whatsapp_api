import express from 'express'
import { create } from '@wppconnect-team/wppconnect'
import fs from 'fs'
import path from 'path'

const app = express()
app.use(express.json())

let client;

// Use Render's writable persistent path
const TOKEN_PATH = path.join('/data', 'tokens');
const QR_FILE = path.join(TOKEN_PATH, 'last.qr');

// Ensure token directory exists
if (!fs.existsSync(TOKEN_PATH)) {
    fs.mkdirSync(TOKEN_PATH, { recursive: true });
}

// Start WPPConnect
create({
    session: 'my-session',
    catchQR: (base64Qr) => {
        fs.writeFileSync(QR_FILE, base64Qr); // Save QR to persistent storage
    },
    statusFind: (status) => console.log('Status:', status),
    headless: true,
    useChrome: false,
    browserArgs: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
    ],
    pathName: TOKEN_PATH, // persistent token storage
}).then((wppClient) => {
    client = wppClient;
    console.log("WhatsApp client ready");
}).catch(err => console.error(err));

// Serve QR as webpage
app.get('/qr', (req, res) => {
    if (fs.existsSync(QR_FILE)) {
        const qr = fs.readFileSync(QR_FILE).toString();
        res.send(`<html><body><h2>Scan this QR:</h2><img src="${qr}" /></body></html>`);
    } else {
        res.send('QR not generated yet or already scanned.');
    }
});

// Send a message with mentions
app.post('/send', async (req, res) => {
    const { to, message, mentions } = req.body;
    if (!client) return res.status(500).send('WhatsApp client not ready');
    try {
        await client.sendText(to, message, { mentions });
        res.send({ success: true });
    } catch (err) {
        res.status(500).send({ success: false, error: err.message });
    }
});

// Keep-alive ping
app.get('/ping', (req, res) => res.send({ status: 'OK', time: new Date() }));

// Health route
app.get('/', (req, res) => res.send('Bot is running'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
