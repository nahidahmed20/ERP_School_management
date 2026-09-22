// Usage: node tests/frontend/camera-capture-browser.mjs [path/to/chrome]
// Uses mocked camera devices only; never accesses a real camera or ERP data.
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { build } from 'esbuild';

const chrome = [process.argv[2], process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean).find(existsSync);
assert.ok(chrome, 'Set CHROME_PATH to a Chromium executable.');

const harness = `
import React from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import CameraCapture from './resources/js/Components/CameraCapture.jsx';
import usePhotoPreview from './resources/js/Hooks/usePhotoPreview.js';
import WorkingCampusField from './resources/js/Components/WorkingCampusField.jsx';

(async () => {
const checks = [];
const check = (value, label) => { if (!value) throw Error(label); checks.push(label); };
const settle = () => new Promise((resolve) => setTimeout(resolve, 10));
const pending = [];
let stopped = 0;
let width = 0;
let height = 0;
let captures = [];
let requested = 0;
let requestSawVideo = false;
let deferredBlob = null;
let waitForBlob = false;
const mockStream = () => ({ getTracks: () => [{ stop: () => { stopped += 1; } }] });
const mockDevices = { getUserMedia: (constraints) => {
    requested += 1;
    requestSawVideo = !!document.querySelector('video');
    check(constraints.audio === false, 'capture never requests microphone access');
    return new Promise((resolve, reject) => pending.push({ resolve, reject }));
} };
Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: mockDevices });
Object.defineProperty(window, 'isSecureContext', { configurable: true, value: true });
Object.defineProperty(HTMLMediaElement.prototype, 'srcObject', {
    configurable: true, get() { return this._stream ?? null; }, set(value) { this._stream = value; },
});
Object.defineProperty(HTMLVideoElement.prototype, 'videoWidth', { configurable: true, get: () => width });
Object.defineProperty(HTMLVideoElement.prototype, 'videoHeight', { configurable: true, get: () => height });
HTMLMediaElement.prototype.play = () => Promise.resolve();
HTMLCanvasElement.prototype.getContext = () => ({ translate() {}, scale() {}, drawImage() {} });
HTMLCanvasElement.prototype.toBlob = function(callback, mime) {
    check(this.width === 512 && this.height === 512, 'capture exports a bounded square portrait');
    if (waitForBlob) deferredBlob = callback;
    else queueMicrotask(() => callback(new Blob(['photo'], { type: mime })));
};

const root = createRoot(document.getElementById('app'));
let instance = 0;
const close = () => flushSync(() => root.render(null));
const open = () => {
    instance += 1;
    flushSync(() => root.render(<CameraCapture key={instance}
        onCapture={(file) => captures.push(file)} onClose={close} />));
};
const button = (text) => [...document.querySelectorAll('button')].find((node) => node.textContent === text);
const click = (node) => flushSync(() => node.click());
const grant = async () => {
    const stream = mockStream();
    pending.shift().resolve(stream);
    await settle();
    return stream;
};

try {
    const opener = document.getElementById('opener');
    opener.focus();
    open();
    check(requestSawVideo, 'camera acquisition starts after the video is mounted');
    check(document.querySelector('[role="dialog"]').getAttribute('aria-modal') === 'true', 'camera uses an accessible modal dialog');
    check(button('Capture photo').disabled, 'capture is disabled while permission is pending');
    const first = await grant();
    check(document.querySelector('video').srcObject === first, 'resolved camera stream attaches to the current video');
    check(button('Capture photo').disabled, 'zero-sized camera frames cannot be captured');
    width = 640; height = 480;
    flushSync(() => document.querySelector('video').dispatchEvent(new Event('loadeddata')));
    check(!button('Capture photo').disabled, 'capture is enabled when a real frame is ready');
    click(button('Capture photo'));
    await settle();
    check(captures[0] instanceof File && captures[0].type === 'image/jpeg' && captures[0].name.endsWith('.jpg'), 'capture returns an upload-ready JPEG File');
    check(!document.querySelector('video') && stopped === 1, 'successful capture closes the dialog and stops the stream');
    check(document.activeElement === opener, 'closing restores keyboard focus to the opener');

    open();
    pending.shift().reject(Object.assign(new Error('denied'), { name: 'NotAllowedError' }));
    await settle();
    check(document.querySelector('[role="alert"]').textContent.includes('permission was denied'), 'permission denial explains how to recover');
    check(button('Capture photo').disabled && !!button('Retry camera'), 'a failed request offers retry instead of an empty capture');
    click(button('Retry camera'));
    await grant();
    check(!button('Capture photo').disabled, 'retry can successfully start the camera');
    click(button('Cancel'));
    check(stopped === 2, 'cancel stops the retry stream');

    open();
    click(button('Cancel'));
    await grant();
    check(stopped === 3 && !document.querySelector('video'), 'a permission result arriving after close is stopped, not attached');

    open();
    await grant();
    close();
    check(stopped === 4, 'page unmount releases all live tracks without depending on the DOM ref');

    open();
    close();
    pending.shift().reject(Object.assign(new Error('late denial'), { name: 'NotAllowedError' }));
    await settle();
    check(!document.querySelector('[role="alert"]'), 'a late permission rejection cannot reopen a closed dialog');

    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: undefined });
    const beforeUnsupported = requested;
    open();
    await settle();
    check(document.querySelector('[role="alert"]').textContent.includes('does not support camera access') && requested === beforeUnsupported,
        'unsupported devices show a photo-upload fallback without calling missing browser APIs');
    close();
    Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: mockDevices });
    Object.defineProperty(window, 'isSecureContext', { configurable: true, value: false });
    open();
    await settle();
    check(document.querySelector('[role="alert"]').textContent.includes('HTTPS') && requested === beforeUnsupported,
        'insecure hosting explicitly explains the HTTPS requirement');
    close();
    Object.defineProperty(window, 'isSecureContext', { configurable: true, value: true });

    open();
    pending.shift().reject(Object.assign(new Error('missing'), { name: 'NotFoundError' }));
    await settle();
    check(document.querySelector('[role="alert"]').textContent.includes('No available camera'), 'missing hardware receives a specific error');
    close();

    open();
    await grant();
    waitForBlob = true;
    const beforeCapture = captures.length;
    click(button('Capture photo'));
    click(button('Cancel'));
    deferredBlob(new Blob(['late'], { type: 'image/jpeg' }));
    await settle();
    check(captures.length === beforeCapture && stopped === 5, 'closing during JPEG encoding discards the late result and releases the camera');
    waitForBlob = false;

    open();
    await grant();
    flushSync(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
    check(!document.querySelector('[role="dialog"]') && stopped === 6, 'Escape dismisses the camera and releases the device');

    const created = []; const revoked = [];
    const createUrl = URL.createObjectURL.bind(URL);
    const revokeUrl = URL.revokeObjectURL.bind(URL);
    URL.createObjectURL = (file) => { const url = createUrl(file); created.push(url); return url; };
    URL.revokeObjectURL = (url) => { revoked.push(url); revokeUrl(url); };
    function Preview({ file }) { return <img alt="Preview" src={usePhotoPreview(file, '/storage/original.jpg')} />; }
    flushSync(() => root.render(<Preview file={new File(['one'], 'one.jpg')} />));
    await settle();
    flushSync(() => root.render(<Preview file={new File(['two'], 'two.jpg')} />));
    await settle();
    check(created.length === 2 && revoked.includes(created[0]), 'replacing an uploaded photo revokes the previous blob URL');
    close();
    check(revoked.includes(created[1]), 'leaving the form releases the current photo preview URL');

    window.testAuth = { can_switch_campus: true, active_campus_id: 2, active_campus: { id: 2, name: 'North' } };
    flushSync(() => root.render(<WorkingCampusField value={2} campuses={[{ id: 1, name: 'Main' }, { id: 2, name: 'North' }]} />));
    check(document.querySelector('select').disabled && document.querySelector('select').selectedOptions[0].textContent === 'North',
        'operational forms display the working campus read-only, not the first campus');
    window.testAuth = { can_switch_campus: true, active_campus_id: null };
    flushSync(() => root.render(<WorkingCampusField value="" campuses={[{ id: 1, name: 'Main' }]} />));
    check(document.querySelector('select').selectedOptions[0].textContent.includes('top bar'), 'an unassigned super admin is asked to select a working campus');
    window.testAuth = { can_switch_campus: true, active_campus_id: 2 };
    flushSync(() => root.render(<WorkingCampusField value={1} campuses={[{ id: 1, name: 'Main' }]} />));
    check(document.getElementById('app').textContent.includes('different campus'), 'a stale form campus is explicitly flagged');

    document.body.dataset.result = 'passed';
    document.getElementById('result').textContent = checks.length + ' camera, preview and working-campus checks passed';
} catch (error) {
    document.body.dataset.result = 'failed';
    document.getElementById('result').textContent = error.stack;
}
})();
`;

