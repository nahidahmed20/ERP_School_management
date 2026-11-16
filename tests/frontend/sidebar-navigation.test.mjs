import assert from 'node:assert/strict';
import test from 'node:test';
import {
    activeSidebarKey,
    buildSidebarNavigation,
    toggleSidebarKey,
} from '../../resources/js/Utils/sidebarNavigation.js';

function resolverFor(currentName) {
    const calls = { current: 0, hrefs: new Map() };
    function resolve(name) {
        if (name === undefined) {
            return { current() { calls.current += 1; return currentName; } };
        }
        calls.hrefs.set(name, (calls.hrefs.get(name) ?? 0) + 1);
        return `https://school.example/${name.replaceAll('.', '/')}`;
    }
    return { resolve, calls };
}

const studentMenus = [{
    label: 'School',
    items: [{
        key: 'students',
        children: [
            { key: 'list', route_name: 'admin.students.index' },
            { key: 'create', route: 'admin.students.create' },
        ],
    }, {
        key: 'staff',
        children: [{ route_name: 'admin.staff.index' }],
    }],
}];

test('a large menu resolves the current route once and each unique href once', () => {
    const navigation = Array.from({ length: 20 }, (_, group) => ({
        label: `Group ${group}`,
        items: [{ key: 'module', children: Array.from({ length: 25 }, (_, child) => ({
            key: `child-${child}`, route_name: `admin.module${child}.index`,
        })) }],
    }));
    const { resolve, calls } = resolverFor('admin.module12.index');
    const groups = buildSidebarNavigation(navigation, '/admin/module12', resolve);

    assert.equal(groups.flatMap((group) => group.items[0].children).length, 500);
    assert.equal(calls.current, 1);
    assert.equal(calls.hrefs.size, 25);
    assert.ok([...calls.hrefs.values()].every((count) => count === 1));
    assert.ok(groups.every((group) => group.items[0].children[12].active));
});

test('an exact create menu is selected without selecting its module list', () => {
    const { resolve } = resolverFor('admin.students.create');
    const groups = buildSidebarNavigation(studentMenus, '/admin/students/create', resolve);
    const [students, staff] = groups[0].items;

    assert.equal(students.children[0].active, false);
    assert.equal(students.children[1].active, true);
    assert.equal(students.active, true);
    assert.equal(staff.active, false);
    assert.equal(activeSidebarKey(groups), students.menuKey);
});

test('detail and edit routes select the module list when no exact menu exists', () => {
    for (const suffix of ['show', 'edit']) {
        const { resolve } = resolverFor(`admin.students.${suffix}`);
        const groups = buildSidebarNavigation(studentMenus, `/admin/students/7/${suffix}`, resolve);
        const [students, staff] = groups[0].items;

        assert.equal(students.children[0].active, true, suffix);
        assert.equal(students.children[1].active, false, suffix);
        assert.equal(students.active, true, suffix);
        assert.equal(staff.active, false, suffix);
        assert.equal(activeSidebarKey(groups), students.menuKey, suffix);
    }
});

test('an exact detail menu takes precedence over its module list', () => {
    const navigation = [{ label: 'School', items: [{
        key: 'students', children: [
            { route_name: 'admin.students.index' },
            { route_name: 'admin.students.show' },
        ],
    }] }];
    const { resolve } = resolverFor('admin.students.show');
    const groups = buildSidebarNavigation(navigation, '/admin/students/7', resolve);

    assert.deepEqual(groups[0].items[0].children.map((child) => child.active), [false, true]);
});

test('similar module names and unrelated modules do not activate the students menu', () => {
    for (const current of ['admin.studentsArchive.edit', 'admin.students-reports.show', 'admin.exams.show']) {
        const { resolve } = resolverFor(current);
        const groups = buildSidebarNavigation(studentMenus, '/unrelated', resolve);

        assert.ok(groups[0].items.every((item) => !item.active), current);
        assert.equal(activeSidebarKey(groups), null, current);
    }
});

test('missing Ziggy falls back to route-name URLs and ignores query strings and fragments', () => {
    const groups = buildSidebarNavigation(studentMenus, '/admin/students/index?page=2#results', undefined);
    const students = groups[0].items[0];

    assert.equal(students.href, '#');
    assert.equal(students.children[0].href, '/admin/students/index');
    assert.equal(students.children[0].active, true);
    assert.equal(students.children[1].active, false);
    assert.equal(students.active, true);
});

test('an unresolved current route can still match the generated URL pathname', () => {
    const resolve = (name) => name === undefined
        ? { current: () => undefined }
        : `https://school.example/pupils?sort=name`;
    const groups = buildSidebarNavigation([{ label: 'School', items: [
        { route_name: 'admin.students.index' },
    ] }], '/pupils?page=2#results', resolve);

    assert.equal(groups[0].items[0].active, true);
    assert.equal(groups[0].items[0].href, 'https://school.example/pupils?sort=name');
});

test('empty navigation and groups without items are safe', () => {
    assert.deepEqual(buildSidebarNavigation([], '/', undefined), []);
    assert.equal(activeSidebarKey([]), null);
    const groups = buildSidebarNavigation([{ label: 'Empty' }], '/', undefined);
    assert.deepEqual(groups[0].items, []);
    assert.equal(activeSidebarKey(groups), null);

    const unnamed = buildSidebarNavigation([{ items: [{}] }], '/', undefined)[0].items[0];
    assert.equal(unnamed.href, '#');
    assert.equal(unnamed.active, false);
    assert.deepEqual(unnamed.children, []);
});

test('reused item and child keys are scoped to their navigation group', () => {
    const navigation = ['School', 'Administration'].map((label) => ({
        label, items: [{ key: 'settings', children: [{ key: 'index', route_name: 'admin.settings.index' }] }],
    }));
    const { resolve } = resolverFor('admin.settings.index');
    const groups = buildSidebarNavigation(navigation, '/admin/settings', resolve);
    const keys = groups.flatMap((group) => [group.menuKey, group.items[0].menuKey, group.items[0].children[0].menuKey]);

    assert.equal(new Set(keys).size, keys.length);
});

test('the active parent can match its own route and leaf links do not become open keys', () => {
    const navigation = [{ label: 'School', items: [
        { key: 'overview', route_name: 'admin.dashboard' },
        { key: 'reports', route_name: 'admin.reports.index', children: [{ route_name: 'admin.reports.export' }] },
    ] }];
    const reportGroups = buildSidebarNavigation(navigation, '/reports', resolverFor('admin.reports.index').resolve);
    assert.equal(reportGroups[0].items[1].active, true);
    assert.equal(activeSidebarKey(reportGroups), reportGroups[0].items[1].menuKey);

    const dashboardGroups = buildSidebarNavigation(navigation, '/dashboard', resolverFor('admin.dashboard').resolve);
    assert.equal(dashboardGroups[0].items[0].active, true);
    assert.equal(activeSidebarKey(dashboardGroups), null);
});

test('clicking the same parent closes it and clicking another replaces the open key', () => {
    let open = null;
    open = toggleSidebarKey(open, 'School:students');
    assert.equal(open, 'School:students');
    open = toggleSidebarKey(open, 'School:students');
    assert.equal(open, null);
    open = toggleSidebarKey(open, 'School:students');
    open = toggleSidebarKey(open, 'School:staff');
    assert.equal(open, 'School:staff');
    assert.equal(toggleSidebarKey(open, 'School:staff'), null);
});
