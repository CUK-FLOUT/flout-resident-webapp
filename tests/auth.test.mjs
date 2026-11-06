import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';

function harness(response, { network = false } = {}) {
  const requests = [];
  const tokens = [];
  class ApiError extends Error {
    constructor(status, message, code) {
      super(message);
      this.status = status;
      this.code = code;
    }
  }
  const modules = {
    '@/lib/env': { env: { apiBaseUrl: 'https://api.flout.shop/api', useMock: false } },
    '@/lib/http': { ApiError, http: {} },
    '@/lib/storage': { tokenStorage: { set: (token) => tokens.push(token) } },
    '@/api/authMock': {},
    '@tanstack/react-query': { useMutation: (options) => options },
  };
  const exports = {};
  const source = ts.transpileModule(
    readFileSync(new URL('../src/api/auth.ts', import.meta.url), 'utf8'),
    {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    },
  ).outputText;
  vm.runInNewContext(source, {
    exports,
    require: (name) => modules[name],
    AbortController,
    setTimeout,
    clearTimeout,
    fetch: async (url, options) => {
      requests.push({ url, ...options });
      if (network) throw new Error('offline');
      return {
        ok: response.status < 400,
        status: response.status,
        json: async () => response.body,
      };
    },
  });
  return { api: exports, requests, tokens };
}
const session = { accessToken: 'service-jwt', role: 'RESIDENT', requiresConsent: false };

test('login sends public resident endpoint and saves service token; consent flag is retained', async () => {
  for (const requiresConsent of [true, false]) {
    const h = harness({
      status: 200,
      body: { isSuccess: true, result: { ...session, requiresConsent } },
    });
    assert.equal(
      (await h.api.login('resident@example.com', 'password123')).requiresConsent,
      requiresConsent,
    );
    assert.equal(h.requests[0].url, 'https://api.flout.shop/api/auth/login');
    assert.deepEqual(JSON.parse(h.requests[0].body), {
      email: 'resident@example.com',
      password: 'password123',
    });
    assert.equal(h.requests[0].headers.Authorization, undefined);
    assert.deepEqual(h.tokens, ['service-jwt']);
  }
});

test('signup accepts 201, sends only contract fields, and does not auto-login', async () => {
  const h = harness({
    status: 201,
    body: { isSuccess: true, result: { userId: 1, role: 'RESIDENT' } },
  });
  await h.api.signup({
    email: 'r@example.com',
    password: 'password123',
    passwordConfirm: 'password123',
    name: '주민',
    role: 'ADMIN',
  });
  assert.equal(h.requests[0].url, 'https://api.flout.shop/api/auth/signup');
  assert.deepEqual(Object.keys(JSON.parse(h.requests[0].body)).sort(), [
    'email',
    'name',
    'password',
    'passwordConfirm',
  ]);
  assert.deepEqual(h.tokens, []);
});

test('server errors preserve code and message without storing tokens', async () => {
  for (const status of [400, 401, 409, 500]) {
    const h = harness({ status, body: { isSuccess: false, message: '서버 안내', code: 'ERROR' } });
    await assert.rejects(
      h.api.login('r@example.com', 'password123'),
      (e) => e.status === status && e.code === 'ERROR' && e.message === '서버 안내',
    );
    assert.deepEqual(h.tokens, []);
  }
});

test('invalid success payload and non-resident role never create a session', async () => {
  for (const result of [
    null,
    {},
    { ...session, role: 'ADMIN' },
    { ...session, accessToken: '' },
    { ...session, requiresConsent: undefined },
  ]) {
    const h = harness({ status: 200, body: { isSuccess: true, result } });
    await assert.rejects(h.api.login('r@example.com', 'password123'));
    assert.deepEqual(h.tokens, []);
  }
});

test('blank server error uses fallback; network failure remains distinguishable', async () => {
  const blank = harness({ status: 500, body: { isSuccess: false, message: '   ' } });
  await assert.rejects(blank.api.login('r@example.com', 'password123'), /요청을 처리하지 못했어요/);
  const offline = harness({}, { network: true });
  await assert.rejects(
    offline.api.login('r@example.com', 'password123'),
    (e) => e.status === 0 && e.code === 'NETWORK',
  );
});
