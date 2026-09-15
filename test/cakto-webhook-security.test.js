import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/cakto-webhook.js';

function createMockRes() {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    }
  };
  return res;
}

test('Cakto Webhook — Method Not Allowed for GET/PUT/DELETE', async () => {
  const req = { method: 'GET', headers: {}, body: {} };
  const res = createMockRes();
  await handler(req, res);
  assert.equal(res.statusCode, 405);
  assert.match(res.body.error, /Method Not Allowed/);
});

test('Cakto Webhook — Rejects request when CAKTO_WEBHOOK_SECRET is set and header is missing', async () => {
  process.env.CAKTO_WEBHOOK_SECRET = 'super-secret-key-123';
  const req = {
    method: 'POST',
    headers: {},
    body: {
      event: 'payment_approved',
      data: { id: 'tx_999', amount: 1500, customer: { id: 'usr_1', email: 'secret@user.com' } }
    }
  };
  const res = createMockRes();
  await handler(req, res);
  assert.equal(res.statusCode, 401);
  assert.match(res.body.error, /Unauthorized/);
  delete process.env.CAKTO_WEBHOOK_SECRET;
});

test('Cakto Webhook — Rejects request when secret is wrong', async () => {
  process.env.CAKTO_WEBHOOK_SECRET = 'super-secret-key-123';
  const req = {
    method: 'POST',
    headers: { 'x-cakto-signature': 'wrong-key' },
    body: {
      event: 'payment_approved',
      data: { id: 'tx_999', amount: 1500 }
    }
  };
  const res = createMockRes();
  await handler(req, res);
  assert.equal(res.statusCode, 401);
  delete process.env.CAKTO_WEBHOOK_SECRET;
});

test('Cakto Webhook — Accepts request with matching x-cakto-signature', async () => {
  process.env.CAKTO_WEBHOOK_SECRET = 'valid-token-xyz';
  const req = {
    method: 'POST',
    headers: { 'x-cakto-signature': 'valid-token-xyz' },
    body: {
      event: 'payment_approved',
      data: {
        id: 'tx_valid_01',
        amount: 1500,
        customer: { id: 'user_456', email: 'test@example.com' }
      }
    }
  };
  const res = createMockRes();
  await handler(req, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.status, 'success');
  assert.equal(res.body.credited.isPremiumPass, true);
  delete process.env.CAKTO_WEBHOOK_SECRET;
});

test('Cakto Webhook — Accepts request with Authorization Bearer header', async () => {
  process.env.CAKTO_WEBHOOK_SECRET = 'valid-token-xyz';
  const req = {
    method: 'POST',
    headers: { 'authorization': 'Bearer valid-token-xyz' },
    body: {
      event: 'payment_approved',
      data: {
        id: 'tx_valid_02',
        amount: 5000,
        offer_id: 'ac_5000'
      }
    }
  };
  const res = createMockRes();
  await handler(req, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.status, 'success');
  assert.equal(res.body.credited.adenCoins, 5000);
  delete process.env.CAKTO_WEBHOOK_SECRET;
});

test('Cakto Webhook — Ignores non-approved payments gracefully with 200 OK', async () => {
  const req = {
    method: 'POST',
    headers: {},
    body: {
      event: 'payment_created',
      data: {
        id: 'tx_pending_01',
        status: 'pending',
        amount: 2000
      }
    }
  };
  const res = createMockRes();
  await handler(req, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.status, 'ignored');
});
