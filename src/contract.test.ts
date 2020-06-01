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
    // extract HTTP operations from the OAS file and convert them to an array of spec-agnostic objects
    operations = await getHttpOperationsFromResource(resolve(__dirname, 'api.oas2.yaml'));
    // create a Prism server programmatically
    server = createHttpServer(operations, config);
    await server.listen(4011, 'localhost');
  });

  test('test operations', () => {
    // for each operation defined in the OAS file
    return Promise.all(operations.map(async operation => {
      // dummy convertion from the IHttpOperation to an Axios request
      const request = operation2Request(operation);
      // make a request to the Prism server
      const response = await axios(request);
      /* THIS SHOULD FAIL with:
      ```json
        [
          {
            "location": [
              "response",
              "body"
            ],
            "severity": "Error",
            "code": "required",
            "message": "should have required property 'title'"
          },
          {
            "location": [
              "response",
              "body"
            ],
            "severity": "Error",
            "code": "required",
            "message": "should have required property 'description'"
          }
        ]
       ```
      */
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