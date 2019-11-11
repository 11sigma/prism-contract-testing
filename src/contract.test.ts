import { getHttpOperationsFromResource, IHttpConfig } from '@stoplight/prism-http';
import { createServer as createHttpServer } from '@stoplight/prism-http-server';
import { resolve } from 'path';
import { IPrismHttpServer } from '@stoplight/prism-http-server/dist/types';
import axios from 'axios';
import { IHttpOperation } from '@stoplight/types';

describe('API Contract Test', () => {  
  const config = {
    cors: false,
    config: {
      mock: false,
      checkSecurity: true,
      validateRequest: true,
      validateResponse: true,
      upstream: new URL('http://httpbin'),
    } as IHttpConfig,
    components: { logger: console },
    errors: false,
  };
  let server: IPrismHttpServer;
  let operations: IHttpOperation[];

  beforeAll(async () => {
    operations = await getHttpOperationsFromResource(resolve(__dirname, 'api.oas2.yaml'));
    server = createHttpServer(operations, config);
    const address = await server.listen(4011, 'localhost');
  });

  test('test operations', () => {
    return Promise.all(operations.map(async operation => {
      const request = operation2Request(operation);
      const response = await axios(request);
      expect(response.headers['sl-violations']).toBeUndefined();
    }))
  });

  afterEach(async () => {
    await server.fastify.close();
  });
});

function operation2Request(operation: IHttpOperation): any {
  // pseudo conversion
  return {
    url: `http://localhost:4011${operation.path}`,
    method: operation.method,
  }
}