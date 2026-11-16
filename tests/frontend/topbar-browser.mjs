// Usage: npm run build && node tests/frontend/topbar-browser.mjs [path/to/chrome]
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
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
import Topbar from './resources/js/Components/Topbar.jsx';
import { PageContext, router } from '@inertiajs/react';
const requests = [];
window.__links = [];
router.get = (url, data, options) => requests.push({ url, data, options });
window.route = (name) => '/' + name.replaceAll('.', '/');
const root = createRoot(document.getElementById('app'));
const allowed = Object.fromEntries(['admin.students.index', 'admin.staff.index', 'admin.fees.invoices',
    'admin.students.create', 'admin.staff.create', 'admin.communication-notifications.index', 'admin.general.index'].map((name) => [name, true]));
let auth = { user: { name: 'School Administrator', roles: [{ name: 'Super Admin' }] },
    active_campus_id: null, can_switch_campus: true, requires_campus_selection: true, topbar_permissions: allowed };
const props = () => ({ auth, all_campuses: [{ id: 1, name: 'Main' }],
    navigation: [{ items: [{ route: 'admin.staff.index' }] }] });
let hamburgerClicks = 0;
const render = () => flushSync(() => root.render(<PageContext.Provider value={{ props: props() }}>
    <Topbar onHamburgerClick={() => hamburgerClicks++} sidebarOpen={false} />
</PageContext.Provider>));
const find = (label) => document.querySelector('[aria-label="' + label + '"]');
const settle = () => new Promise((resolve) => setTimeout(resolve, 35));
const click = async (element) => { flushSync(() => element.click()); await settle(); };
const key = async (element, value, options = {}) => {
    flushSync(() => element.dispatchEvent(new KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true, ...options })));
    await settle();
};
const check = (value, message) => { if (!value) throw Error(message); checks.push(message); };
const checks = [];
async function run() {
try {
    render(); await settle();
    await click(find('Open navigation'));
    check(hamburgerClicks === 1, 'the existing navigation button still works');
    check(find('Quick Add').disabled, 'Quick Add requires a working campus');
    check(find('Notifications').getAttribute('href') === '/admin/communication-notifications/index', 'the bell opens real notifications');
    check(!find('Notifications').querySelector('span'), 'there is no fabricated unread badge');
    check(document.querySelector('header').scrollWidth <= window.innerWidth, 'the full top bar fits the viewport');
    await key(window, 'k', { ctrlKey: true });
    check(Boolean(document.querySelector('[role="dialog"]')), 'Ctrl+K opens the search dialog');
    const module = document.querySelector('[role="dialog"] select');
    check(module.options.length === 3, 'authorized student, staff, and invoice modules are searchable');
    flushSync(() => { module.value = 'staff'; module.dispatchEvent(new Event('change', { bubbles: true })); });
    const input = document.querySelector('input[type="search"]');
    flushSync(() => {
        Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(input, '  Rahim  ');
        input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await click(document.querySelector('[role="dialog"] button[type="submit"]'));
    check(requests[0]?.url === '/admin/staff/index' && requests[0]?.data.search === 'Rahim', 'search submits the chosen module and trimmed query');
    check(!document.querySelector('[role="dialog"]') && requests[0].options.preserveState === false, 'search closes and resets old list filters');
    await key(window, 'k', { metaKey: true });
    check(Boolean(document.querySelector('[role="dialog"]')), 'Command+K also opens search');
    await key(document.activeElement, 'Escape');
    check(!document.querySelector('[role="dialog"]'), 'Escape closes search');

    auth = { ...auth, active_campus_id: 1, active_campus: { id: 1, name: 'Main' }, requires_campus_selection: false };
    render(); await settle();
    await click(find('Quick Add'));
    let menu = document.querySelector('[role="menu"]');
    check(menu?.querySelectorAll('[role="menuitem"]').length === 2, 'Quick Add offers the authorized create pages');
    check(menu.getBoundingClientRect().left >= 0 && menu.getBoundingClientRect().right <= window.innerWidth,
        'the Quick Add menu stays inside the viewport');
    await click([...menu.querySelectorAll('[role="menuitem"]')].find((item) => item.textContent.includes('Add student')));
    check(window.__links.at(-1)?.href === '/admin/students/create', 'Add student opens the real admission form');

    await key(find('Open user menu'), 'ArrowDown');
    menu = document.querySelector('[role="menu"]');
    check(menu && find('Open user menu').getAttribute('aria-expanded') === 'true', 'the account menu opens using the keyboard');
    const items = [...menu.querySelectorAll('[role="menuitem"]')];
    check(items.some((item) => item.getAttribute('href') === '/profile/edit'), 'My Profile opens the account page');
    check(items.some((item) => item.getAttribute('href') === '/admin/general/index'), 'Settings has a real destination');
    check(items.some((item) => item.getAttribute('href') === '/admin/general/index#branding'), 'Website branding opens the settings section');
    await key(menu, 'Escape');
    check(!document.querySelector('[role="menu"]'), 'Escape dismisses the account menu');
    await click(find('Open user menu'));
    await click([...document.querySelectorAll('[role="menuitem"]')].find((item) => item.textContent.includes('Sign Out')));
    check(window.__links.at(-1)?.href === '/logout' && window.__links.at(-1)?.method === 'post', 'Sign Out submits POST to logout');

    auth = { ...auth, topbar_permissions: { 'admin.students.index': true } };
    render(); await settle();
    check(!find('Quick Add') && !find('Notifications'), 'the server permission map hides forbidden quick actions and notifications');
    await click(find('Search records'));
    check(document.querySelector('[role="dialog"] select').options.length === 1, 'forbidden search modules stay hidden despite cached navigation and role data');
    await click(find('Close search'));
    await click(find('Open user menu'));
    check(![...document.querySelectorAll('[role="menuitem"]')].some((item) => /Settings|Website branding/.test(item.textContent)), 'forbidden settings and branding links stay hidden');
    await key(document.querySelector('[role="menu"]'), 'Escape');
    auth = { ...auth, topbar_permissions: {}, can_switch_campus: false };
    render(); await settle();
    check(!find('Search records') && !find('Quick Add') && !find('Notifications'), 'an account without module access has no unauthorized shortcuts');
    document.body.dataset.result = 'passed';
    document.getElementById('result').textContent = checks.length + ' topbar checks passed';
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
    define: { 'process.env.NODE_ENV': '"production"' }, alias: { '@': path.resolve('resources/js') },
    plugins: [{ name: 'mock-inertia', setup(builder) {
        builder.onResolve({ filter: /^@inertiajs\/react$/ }, () => ({ path: 'inertia', namespace: 'fixture' }));
        builder.onLoad({ filter: /.*/, namespace: 'fixture' }, () => ({ loader: 'jsx', resolveDir: process.cwd(), contents: `
            import React, { createContext, useContext, forwardRef } from 'react';
            export const PageContext = createContext({});
            export const usePage = () => useContext(PageContext);
            export const router = { post: () => {}, get: () => {} };
            export const Link = forwardRef(({ children, onClick, as: Tag = 'a', method = 'get', ...props }, ref) =>
                <Tag ref={ref} {...props} onClick={(event) => {
                    onClick?.(event); event.preventDefault(); window.__links.push({ href: props.href, method });
                }}>{children}</Tag>);
        ` }));
    } }],
});
const manifest = JSON.parse(await readFile('public/build/manifest.json', 'utf8'));
const css = (await Promise.all((manifest['resources/js/app.jsx'].css ?? []).map((file) => readFile(path.join('public/build', file), 'utf8')))).join('\n');
const html = '<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>'
    + css + '</style></head><body><div id="app"></div><pre id="result"></pre><script>'
    + bundle.outputFiles[0].text.replaceAll('</script', '<\\/script') + '</script></body></html>';
const server = createServer((request, response) => { response.setHeader('Content-Type', 'text/html'); response.end(html); });
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
try {
    for (const width of [1280, 390]) {
        const profile = await mkdtemp(path.join(tmpdir(), 'erp-topbar-test-'));
        try {
            const output = await new Promise((resolve, reject) => {
                const child = spawn(chrome, ['--headless', '--disable-gpu', '--disable-background-networking', '--no-first-run',
                    '--no-default-browser-check', '--user-data-dir=' + profile, '--window-size=' + width + ',900',
                    '--force-device-scale-factor=1', '--virtual-time-budget=5000', '--dump-dom',
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
            assert.equal(path.dirname(profile), path.resolve(tmpdir()));
            assert.ok(path.basename(profile).startsWith('erp-topbar-test-'));
            await rm(profile, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
        }
    }
} finally { server.close(); }
