#!/usr/bin/env node
/**
 * Jetro MCP caller — communicates with the jetro MCP server via stdio protocol
 * and calls jet_canvas + jet_render to build the canvas workspace.
 */
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const JWT = process.env.JET_JWT;
const WORKSPACE = process.env.JET_WORKSPACE || 'd:\\Jetro-AI';

const mcp = spawn(
  'C:\\Users\\shiva\\.jetro\\runtime\\node-win32-x64.exe',
  ['C:\\Users\\shiva\\.jetro\\mcp-server\\index.js'],
  {
    env: {
      ...process.env,
      JET_WORKSPACE: WORKSPACE,
      JET_API_URL: 'https://api.jetro.ai',
      JET_JWT: JWT,
    },
    stdio: ['pipe', 'pipe', 'pipe'],
  }
);

let idCounter = 1;
let buffer = '';
const pending = new Map();

mcp.stderr.on('data', (d) => process.stderr.write('[mcp-err] ' + d));

mcp.stdout.on('data', (chunk) => {
  buffer += chunk.toString();
  // Parse LSP-style framed messages: Content-Length: N\r\n\r\n{json}
  while (true) {
    const headerEnd = buffer.indexOf('\r\n\r\n');
    if (headerEnd === -1) break;
    const header = buffer.slice(0, headerEnd);
    const lenMatch = header.match(/Content-Length:\s*(\d+)/i);
    if (!lenMatch) { buffer = buffer.slice(headerEnd + 4); continue; }
    const len = parseInt(lenMatch[1], 10);
    const start = headerEnd + 4;
    if (buffer.length < start + len) break;
    const body = buffer.slice(start, start + len);
    buffer = buffer.slice(start + len);
    try {
      const msg = JSON.parse(body);
      if (msg.id !== undefined && pending.has(msg.id)) {
        const { resolve, reject } = pending.get(msg.id);
        pending.delete(msg.id);
        if (msg.error) reject(new Error(JSON.stringify(msg.error)));
        else resolve(msg.result);
      }
    } catch (e) {
      console.error('Parse error:', e.message);
    }
  }
});

function send(method, params) {
  return new Promise((resolve, reject) => {
    const id = idCounter++;
    pending.set(id, { resolve, reject });
    const msg = JSON.stringify({ jsonrpc: '2.0', id, method, params });
    const frame = `Content-Length: ${Buffer.byteLength(msg)}\r\n\r\n${msg}`;
    mcp.stdin.write(frame);
  });
}

function callTool(name, args) {
  return send('tools/call', { name, arguments: args });
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  // Initialize
  await send('initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: { name: 'jetro-canvas-builder', version: '1.0' },
  });
  await send('notifications/initialized', {});

  console.log('✅ MCP initialized');

  // 1) Read canvas state
  console.log('📖 Reading canvas state...');
  const canvasState = await callTool('jet_canvas', { action: 'read' });
  console.log('Canvas:', JSON.stringify(canvasState).slice(0, 300));

  await sleep(500);

  // 2) Render live app embed
  console.log('🌐 Rendering live app embed...');
  const embed = await callTool('jet_render', {
    type: 'embed',
    position: { x: 40, y: 40 },
    size: { width: 900, height: 540 },
    data: {
      title: 'AI Job App Manager — Live',
      url: 'https://application-manager-7juh.onrender.com',
    },
  });
  console.log('Embed:', JSON.stringify(embed).slice(0, 200));
  await sleep(600);

  // 3) Render pipeline chart
  console.log('📊 Rendering pipeline chart...');
  const chart = await callTool('jet_render', {
    type: 'chart',
    position: { x: 960, y: 40 },
    size: { width: 480, height: 360 },
    data: {
      title: 'Recruitment Pipeline',
      type: 'bar',
      traces: [
        {
          x: ['Applied', 'Round 1', 'Round 2', 'Offer', 'Rejected'],
          y: [3, 2, 2, 2, 1],
          type: 'bar',
          marker: {
            color: ['#3b82f6', '#10b981', '#f59e0b', '#22c55e', '#ef4444'],
          },
          text: ['3', '2', '2', '2', '1'],
          textposition: 'outside',
        },
      ],
      layout: {
        paper_bgcolor: '#0d1117',
        plot_bgcolor: '#161b22',
        font: { color: '#e6edf3', family: 'Inter, sans-serif', size: 12 },
        xaxis: { gridcolor: '#21262d', color: '#8b949e' },
        yaxis: { gridcolor: '#21262d', color: '#8b949e', title: 'Count' },
        margin: { t: 30, b: 40, l: 45, r: 20 },
        showlegend: false,
      },
    },
  });
  console.log('Chart:', JSON.stringify(chart).slice(0, 200));
  await sleep(600);

  // 4) Tech stack frame
  console.log('🏗️  Rendering tech stack...');
  const tech = await callTool('jet_render', {
    type: 'frame',
    position: { x: 960, y: 420 },
    size: { width: 480, height: 500 },
    data: {
      title: 'Tech Stack',
      file: '.jetro/frames/tech_stack.html',
    },
  });
  console.log('Tech:', JSON.stringify(tech).slice(0, 200));
  await sleep(600);

  // 5) Features card
  console.log('✨ Rendering features...');
  const features = await callTool('jet_render', {
    type: 'frame',
    position: { x: 40, y: 600 },
    size: { width: 600, height: 460 },
    data: {
      title: 'All Features',
      file: '.jetro/frames/features.html',
    },
  });
  console.log('Features:', JSON.stringify(features).slice(0, 200));
  await sleep(600);

  // 6) API routes card
  console.log('🔌 Rendering API routes...');
  const api = await callTool('jet_render', {
    type: 'frame',
    position: { x: 660, y: 600 },
    size: { width: 480, height: 460 },
    data: {
      title: 'API Routes Reference',
      file: '.jetro/frames/api_routes.html',
    },
  });
  console.log('API:', JSON.stringify(api).slice(0, 200));
  await sleep(600);

  console.log('\n🎉 All canvas elements rendered successfully!');
  console.log('Layout summary:');
  console.log('  [0,  40]  Live App Embed     (900×540)');
  console.log('  [960, 40] Pipeline Chart     (480×360)');
  console.log('  [960,420] Tech Stack         (480×500)');
  console.log('  [40, 600] All Features       (600×460)');
  console.log('  [660,600] API Routes         (480×460)');

  mcp.stdin.end();
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  mcp.kill();
  process.exit(1);
});
