import express from 'express'
import { create } from '@wppconnect-team/wppconnect'
import fs from 'fs'
import path from 'path'

const app = express()
app.use(express.json())

let client;
const TOKEN_PATH = '/app/tokens' // persistent disk mount path on Render
const QR_FILE = path.join(TOKEN_PATH, 'last.qr')

// Ensure token directory exists
if (!fs.existsSync(TOKEN_PATH)) fs.mkdirSync(TOKEN_PATH, { recursive: true })

// Start WPPConnect with persistent session
create({
    session: 'my-session',
    catchQR: (base64Qr) => {
        fs.writeFileSync(QR_FILE, base64Qr) // Save latest QR to persistent file
    },
    statusFind: (status) => console.log('Status:', status),
    headless: true,
    useChrome: false,
    browserArgs: ['--no-sandbox'],
    pathName: TOKEN_PATH, // persistent storage
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

// Wake-up route
app.get('/ping', (req, res) => {
    res.send('OK');
});

// Root route for health check
app.get('/', (req, res) => res.send('Bot is running'));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
