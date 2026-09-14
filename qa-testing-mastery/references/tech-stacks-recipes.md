# Recetarios de Tecnologías y Código para Pruebas de Alta Fidelidad

Patrones y recetas listas para producción para Express, Sequelize (v6 y v7), Vitest/Jest, Supertest, Pact.js v3, Faker, Autocannon y k6.

---

## 1. Suite de Integración con Supertest, Vitest/Jest y CLS Rollbacks

### A. Configuración de CLS para Sequelize (`test/setup-cls.ts`)

```typescript
import { createNamespace } from 'cls-hooked';
import { Sequelize } from 'sequelize';

// 1. Crear espacio de nombres CLS y registrarlo en Sequelize antes de inicializar modelos
export const testNamespace = createNamespace('sequelize-test-namespace');
Sequelize.useCLS(testNamespace);
```

### B. Plantilla de Prueba de Integración (`test/integration/orders.spec.ts`)

```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../../src/app';
import { sequelize, User, Product, Order } from '../../src/models';
import { userFactory, productFactory } from '../factories';
import type { Transaction } from 'sequelize';

describe('POST /api/orders (Integración con BD Real y CLS Rollback)', () => {
  let transaction: Transaction;

  beforeAll(async () => {
    // Asegurar conexión a PostgreSQL real (ej. vía Testcontainers o Docker)
    await sequelize.authenticate();
  });

  beforeEach(async () => {
    // Iniciar transacción autogestionada por prueba
    transaction = await sequelize.transaction();
  });

  afterEach(async () => {
    // Reversión incondicional: la BD queda exactamente igual que antes del test en <5ms
    if (transaction) {
      await transaction.rollback();
    }
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('debe crear una orden con stock disponible y persistirla en la transacción', async () => {
    const user = await userFactory();
    const product = await productFactory({ stock: 5, price: 100 });

    const response = await request(app)
      .post('/api/orders')
      .send({
        userId: user.id,
        items: [{ productId: product.id, quantity: 2 }]
      });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      orderId: expect.any(String),
      total: 200,
      status: 'CONFIRMED'
    });

    // Validar mutación real en BD
    const updatedProduct = await Product.findByPk(product.id);
    expect(updatedProduct?.stock).toBe(3);
  });

  it('debe rechazar con 409 cuando dos peticiones concurrentes superan el stock', async () => {
    const user1 = await userFactory();
    const user2 = await userFactory();
    const product = await productFactory({ stock: 1, price: 50 });

    // Simular concurrencia real enviando dos peticiones simultáneas
    const [res1, res2] = await Promise.all([
      request(app).post('/api/orders').send({ userId: user1.id, items: [{ productId: product.id, quantity: 1 }] }),
      request(app).post('/api/orders').send({ userId: user2.id, items: [{ productId: product.id, quantity: 1 }] })
    ]);

    const statuses = [res1.status, res2.status].sort();
    expect(statuses).toEqual([201, 409]); // Una tiene éxito, la otra es rechazada por bloqueo
  });
});
```

---

## 2. Fábricas Dinámicas de Datos con Faker (`test/factories/index.ts`)

```typescript
import { faker } from '@faker-js/faker';
import { User, Product } from '../../src/models';

export async function userFactory(overrides: Partial<User> = {}): Promise<User> {
  return await User.create({
    id: faker.string.uuid(),
    email: faker.internet.email().toLowerCase(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    isActive: true,
    ...overrides
  });
}

export async function productFactory(overrides: Partial<Product> = {}): Promise<Product> {
  return await Product.create({
    id: faker.string.uuid(),
    sku: `SKU-${faker.string.alphanumeric(8).toUpperCase()}`,
    name: faker.commerce.productName(),
    price: parseFloat(faker.commerce.price({ min: 10, max: 500 })),
    stock: faker.number.int({ min: 1, max: 100 }),
    ...overrides
  });
}
```

---

## 3. Pruebas de Contrato CDC con Pact.js v3

### A. Consumidor (React Frontend - `src/api/users.pact.spec.ts`)

