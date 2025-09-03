import 'dotenv/config';
import WebSocket from 'ws';
import { spawn } from 'child_process';

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
const MIC_NAME = "Microphone (Realtek(R) Audio)";

const ws = new WebSocket(
  `wss://api.deepgram.com/v1/listen?model=nova&language=en-US`,
  {
    headers: { Authorization: `Token ${DEEPGRAM_API_KEY}` }
  }
);

ws.on('open', () => {
  console.log('✅ Connected to Deepgram Live API');

  // Start SoX to capture microphone audio
  const mic = spawn('sox', [
    '-t', 'waveaudio', MIC_NAME,
    '-c', '1',      // mono
    '-r', '16000',  // 16kHz
    '-b', '16',     // 16-bit
    '-e', 'signed-integer',
    '-t', 'raw',    // raw PCM output
    '-'
  ]);

  mic.stdout.on('data', (chunk) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(chunk);
    }
  });

  mic.stderr.on('data', (err) => console.error('SoX error:', err.toString()));
  mic.on('exit', (code) => {
    console.log('SoX exited with code', code);
    ws.close();
  });
});

ws.on('message', (msg) => {
  const data = JSON.parse(msg.toString());
  if (data.channel && data.channel.alternatives) {
    const transcript = data.channel.alternatives[0].transcript;
    if (transcript) console.log('📝 Transcript:', transcript);
  }
});

ws.on('close', () => console.log('🔒 Connection closed'));
ws.on('error', (err) => console.error('❌ WebSocket error:', err));
