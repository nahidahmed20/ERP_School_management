import test from 'node:test';
import assert from 'node:assert/strict';
import { publicMediaUrl } from '../../resources/js/Utils/publicMediaUrl.js';

test('public media normalizes disk paths without duplicate storage prefixes', () => {
    for (const path of ['students/photo.jpg', '/students/photo.jpg', 'storage/students/photo.jpg', '/storage/students/photo.jpg',
        'public/students/photo.jpg', 'public/storage/students/photo.jpg', 'students\\photo.jpg']) {
        assert.equal(publicMediaUrl(path), '/storage/students/photo.jpg');
    }
});

test('already resolved HTTP, HTTPS, blob and image data URLs are preserved', () => {
    for (const url of ['https://school.example/storage/staff/picture.jpg', 'http://localhost:8000/storage/staff/photo.jpg',
        'blob:https://school.example/123', 'data:image/jpeg;base64,abc']) {
        assert.equal(publicMediaUrl(url), url);
    }
});

test('absent or unsafe media paths return an explicit fallback', () => {
    for (const path of [null, undefined, '', '  ', 42, '../private/file.jpg', 'students/../../file.jpg',
        'javascript:alert(1)', 'file:///tmp/photo.jpg', '//other.example/picture.jpg']) {
        assert.equal(publicMediaUrl(path), null);
        assert.equal(publicMediaUrl(path, '/images/default-avatar.svg'), '/images/default-avatar.svg');
    }
});
