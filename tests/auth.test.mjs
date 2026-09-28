import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { SourceTextModule, SyntheticModule } from 'node:vm';
import * as React from 'react';
import * as jsx from 'react/jsx-runtime';
import * as router from 'react-router-dom';
import { act, create } from 'react-test-renderer';
import { transformWithOxc } from 'vite';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function synthetic(exports) {
  return new SyntheticModule(Object.keys(exports), function () {
    for (const [key, value] of Object.entries(exports)) this.setExport(key, value);
  });
}

async function harness(t, portal = 'Tutor', strict = false) {
  let listener;
  let auth;
  let location;
  const requests = [];
  const session = (id = 'one') => ({ user: { id } });
  const client = {
    auth: {
      onAuthStateChange(callback) {
        listener = callback;
        return { data: { subscription: { unsubscribe() {} } } };
      },
      async signInWithPassword() {
        listener('SIGNED_IN', session());
        return { data: session(), error: null };
      },
      async signOut() { listener('SIGNED_OUT', null); return { error: null }; },
    },
    from() {
      return { select() { return this; }, eq(_column, id) {
        return { maybeSingle() {
          return new Promise((resolve, reject) => requests.push({ id, resolve, reject }));
        } };
      } };
    },
  };
  const dependencies = {
    react: synthetic(React),
    'react/jsx-runtime': synthetic(jsx),
    'react-router-dom': synthetic(router),
    '../lib/supabase': synthetic({ supabase: client }),
  };
  async function load(file) {
    const { code } = await transformWithOxc(await readFile(file, 'utf8'), file);
    const module = new SourceTextModule(code);
    await module.link((name) => dependencies[name]);
    await module.evaluate();
    return module;
  }
  const context = await load('src/context/AuthContext.jsx');
  dependencies['../../context/AuthContext'] = context;
  const guard = await load(`src/components/wrappers/${portal}ProtectedRoute.jsx`);
  function Observe() {
    auth = context.namespace.useAuth();
    location = router.useLocation().pathname;
    return null;
  }
  function Page() {
    const [draft, setDraft] = React.useState('');
    return React.createElement('input', { value: draft, onChange: setDraft });
  }
  const element = React.createElement(context.namespace.AuthProvider, null,
    React.createElement(router.MemoryRouter, { initialEntries: ['/work'] },
      React.createElement(Observe),
      React.createElement(router.Routes, null,
        React.createElement(router.Route, { element: React.createElement(guard.namespace.default) },
          React.createElement(router.Route, { path: '/work', element: React.createElement(Page) })),
        React.createElement(router.Route, { path: '*', element: React.createElement('p', null, 'Redirected') }))));
  let root;
  await act(async () => { root = create(strict ? React.createElement(React.StrictMode, null, element) : element); });
  t.after(async () => { await act(async () => root.unmount()); });
  return {
    root, requests, get auth() { return auth; }, get location() { return location; },
    emit: (event, id = 'one') => act(async () => listener(event, id ? session(id) : null)),
    resolve: (index, role = portal.toLowerCase()) => act(async () => requests[index].resolve({ data: { role }, error: null })),
  };
}

for (const portal of ['Tutor', 'Student', 'Admin']) {
  test(`${portal}: same-user auth events preserve the open page and draft`, async (t) => {
    const h = await harness(t, portal);
    await h.emit('INITIAL_SESSION');
    await h.resolve(0);
    await act(async () => h.root.root.findByType('input').props.onChange('unsaved modal draft'));
    for (const event of ['SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED', 'INITIAL_SESSION']) {
      await h.emit(event);
      assert.equal(h.location, '/work');
      assert.equal(h.auth.loading, false);
      assert.equal(h.root.root.findByType('input').props.value, 'unsaved modal draft');
    }
    assert.equal(h.requests.length, 1);
  });
}

test('refresh during initial profile loading does not redirect or finish loading early', async (t) => {
  const h = await harness(t, 'Tutor', true);
  await h.emit('INITIAL_SESSION');
  await h.emit('TOKEN_REFRESHED');
  await h.emit('SIGNED_IN');
  assert.equal(h.auth.loading, true);
  assert.equal(h.location, '/work');
  await h.resolve(0);
  assert.equal(h.auth.role, 'tutor');
  assert.equal(h.auth.loading, false);
});

test('account changes ignore stale profile responses', async (t) => {
  const h = await harness(t);
  await h.emit('INITIAL_SESSION');
  await h.emit('SIGNED_IN', 'two');
  await h.resolve(0, 'admin');
  assert.equal(h.auth.role, null);
  assert.equal(h.auth.loading, true);
  await h.resolve(1);
  assert.equal(h.auth.user.id, 'two');
  assert.equal(h.auth.role, 'tutor');
});

test('sign-out cannot be undone by an outstanding profile response', async (t) => {
  const h = await harness(t);
  await h.emit('INITIAL_SESSION');
  await h.emit('SIGNED_OUT', null);
  await h.resolve(0);
  assert.equal(h.auth.user, null);
  assert.equal(h.auth.role, null);
  assert.equal(h.location, '/login');
});

test('profile failure stays on the URL and supports retry', async (t) => {
  const h = await harness(t);
  await h.emit('INITIAL_SESSION');
  await act(async () => h.requests[0].reject(new Error('Offline')));
  assert.equal(h.location, '/work');
  assert.ok(h.auth.profileError);
  await act(async () => { void h.auth.retryProfile(); });
  await h.resolve(1);
  assert.equal(h.auth.profileError, null);
  assert.equal(h.auth.role, 'tutor');
  assert.equal(h.location, '/work');
});

test('login shares its profile request and retains the actual admin role', async (t) => {
  const h = await harness(t);
  let result;
  await act(async () => { result = h.auth.login({ email: 'test@example.com', password: 'test', expectedRole: 'tutor' }); });
  assert.equal(h.requests.length, 1);
  await h.resolve(0, 'admin');
  assert.deepEqual(await result, { success: true, role: 'tutor' });
  assert.equal(h.auth.role, 'admin');
});

test('a verified wrong role still redirects away from protected tools', async (t) => {
  const h = await harness(t);
  await h.emit('INITIAL_SESSION');
  await h.resolve(0, 'student');
  assert.equal(h.location, '/');
});
