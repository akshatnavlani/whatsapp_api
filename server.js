import express from 'express'
import { create } from '@wppconnect-team/wppconnect'
import puppeteer from 'puppeteer'
import fs from 'fs'
import path from 'path'

const app = express()
app.use(express.json())

let client;
const TOKEN_PATH = path.join('./tokens'); // store in repo folder
const QR_FILE = path.join(TOKEN_PATH, 'last.qr');

// Ensure token directory exists
if (!fs.existsSync(TOKEN_PATH)) fs.mkdirSync(TOKEN_PATH, { recursive: true });

// Get Puppeteer's bundled Chromium path
const executablePath = puppeteer.executabl
