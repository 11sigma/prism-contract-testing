import {
  getHttpOperationsFromResource,
  IHttpConfig,
} from "@stoplight/prism-http";
import { createServer as createHttpServer } from "@stoplight/prism-http-server";
import { resolve } from "path";
import { IPrismHttpServer } from "@stoplight/prism-http-server/dist/types";
import axios from "axios";
import { IHttpOperation } from "@stoplight/types";
import { createLogger } from "@stoplight/prism-core";

const PORT = 4011;
const logger = createLogger("TEST", { enabled: false });

describe("API Contract Test", () => {
  const config = {
    cors: false,
    config: {
      mock: false,
      errors: false,
      checkSecurity: true,
      validateRequest: true,
      validateResponse: true,
      upstream: new URL("http://httpbin"),
    } as IHttpConfig,
    components: { logger },
  };
  let server: IPrismHttpServer;
  let operations: IHttpOperation[];

  beforeAll(async () => {
    // extract HTTP operations from the OAS file and convert them to an array of spec-agnostic objects
    operations = await getHttpOperationsFromResource(
      resolve(__dirname, "api.oas2.yaml")
    );
    // create a Prism server programmatically
    server = createHttpServer(operations, config);
    await server.listen(PORT, "localhost");
  });

  test("test operations", () => {
    // for each operation defined in the OAS file
    return Promise.all(
      operations.map(async (operation) => {
        // dummy convertion from the IHttpOperation to an Axios request
        const request = operation2Request(operation);
        // make a request to the Prism server
        const response = await axios(request);

        // Note: these are vialations provided by Prism
        // In order to assure you meet the contract
        // you should expect vialotions to be undefined.
        expect(JSON.parse(response.headers["sl-violations"])).toEqual([
          {
            location: ["response", "body"],
            severity: "Error",
            code: "required",
            message: "should have required property 'title'",
          },
          {
            location: ["response", "body"],
            severity: "Error",
            code: "required",
            message: "should have required property 'description'",
          },
        ]);
      })
    );
  });

  afterEach(async () => {
    await server.close();
  });
});

function operation2Request(operation: IHttpOperation): any {
  // pseudo conversion
  return {
    url: `http://localhost:${PORT}${operation.path}`,
    method: operation.method,
  };
}