```typescript
import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import path from 'path';
import { fetchUserProfile } from './users';

const { like, regex } = MatchersV3;

const provider = new PactV3({
  consumer: 'ReactFrontend',
  provider: 'ExpressBackend',
  dir: path.resolve(process.cwd(), 'pacts')
});

describe('Pact con ExpressBackend', () => {
  it('obtiene el perfil de un usuario existente', async () => {
    provider
      .given('El usuario con ID 42 existe')
      .uponReceiving('Una peticion GET /api/users/42')
      .withRequest({
        method: 'GET',
        path: '/api/users/42',
        headers: { Accept: 'application/json' }
      })
      .willRespondWith({
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: {
          id: like(42),
          username: like('johndoe'),
          email: regex({ generate: 'john@example.com', matcher: '^\\S+@\\S+\\.\\S+$' }),
          roles: MatchersV3.eachLike('CUSTOMER'),
          createdAt: regex({ generate: '2026-09-01T10:00:00.000Z', matcher: '^\\d{4}-\\d{2}-\\d{2}T.*Z$' })
        }
      });

    await provider.executeTest(async (mockServer) => {
      const user = await fetchUserProfile(mockServer.url, 42);
      expect(user.username).toBe('johndoe');
      expect(user.roles).toContain('CUSTOMER');
    });
  });
});
```

### B. Proveedor (Express Backend - `test/contract/provider.spec.ts`)

```typescript
import { Verifier } from '@pact-foundation/pact';
import path from 'path';
import { app } from '../../src/app';
import { User, sequelize } from '../../src/models';
import type { Server } from 'http';

describe('Pact Provider Verification', () => {
  let server: Server;

  beforeAll(async () => {
    server = app.listen(8081);
  });

  afterAll(async () => {
    server.close();
  });

  it('valida los contratos del consumidor React', async () => {
    const verifier = new Verifier({
      provider: 'ExpressBackend',
      providerBaseUrl: 'http://localhost:8081',
      pactUrls: [path.resolve(process.cwd(), 'pacts/ReactFrontend-ExpressBackend.json')],
      stateHandlers: {
        'El usuario con ID 42 existe': async () => {
          // Inicializar estado real en Sequelize para la prueba del contrato
          await User.upsert({
            id: 42,
            username: 'johndoe',
            email: 'john@example.com',
            roles: ['CUSTOMER']
          });
        }
      }
    });

    await verifier.verifyProvider();
  });
});
```

---

## 4. Benchmarking con Autocannon (`test/performance/benchmark.ts`)

```typescript
import autocannon from 'autocannon';

async function runBenchmark() {
  const result = await autocannon({
    url: 'http://localhost:3000/api/dashboard',
    connections: 50,       // Conexiones simultáneas
    duration: 15,          // Segundos de duración
    pipelining: 1,
    headers: {
      'Authorization': 'Bearer test-token'
    }
  });

  console.log('--- RESULTADOS BENCHMARK AUTOCANNON ---');
  console.log(`Requests/sec promedio: ${result.requests.average}`);
  console.log(`Latencia p50: ${result.latency.p50} ms`);
  console.log(`Latencia p95: ${result.latency.p95} ms`);
  console.log(`Latencia p99: ${result.latency.p99} ms`);
  console.log(`Errores: ${result.errors} | Timeouts: ${result.timeouts}`);
}

runBenchmark();
```

---

## 5. Pruebas de Carga y Estrés con k6 (`test/performance/load-test.js`)

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },   // Ramp-up a 50 Virtual Users
    { duration: '1m', target: 200 },    // Estrés sostenido a 200 VUs
    { duration: '30s', target: 0 }      // Ramp-down
  ],
  thresholds: {
    // SLO: 95% de peticiones por debajo de 250ms
    http_req_duration: ['p(95)<250'],
    // SLO: tasa de errores menor al 0.5%
    http_req_failed: ['rate<0.005']
  }
};

export default function () {
  const url = 'http://localhost:3000/api/orders';
  const payload = JSON.stringify({
    productId: 'prod-uuid-123',
    quantity: 1
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-jwt'
    }
  };

  const res = http.post(url, payload, params);

  check(res, {
    'status es 201 o 409': (r) => r.status === 201 || r.status === 409,
    'tiempo respuesta < 300ms': (r) => r.timings.duration < 300
  });

  sleep(0.1);
}
```

---

## 6. Modernización y Sequelize v7 (Decorators y Tipado Estricto)

```typescript
import { Table, Attribute } from '@sequelize/core/decorators-legacy';
import { Model, DataTypes } from '@sequelize/core';

@Table({ tableName: 'users', timestamps: true })
export class User extends Model {
  @Attribute({
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  })
  declare id: string;

  @Attribute({
    type: DataTypes.STRING(120),
    allowNull: false
  })
  declare email: string;

  @Attribute({
    type: DataTypes.BIGINT, // Soporta enteros > MAX_SAFE_INTEGER sin desbordamiento
    allowNull: false,
    defaultValue: 0
  })
  declare balanceInCents: bigint;
}
```