import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
import { QueryClient } from '@tanstack/react-query';
import ts from 'typescript';

const sources = Object.fromEntries(
  ['api/auth', 'api/queryClient', 'lib/http', 'lib/storage', 'constants/paths'].map((name) => [
    name,
    ts.transpileModule(readFileSync(new URL(`../src/${name}.ts`, import.meta.url), 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    }).outputText,
  ]),
);

function harness(
  response,
  { network = false, stored = new Map(), locks, schedule = setTimeout } = {},
) {
  const requests = [];
  const redirects = [];
  const storageListeners = new Set();
  const modules = {
    'lib/env': { env: { apiBaseUrl: 'https://api.flout.shop/api', useMock: false } },
    'api/mocks': {},
    '@/api/authMock': {},
    '@tanstack/react-query': { QueryClient, useMutation: (options) => options },
  };
  const location = {
    pathname: '/',
    replace(path) {
      redirects.push(path);
      this.pathname = path;
    },
  };
  const context = vm.createContext({
    window: {
      location,
      addEventListener: (type, listener) => {
        if (type === 'storage') storageListeners.add(listener);
      },
      removeEventListener: (type, listener) => {
        if (type === 'storage') storageListeners.delete(listener);
      },
      localStorage: {
        getItem: (key) => stored.get(key) ?? null,
        setItem: (key, value) => stored.set(key, value),
        removeItem: (key) => stored.delete(key),
      },
    },
    navigator: { locks },
    URL,
    Headers,
    FormData,
    AbortController,
    setTimeout: schedule,
    clearTimeout,
    fetch: async (url, options) => {
      const request = { url: String(url), ...options };
      requests.push(request);
      if (network) throw new Error('offline');
      const { status, body } = typeof response === 'function' ? await response(request) : response;
      return {
        ok: status < 400,
        status,
        json: async () => body,
      };
    },
  });
  function load(name) {
    if (modules[name]) return modules[name];
    const exports = {};
    modules[name] = exports;
    const requireModule = (dep) => {
      if (dep.startsWith('@/') && dep !== '@/api/authMock') return load(dep.slice(2));
      if (dep.startsWith('./'))
        return load(name.slice(0, name.lastIndexOf('/') + 1) + dep.slice(2));
      return load(dep);
    };
    vm.runInContext(`(function(exports, require) { ${sources[name]}\n})`, context)(
      exports,
      requireModule,
    );
    return exports;
  }
  const api = load('api/auth');
  const { tokenStorage } = load('lib/storage');
  const { queryClient, queryKeys } = load('api/queryClient');
  return {
    api,
    http: load('lib/http').http,
    queryClient,
    queryKeys,
    tokenStorage,
    requests,
    redirects,
    notifyStorage: (key) => storageListeners.forEach((listener) => listener({ key })),
    get tokens() {
      const saved = tokenStorage.readSession();
      return saved ? [saved.accessToken, saved.refreshToken] : [];
    },
  };
}
const session = {
  accessToken: 'service-jwt',
  refreshToken: 'refresh-jwt',
  role: 'RESIDENT',
  requiresConsent: false,
};