const bundle = await build({
    stdin: { contents: harness, resolveDir: process.cwd(), loader: 'jsx' },
    bundle: true, write: false, format: 'iife', jsx: 'automatic',
    define: { 'process.env.NODE_ENV': '"production"' },
    plugins: [{ name: 'mock-inertia', setup(builder) {
        builder.onResolve({ filter: /^@inertiajs\/react$/ }, () => ({ path: 'inertia', namespace: 'fixture' }));
        builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: 'export const usePage = () => ({ props: { auth: window.testAuth } });' }));
    } }],
});
const html = '<!doctype html><html><body><button id="opener">Open camera</button><div id="app"></div><pre id="result"></pre><script>'
    + bundle.outputFiles[0].text.replaceAll('</script', '<\\/script') + '</script></body></html>';
const server = createServer((request, response) => { response.setHeader('Content-Type', 'text/html'); response.end(html); });
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const profile = await mkdtemp(path.join(tmpdir(), 'erp-camera-test-'));
try {
    const output = await new Promise((resolve, reject) => {
        const child = spawn(chrome, ['--headless', '--disable-gpu', '--disable-background-networking', '--no-first-run',
            '--no-default-browser-check', '--user-data-dir=' + profile, '--virtual-time-budget=5000', '--dump-dom',
            'http://127.0.0.1:' + server.address().port], { windowsHide: true });
        let stdout = ''; let stderr = '';
        const timeout = setTimeout(() => { child.kill(); reject(Error('Browser test timed out')); }, 45000);
        child.stdout.on('data', (data) => { stdout += data; });
        child.stderr.on('data', (data) => { stderr += data; });
        child.on('error', (error) => { clearTimeout(timeout); reject(error); });
        child.on('close', (code) => {
            clearTimeout(timeout);
            code === 0 ? resolve(stdout) : reject(Error('Chrome failed: ' + stderr.slice(-2000)));
        });
    });
    const result = output.match(/<pre id="result">([\s\S]*?)<\/pre>/)?.[1] ?? output.slice(-1000);
    assert.ok(output.includes('data-result="passed"'), result);
    console.log('PASS: ' + result);
} finally {
    server.close();
    assert.equal(path.dirname(profile), path.resolve(tmpdir()));
    assert.ok(path.basename(profile).startsWith('erp-camera-test-'));
    await rm(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
}
