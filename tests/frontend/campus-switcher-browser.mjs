// Usage: node tests/frontend/campus-switcher-browser.mjs [path/to/chrome]
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
import CampusSwitcher from './resources/js/Components/CampusSwitcher.jsx';
import { router } from '@inertiajs/react';

const requests = [];
router.post = (url, data, options) => { requests.push({ url, data, options }); options.onStart(); };
window.route = (name) => '/' + name.replaceAll('.', '/');
const root = createRoot(document.getElementById('app'));
const campuses = [{ id: 1, name: 'Main' }, { id: 2, name: 'North' }];
let auth = { can_switch_campus: true, active_campus_id: null, active_campus: null,
    user: { campus_id: null }, requires_campus_selection: true };
const render = () => flushSync(() => root.render(<CampusSwitcher auth={auth} campuses={campuses} />));
const picker = () => document.querySelector('select');
const choose = (value) => flushSync(() => {
    picker().value = value;
    picker().dispatchEvent(new Event('change', { bubbles: true }));
});
const checks = [];
const check = (value, message) => { if (!value) throw Error(message); checks.push(message); };
try {
    render();
    check(picker().value === '', 'a global super admin starts with no working campus');
    check(picker().selectedOptions[0].textContent === 'Select working campus', 'null shows an explicit selection prompt');
    check(picker().labels[0].textContent === 'Working campus', 'the picker has an associated accessible label');
    check(document.getElementById(picker().getAttribute('aria-describedby')).textContent.includes('assignment stays unchanged'),
        'the helper distinguishes working context from account assignment');
    check(![...picker().options].some((option) => option.value === 'all'), 'there is no all-campus write context');
    choose('');
    check(requests.length === 0, 'the null prompt cannot submit a switch');
    choose('2');
    check(requests.length === 1 && requests[0].url === '/admin/campus/switch' && requests[0].data.campus_id === '2',
        'a chosen campus is posted to the switch route');
    check(picker().disabled && picker().getAttribute('aria-busy') === 'true', 'the picker is disabled during the request');
    check(picker().value === '', 'a pending request does not invent a successful selected campus');
    choose('1');
    check(requests.length === 1, 'a pending switch cannot submit twice');
    check(requests[0].options.preserveState === 'errors' && requests[0].options.preserveScroll === false,
        'successful switches discard previous page form state');
    auth = { ...auth, active_campus_id: 2, active_campus: campuses[1], requires_campus_selection: false };
    render();
    flushSync(() => { requests[0].options.onSuccess({ props: { auth } }); requests[0].options.onFinish(); });
    check(picker().value === '2' && !picker().disabled && auth.user.campus_id === null,
        'the confirmed server context selects North without assigning the super admin');
    choose('2');
    check(requests.length === 1, 'reselecting the active campus does not submit');
    choose('1');
    flushSync(() => {
        requests[1].options.onError({ campus_id: 'This campus is inactive.' });
        requests[1].options.onFinish();
    });
    check(picker().value === '2' && !picker().disabled, 'a rejected switch retains the confirmed campus');
    check(document.querySelector('[role="alert"]').textContent === 'This campus is inactive.'
        && picker().getAttribute('aria-invalid') === 'true', 'server rejection is displayed beside the picker');
    choose('1');
    check(!document.querySelector('[role="alert"]'), 'retry clears the previous error');
    flushSync(() => requests[2].options.onFinish());
    check(document.querySelector('[role="alert"]').textContent.includes('Unable to switch campus') && !picker().disabled,
        'a request ending without a response shows a local error and permits retry');
    auth = { can_switch_campus: false, active_campus_id: 1, active_campus: campuses[0], user: { campus_id: 1 } };
    render();
    check(!picker() && document.getElementById('app').textContent.includes('Assigned campusMain'),
        'branch users receive a read-only assigned campus');
    auth = { can_switch_campus: false, active_campus_id: null, active_campus: null };
    render();
    check(document.getElementById('app').textContent.includes('No assigned campus'), 'unassigned users have an explicit read-only state');
    document.body.dataset.result = 'passed';
    document.getElementById('result').textContent = checks.length + ' campus picker checks passed';
} catch (error) {
    document.body.dataset.result = 'failed';
    document.getElementById('result').textContent = error.stack;
}
`;

const bundle = await build({
    stdin: { contents: harness, resolveDir: process.cwd(), loader: 'jsx' },
    bundle: true, write: false, format: 'iife', jsx: 'automatic',
    define: { 'process.env.NODE_ENV': '"production"' },
    plugins: [{ name: 'mock-inertia', setup(builder) {
        builder.onResolve({ filter: /^@inertiajs\/react$/ }, () => ({ path: 'inertia', namespace: 'fixture' }));
        builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ contents: 'export const router = { post: () => {} };' }));
    } }],
});
const html = '<!doctype html><html><body><div id="app"></div><pre id="result"></pre><script>'
    + bundle.outputFiles[0].text.replaceAll('</script', '<\\/script') + '</script></body></html>';
const server = createServer((request, response) => { response.setHeader('Content-Type', 'text/html'); response.end(html); });
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const profile = await mkdtemp(path.join(tmpdir(), 'erp-campus-test-'));
try {
    const output = await new Promise((resolve, reject) => {
        const child = spawn(chrome, ['--headless', '--disable-gpu', '--disable-background-networking', '--no-first-run',
            '--no-default-browser-check', '--user-data-dir=' + profile, '--virtual-time-budget=2000', '--dump-dom',
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
    assert.ok(path.basename(profile).startsWith('erp-campus-test-'));
    await rm(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
}