test('account switches and logout remove inspection caches and discard a late response', async () => {
  const h = harness({});
  h.tokenStorage.set(session);
  const scopeA = h.tokenStorage.getSessionScope();
  const keys = [
    h.queryKeys.inspectionApplication('21', scopeA),
    h.queryKeys.result('21', scopeA),
    h.queryKeys.inspectionRecommendations('21', scopeA),
    h.queryKeys.notifications(),
  ];
  keys.forEach((key) => h.queryClient.setQueryData(key, 'account A'));
  const pendingKey = h.queryKeys.inspectionApplication('22', scopeA);
  let requestSignal;
  let resolveRequest;
  const pending = h.queryClient.fetchQuery({
    queryKey: pendingKey,
    queryFn: ({ signal }) => {
      requestSignal = signal;
      return new Promise((resolve) => {
        resolveRequest = resolve;
      });
    },
  });
  const cancelled = assert.rejects(pending);
  h.tokenStorage.set({ accessToken: 'account-b-access', refreshToken: 'account-b-refresh' });
  const scopeB = h.tokenStorage.getSessionScope();
  assert.notEqual(scopeA, scopeB);
  assert.equal(requestSignal.aborted, true);
  resolveRequest('late account A');
  await cancelled;
  [...keys, pendingKey].forEach((key) => assert.equal(h.queryClient.getQueryState(key), undefined));
  const keyB = h.queryKeys.inspectionApplication('21', scopeB);
  assert.equal(h.queryClient.getQueryData(keyB), undefined);
  h.queryClient.setQueryData(keyB, 'account B');
  h.tokenStorage.clear();
  assert.equal(h.tokenStorage.getSessionScope(), null);
  assert.equal(h.queryClient.getQueryState(keyB), undefined);
});

test('rotating tokens within the same session preserves the existing inspection query', async () => {
  const h = harness({});
  h.tokenStorage.set(session);
  const scope = h.tokenStorage.getSessionScope();
  const key = h.queryKeys.inspectionApplication('21', scope);
  h.queryClient.setQueryData(key, 'cached');
  h.tokenStorage.rotate(scope, { accessToken: 'renewed-access', refreshToken: 'renewed-refresh' });
  h.notifyStorage('flout.authTokens');
  assert.equal(h.tokenStorage.getSessionScope(), scope);
  assert.equal(
    await h.queryClient.fetchQuery({
      queryKey: key,
      queryFn: () => assert.fail('same-session data should be reused'),
    }),
    'cached',
  );
});

test('another tab replacing legacy credentials clears cached data without exposing tokens in keys', () => {
  const stored = new Map([['flout.accessToken', 'legacy-account-a']]);
  const h = harness({}, { stored });
  const scopeA = h.tokenStorage.getSessionScope();
  const key = h.queryKeys.result('21', scopeA);
  h.queryClient.setQueryData(key, 'account A');
  h.notifyStorage('flout.recentAddresses');
  assert.equal(h.queryClient.getQueryData(key), 'account A');
  stored.set('flout.accessToken', 'legacy-account-b');
  h.notifyStorage('flout.accessToken');
  const scopeB = h.tokenStorage.getSessionScope();
  assert.notEqual(scopeB, scopeA);
  assert.equal(JSON.stringify([scopeA, scopeB]).includes('legacy-account'), false);
  assert.equal(h.queryClient.getQueryState(key), undefined);
});

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
    assert.equal(h.requests[0].headers.has('Authorization'), false);
    assert.deepEqual(h.tokens, ['service-jwt', 'refresh-jwt']);
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
    assert.equal(h.requests.length, 1);
    assert.deepEqual(h.redirects, []);
  }
});

