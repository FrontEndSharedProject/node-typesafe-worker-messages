# Node Typesafe worker messages

Using type-safe worker communication in Node.

# Install

```shell
$ pnpm add node-typesafe-worker-messages -D
```

# Features

1. Complete TypeScript support and parameter constraints.
2. Support for wrapping message callbacks with Promises.

# Usage

## Define Message types

> ⚠️ The message type must return a promise when defined.

```typescript
//  types.ts

//  Message types sent from the main process to a worker.
type ParentMessage = {
  getWorkProcessId(): Promise<number>;
  getWorkTasksList(): Promise<string[]>;
  printDataFromWorker(
    args: number,
    args2: number,
    args3: number
  ): Promise<void>;
};

//  Message types sent from the worker process to main process.
type WorkerMessage = {
  getMainProcessId(): Promise<number>;
  getUserInfoById(id: string): Promise<string>;
};
```

## Main Process

```typescript
import { TypeSafeWorkerMessagesInMain } from "node-typesafe-worker-messages";
import type { ParentMessage, WorkerMessage } from "./types.ts";

const worker = new TypeSafeWorkerMessagesInMain<ParentMessage, WorkerMessage>(
  //  The parameter list is identical to defining a worker_threads,
  //  because internally it initializes the worker_threads and pass the args
  join(__dirname, "worker.cjs"),
  {
    workerData: { foo: "bar" },
  }
);

//  All methods are the same as worker_threads
//
worker.on("online", () => {
  //  However, we provide two methods, handle and send.
  //  send is used to send a message to the worker,
  //  and handle is used to handle messages within the worker.
  //  They are both parameter-constrained based on ParentMessage type and WorkerMessage type.
  worker.handle("getMainProcessId", () => {
    return Promise.resolve(1234);
  });

  worker.handle("getUserInfoById", () => {
    return Promise.resolve("Carl");
  });

  worker.send("printDataFromWorker", 1, 2, 3);

  worker.send("getWorkTasksList").then((res) => {
    console.log(res, "getWorkTasksList callback");
  });

  //  you can also continue to use the on method.
  //  Remember that this instance is just a wrapper for worker_threads.
  worker.on("message", (action) => {
    if (action === "close") {
      worker.terminate();
    }
  });
});
```

## Worker

> ⚠️ Note that using the TypeSafeWorkerMessagesInWorker method will make the worker persistent, and you will need to manually terminate it in the main process.

```typescript
import { TypeSafeWorkerMessagesInWorker } from "node-typesafe-worker-messages";
import type { ParentMessage, WorkerMessage } from "./types.ts";

const _: MessagePort = parentPort as MessagePort;
const parent = TypeSafeWorkerMessagesInWorker<ParentMessage, WorkerMessage>(_);

parent.handle("getWorkProcessId", () => {
  return Promise.resolve(123);
});

parent.handle("printDataFromWorker", (...args) => {
  console.log(args, "from worker");
});

parent.handle("getWorkTasksList", () => {
  return Promise.resolve(["1", "2222"]);
});

setTimeout(() => {
  parent.send("getUserInfoById", "44").then((res) => {
    console.log(res, "getUserInfoById callback from parent with callback!");

    parent.postMessage("close");
  });
}, 2000);
```
