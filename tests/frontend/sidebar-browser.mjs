// Real Chromium interaction smoke test; no browser automation package required.
// Usage: node tests/frontend/sidebar-browser.mjs [path/to/chrome]
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { build } from 'esbuild';

const candidates = [process.argv[2], process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/google-chrome', '/usr/bin/chromium'].filter(Boolean);
const chrome = candidates.find(existsSync);
assert.ok(chrome, 'Set CHROME_PATH to a Chromium executable.');

const harness = `
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import Layout from './resources/js/Layouts/AuthenticatedLayout.jsx';
import { PageContext } from '@inertiajs/react';

let currentRoute = 'admin.students.index';
let resolutions = 0;
let links = 0;
window.route = (name) => name
    ? (links++, '/' + name.replaceAll('.', '/'))
    : { current: () => { resolutions++; return currentRoute; } };
const groups = [{ id: 1, label: 'School', items: Array.from({ length: 20 }, (_, i) => ({
    key: 'group-' + i, label: 'Menu ' + i, icon: 'users',
    children: Array.from({ length: i === 1 ? 30 : 8 }, (_, n) => ({
        key: 'child-' + n, label: 'Child ' + i + '-' + n,
        route: i === 0 && n === 0 ? 'admin.students.index' : 'admin.module' + i + '.page' + n,
    })),
})) }];
let navigate;
function Fixture() {
    const [page, setPage] = useState({ url: '/admin/students/index', props: {
        navigation: groups, auth: { user: { name: 'Test', roles: [] } },
        all_campuses: [], site_settings: {}, dashboard_alerts: [],
    } });
    navigate = (url) => setPage((old) => ({ ...old, url }));
    return <PageContext.Provider value={page}><Layout><h1>Sidebar test</h1></Layout></PageContext.Provider>;
}
const checks = [];
const check = (value, message) => { if (!value) throw Error(message); checks.push(message); };
const click = (element) => flushSync(() => element.click());
async function run() {
try {
    flushSync(() => createRoot(document.getElementById('app')).render(<Fixture />));
    const buttons = [...document.querySelectorAll('.nav-toggle')];
    const submenus = [...document.querySelectorAll('.nav-submenu')];
    check(resolutions === 1, 'current route resolved once on initial render');
    check(!submenus[0].hidden, 'active module opens initially');
    const initialLinks = links;
    for (let i = 0; i < 100; i++) click(buttons[0]);
    check(resolutions === 1 && links === initialLinks, '100 toggles perform no route resolution or URL rebuilding');
    click(buttons[0]);
    check(submenus[0].hidden && getComputedStyle(submenus[0]).display === 'none', 'close is immediate and removes links from layout');
    click(buttons[1]);
    check(!submenus[1].hidden && buttons[1].getAttribute('aria-expanded') === 'true', 'open state and accessible state agree');
    check(getComputedStyle(submenus[1]).maxHeight === 'none' && submenus[1].offsetHeight > 600, 'long menu is not clipped at 600 pixels');
    currentRoute = 'admin.students.edit';
    flushSync(() => navigate('/admin/students/42/edit'));
    await new Promise((resolve) => setTimeout(resolve, 0));
    check(resolutions === 2, 'navigation resolves the new route once');
    check(!submenus[0].hidden && submenus[1].hidden, 'navigation opens only the active module');
    check(document.querySelector('.nav-subitem.active').textContent.includes('Child 0-0'), 'student edit highlights student list');

    const hamburger = document.querySelector('[aria-controls="school-sidebar"]');
    const sidebar = document.getElementById('school-sidebar');
    const mobile = matchMedia('(max-width: 900px)').matches;
    if (mobile) {
        click(hamburger);
        check(sidebar.classList.contains('mobile-open') && document.body.style.overflow === 'hidden', 'mobile opens and locks background scroll');
        check(getComputedStyle(document.querySelector('.mobile-nav-backdrop')).display !== 'none', 'tablet/mobile backdrop is visible');
        flushSync(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })));
        check(!sidebar.classList.contains('mobile-open') && document.body.style.overflow !== 'hidden', 'Escape closes and restores scroll');
        click(hamburger);
        click(document.querySelector('.mobile-nav-backdrop'));
        check(!sidebar.classList.contains('mobile-open'), 'backdrop closes sidebar');
    } else {
        click(hamburger);
        check(getComputedStyle(sidebar).display === 'none', 'desktop hamburger hides sidebar');
        check(document.body.style.overflow !== 'hidden', 'desktop collapse never locks scrolling');
        click(hamburger);
        check(getComputedStyle(sidebar).display !== 'none', 'desktop hamburger restores sidebar');
    }
    document.body.dataset.result = 'passed';
    document.getElementById('result').textContent = JSON.stringify({ mode: mobile ? 'mobile/tablet' : 'desktop', checks: checks.length, routeResolutions: resolutions });
} catch (error) {
    document.body.dataset.result = 'failed';
    document.getElementById('result').textContent = error.stack;
}
}
run();
`;

const bundle = await build({
    stdin: { contents: harness, resolveDir: process.cwd(), loader: 'jsx' },
    bundle: true, write: false, format: 'iife', jsx: 'automatic',
    define: { 'process.env.NODE_ENV': '"production"' },
    alias: { '@': path.resolve('resources/js') },
    plugins: [{ name: 'mock-inertia', setup(builder) {
        builder.onResolve({ filter: /^@inertiajs\/react$/ }, () => ({ path: 'inertia', namespace: 'fixture' }));
        builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ loader: 'jsx', resolveDir: process.cwd(), contents: `
            import React, { createContext, useContext } from 'react';
            export const PageContext = createContext({});
            export const usePage = () => useContext(PageContext);
            export const router = { post: () => {} };
            export const Link = ({ children, onClick, as: Tag = 'a', method, ...props }) => <Tag {...props} onClick={(e) => { e.preventDefault(); onClick?.(e); }}>{children}</Tag>;
        ` }));
    } }],
});
const sidebarCss = await readFile('resources/css/sidebar.css', 'utf8');
// Test the real compiled responsive utilities too, including the 900px backdrop boundary.
const manifest = JSON.parse(await readFile('public/build/manifest.json', 'utf8'));
const cssPaths = manifest['resources/js/app.jsx'].css ?? [];
const appCss = (await Promise.all(cssPaths.map((file) => readFile(path.join('public/build', file), 'utf8')))).join('\n');
const html = '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>'
    + appCss + '\n' + sidebarCss + '</style></head><body><div id="app"></div><pre id="result"></pre><script>'
    + bundle.outputFiles[0].text.replaceAll('</script', '<\\/script') + '</script></body></html>';
const server = createServer((request, response) => { response.setHeader('Content-Type', 'text/html'); response.end(html); });
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
try {
    for (const width of [1280, 820, 390]) {
        const profile = await mkdtemp(path.join(tmpdir(), 'erp-sidebar-test-'));
        try {
            const output = await new Promise((resolve, reject) => {
                const child = spawn(chrome, ['--headless', '--disable-gpu', '--disable-background-networking', '--no-first-run',
                    '--no-default-browser-check', '--hide-scrollbars', '--force-device-scale-factor=1', '--user-data-dir=' + profile,
                    '--window-size=' + width + ',900', '--virtual-time-budget=2000', '--dump-dom',
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
            assert.ok(output.includes('data-result="passed"'), 'Width ' + width + ': ' + result);
            console.log('PASS ' + width + 'px: ' + result);
        } finally {
            // Only this test's freshly-created temporary profile may be removed.
            assert.equal(path.dirname(profile), path.resolve(tmpdir()));
            assert.ok(path.basename(profile).startsWith('erp-sidebar-test-'));
            await rm(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
        }
    }
} finally { server.close(); }