test('invalid success payload and non-resident role never create a session', async () => {
  for (const result of [
    null,
    {},
    { ...session, role: 'ADMIN' },
    { ...session, accessToken: '' },
    { ...session, refreshToken: '' },
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

const expired = { status: 401, body: { code: 'EXPIRED', message: '인증 만료' } };
const rotated = { ...session, accessToken: 'renewed-access', refreshToken: 'renewed-refresh' };
const refreshSuccess = { status: 200, body: { isSuccess: true, result: rotated } };

test('Google login sends the ID token without Authorization and saves both service tokens', async () => {
  const h = harness({ status: 200, body: { isSuccess: true, result: session } });
  h.tokenStorage.set(rotated);
  await h.api.googleLogin('google-id-token');
  assert.match(h.requests[0].url, /\/auth\/google$/);
  assert.equal(h.requests[0].headers.has('Authorization'), false);
  assert.deepEqual(JSON.parse(h.requests[0].body), { idToken: 'google-id-token' });
  assert.deepEqual(h.tokens, ['service-jwt', 'refresh-jwt']);
});

test('concurrent and late 401s share a refresh and each request retries only once', async () => {
  let releaseLate;
  const late401 = new Promise((resolve) => {
    releaseLate = () => resolve(expired);
  });
  const h = harness((request) => {
    if (request.url.endsWith('/auth/refresh')) return refreshSuccess;
    if (request.headers.get('Authorization') === 'Bearer renewed-access') {
      return { status: 200, body: { ok: true } };
    }
    return request.url.endsWith('/late') ? late401 : expired;
  });
  h.tokenStorage.set(session);
  const late = h.http.get('/late');
  const form = new FormData();
  form.append('files', new Blob(['test']), 'photo.png');
  await Promise.all([
    h.http.post('/attachments', form, { headers: { 'Idempotency-Key': 'upload-key' } }),
    h.http.get('/list', { query: { page: 2 } }),
  ]);
  releaseLate();
  assert.deepEqual(await late, { ok: true });
  const refreshRequests = h.requests.filter((request) => request.url.endsWith('/auth/refresh'));
  assert.equal(refreshRequests.length, 1);
  const [refresh] = refreshRequests;
  assert.equal(refresh.method, 'POST');
  assert.equal(refresh.headers.get('Content-Type'), 'application/json');
  assert.equal(refresh.headers.has('Authorization'), false);
  assert.deepEqual(JSON.parse(refresh.body), { refreshToken: 'refresh-jwt' });
  assert.deepEqual(h.tokens, ['renewed-access', 'renewed-refresh']);
  assert.equal(h.requests.length, 7);
  for (const upload of h.requests.filter((request) => request.url.endsWith('/attachments'))) {
    assert.equal(upload.body, form);
    assert.equal(upload.headers.get('Idempotency-Key'), 'upload-key');
    assert.equal(upload.headers.has('Content-Type'), false);
  }
  assert.equal(h.requests.filter((request) => request.url.endsWith('/list?page=2')).length, 2);
});

test('tabs sharing Web Locks and token storage rotate only once', async () => {
  const stored = new Map();
  let queue = Promise.resolve();
  const locks = {
    request(_name, callback) {
      queue = queue.then(callback);
      return queue;
    },
  };
  const respond = (request) => {
    if (request.url.endsWith('/auth/refresh')) return refreshSuccess;
    return request.headers.get('Authorization') === 'Bearer renewed-access'
      ? { status: 200, body: { ok: true } }
      : expired;
  };
  const first = harness(respond, { stored, locks });
  const second = harness(respond, { stored, locks });
  first.tokenStorage.set(session);
  await Promise.all([first.http.get('/first'), second.http.get('/second')]);
  const requests = [...first.requests, ...second.requests];
  assert.equal(requests.filter((request) => request.url.endsWith('/auth/refresh')).length, 1);
  assert.deepEqual(second.tokens, ['renewed-access', 'renewed-refresh']);
});

test('a late refresh cannot replace tokens from a new login', async () => {
  let startRefresh;
  let releaseRefresh;
  const started = new Promise((resolve) => {
    startRefresh = resolve;
  });
  const refresh = new Promise((resolve) => {
    releaseRefresh = resolve;
  });
  const h = harness((request) => {
    if (!request.url.endsWith('/auth/refresh')) return expired;
    startRefresh();
    return refresh;
  });
  h.tokenStorage.set(session);
  const request = h.http.get('/list');
  await started;
  h.tokenStorage.set({ accessToken: 'new-login', refreshToken: 'new-login-refresh' });
  releaseRefresh(refreshSuccess);
  await assert.rejects(request, { status: 401 });
  assert.deepEqual(h.tokens, ['new-login', 'new-login-refresh']);
  assert.deepEqual(h.redirects, []);
  assert.equal(h.requests.length, 2);
});

test('a refresh 401 clears the session and moves to login once for all waiting requests', async () => {
  const h = harness(expired);
  h.tokenStorage.set(session);
  await Promise.all([
    assert.rejects(h.http.get('/first'), { status: 401 }),
    assert.rejects(h.http.get('/second'), { status: 401 }),
  ]);
  assert.equal(h.requests.length, 3);
  assert.deepEqual(h.tokens, []);
  assert.deepEqual(h.redirects, ['/login']);
});

const temporaryRefreshFailures = [
  {
    name: 'network failure',
    expected: { status: 0, code: 'NETWORK' },
    respond() {
      throw new Error('offline');
    },
  },
  {
    name: 'timeout',
    expected: { status: 0, code: 'TIMEOUT' },
    schedule: (callback) => setTimeout(callback, 0),
    respond: ({ signal }) =>
      new Promise((_, reject) => {
        signal.addEventListener('abort', () => reject(signal.reason), { once: true });
      }),
  },
  {
    name: 'server error',
    expected: { status: 503, code: 'UNAVAILABLE', message: '잠시 후 다시 시도해 주세요.' },
    respond: () => ({
      status: 503,
      body: { code: 'UNAVAILABLE', message: '잠시 후 다시 시도해 주세요.' },
    }),
  },
  {
    name: 'malformed success response',
    expected: { status: 502 },
    respond: () => ({ status: 200, body: { isSuccess: true, result: {} } }),
  },
];

for (const { name, expected, respond, schedule } of temporaryRefreshFailures) {
  test(`refresh ${name} preserves tokens and stops automatic retries`, async () => {
    let available = false;
    const h = harness(
      (request) => {
        if (request.url.endsWith('/auth/refresh'))
          return available ? refreshSuccess : respond(request);
        return request.headers.get('Authorization') === 'Bearer renewed-access'
          ? { status: 200, body: { ok: true } }
          : expired;
      },
      { schedule },
    );
    h.tokenStorage.set(session);
    const loadList = () =>
      h.queryClient.fetchQuery({ queryKey: ['list'], queryFn: () => h.http.get('/list') });

    await Promise.all([
      assert.rejects(loadList(), expected),
      assert.rejects(h.http.get('/second'), expected),
    ]);
    assert.equal(h.requests.length, 3);
    assert.deepEqual(h.tokens, ['service-jwt', 'refresh-jwt']);
    assert.deepEqual(h.redirects, []);

    available = true;
    assert.deepEqual(await loadList(), { ok: true });
    assert.equal(h.requests.length, 6);
    assert.deepEqual(h.tokens, ['renewed-access', 'renewed-refresh']);
  });
}

test('a Web Locks failure leaves the session in place', async () => {
  const h = harness(expired, {
    locks: { request: () => Promise.reject(new Error('lock unavailable')) },
  });
  h.tokenStorage.set(session);
  await assert.rejects(h.http.get('/list'), { name: 'RefreshError' });
  assert.equal(h.requests.length, 1);
  assert.deepEqual(h.tokens, ['service-jwt', 'refresh-jwt']);
  assert.deepEqual(h.redirects, []);
});

test('an access-only legacy session is cleared without calling refresh', async () => {
  const stored = new Map([['flout.accessToken', 'legacy-access']]);
  const h = harness(expired, { stored });
  await assert.rejects(h.http.get('/list'), { status: 401 });
  assert.equal(h.requests[0].headers.get('Authorization'), 'Bearer legacy-access');
  assert.equal(h.requests.length, 1);
  assert.equal(stored.size, 0);
  assert.deepEqual(h.redirects, ['/login']);
});

test('a second 401 expires the session instead of retrying refresh', async () => {
  const h = harness((request) =>
    request.url.endsWith('/auth/refresh') ? refreshSuccess : expired,
  );
  h.tokenStorage.set(session);
  await assert.rejects(h.http.get('/list'), { status: 401 });
  assert.equal(h.requests.length, 3);
  assert.deepEqual(h.tokens, []);
  assert.deepEqual(h.redirects, ['/login']);
});
