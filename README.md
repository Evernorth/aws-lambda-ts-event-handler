# aws-lambda-ts-event-handler

**Description**:

Minimalistic event handler & HTTP router for Serverless applications.

`aws-lambda-ts-event-handler` is a lightweight and focusted Typescript library that brings elegant HTTP routing to AWS Lambda functions - without the overhead of traditional web frameworks.
Designed specifically for serverless workloads on AWS, this library enables developers to define clean and type-safe API routes using Typescript decorations.

**Features**

- **Minimal & Efficient**: Tailored for AWS Lambda to keep cold start times low and performant.
- **Typescript Decorators**: Intuitive route defintions using modern decorator syntax.
- **Built-in CORS Support**: Easily enable and configure CORS to your APIs.
- **Local HTTP Test Server**: Simulate and test routes locally without deploying to AWS.

**Why Use This?**
While robust frameworks like Express and Koa offer powerful tooling, they are often optimized for traditional server environments. `aws-lambda-ts-event-handler` focuses on the specific needs of Lambda-based applications, providing just the right level of abstraction to build scalabale serverless APIs -cleanly and efficiently.

## Dependencies

See the [package.json](./package.json) file.

## Building from Source

For detailed instructions to build the project from source, please see [INSTALL](INSTALL.md) document. To add this library to your project, run

```shell
npm install --save @evernorth/aws-lambda-ts-event-handler
```

## Installation

Please see [INSTALL](INSTALL.md) document.

## Configuration

If the software is configurable, describe it in detail, either here or in other documentation to which you link.

## Usage

### Simple Example

Let's create a simple AWS Lambda HTTP Event handler

```shell
mkdir aws-lambda-ts-event-handler-example
cd aws-lambda-ts-event-handler-example
npm init --yes
```

Install the dependency

```shell
npm install --save @evernorth/aws-lambda-ts-event-handler
```

Install dev dependencies for AWS Lambda

```shell
npm install --save-dev aws-lambda @types/node @types/aws-lambda
```

Create a `app.ts` file

```typescript
// Import API Gateway Event handler
import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { ApiGatewayResolver } from "./ApiGateway";
import { AsyncFunction, BaseProxyEvent, JSONData } from "types";

// Initialize the event handler
const app = new ApiGatewayResolver();

// Define a route
const helloHandler = async (
  _event: BaseProxyEvent,
  _context: Context
): Promise<JSONData> => Promise.resolve({ message: "Hello World" });

// Register Route
app.addRoute("GET", "/v1/hello", helloHandler as AsyncFunction);

// Declare your Lambda handler
// Declare your Lambda handler
exports.handler = (
  _event: APIGatewayProxyEvent,
  _context: Context
): Promise<JSONData> =>
  // Resolve routes
  app.resolve(_event, _context);
```

Run the application

```shell
ts-node app.ts
```

The package includes a test server (`LocalTestServer`) for local testing.

You should see a message

```shell
Test server listening on port 4000
```

Test the service

```shell
curl http://localhost:4000/v1/hello
{"message":"Hello World"}
```

### Register Route with Decorators

```typescript
import { APIGatewayProxyEvent, Context } from "aws-lambda";
import {
  ApiGatewayResolver,
  BaseProxyEvent,
  JSONData,
  Handler,
  LocalTestServer,
} from "@cigna/aws-lambda-ts-event-handler";

// Initialize the event handler
const app = new ApiGatewayResolver();

// Define a Controller class
export class HelloController {
  // Register a route
  @app.get("/v1/hello")
  public hello(_event: BaseProxyEvent, _context: Context): Promise<JSONData> {
    return Promise.resolve({ message: "Hello World" });
  }

  @app.post("/v1/hello")
  public postHello(
    _event: BaseProxyEvent,
    _context: Context
  ): Promise<JSONData> {
    return Promise.resolve({ message: "Resource created" });
  }
}

const handler = (
  _event: APIGatewayProxyEvent,
  _context: Context
): Promise<JSONData> =>
  // Resolve routes
  app.resolve(_event, _context);

// Declare your Lambda handler
if (require.main === module) {
  LocalTestServer.getInstance(handler as Handler).start();
} else {
  module.exports.handler = handler;
}
```

### CORS Support

```typescript
// Import API Gateway Event handler
import { CORSConfig } from "types";
import { ApiGatewayResolver, ProxyEventType } from "./ApiGateway";

// App with CORS Configurattion
const app = new ApiGatewayResolver(
  ProxyEventType.APIGatewayProxyEvent,
  new CORSConfig()
);
```

adds standard CORS headers to the response

```shell
➜ curl http://localhost:4000/v1/hello -v

* Host localhost:4000 was resolved.
* IPv6: ::1
* IPv4: 127.0.0.1
*   Trying [::1]:4000...
* Connected to localhost (::1) port 4000
> GET /v1/hello HTTP/1.1
> Host: localhost:4000
> User-Agent: curl/8.7.1
> Accept: */*
>
* Request completely sent off
< HTTP/1.1 200 OK
< Content-Type: application/json
< Access-Control-Allow-Origin: *
< Access-Control-Allow-Headers: Authorization,Content-Type,X-Amz-Date,X-Api-Key,X-Amz-Security-Token
< content-length: 25
< Date: Mon, 10 Mar 2025 20:47:29 GMT
< Connection: keep-alive
< Keep-Alive: timeout=5
<
* Connection #0 to host localhost left intact
{"message":"Hello World"}%
```

## Known issues

Document any known significant shortcomings with the software.

## Getting help

If you have questions, concerns, bug reports, etc., file an issue in this repository's Issue Tracker.

## Getting involved

See the [CONTRIBUTING](CONTRIBUTING.md) file for info on how to get involved.

## License

aws-lambda-ts-event-handler is Open Source software released under the [Apache 2.0 license](https://www.apache.org/licenses/LICENSE-2.0.html).

---

### Original Contributors

1. Karthikeyan Perumal, Evernorth
