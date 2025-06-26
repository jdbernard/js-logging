# Overview

`@jdbernard/logging` implements a simple but powerful logging system for
JavaScript applications based on the idea of heirarchical loggers. It heavily
inspired by the usage patterns of [log4j][], [logback][], and similar tools in other
ecosystems.

## Getting Started

Install the package from npm:
```bash
npm install @jdbernard/logging
```

Then, in your application, you can use the logging system like so:

```typescript
import { logService, ConsoleAppender, LogLevel } from '@jdbernard/logging';

logService.ROOT_LOGGER.appenders.push(new ConsoleAppender(LogLevel.INFO));
const logger = logService.getLogger('example');

logger.info('Starting application');
```

## Loggers and Appenders

The logging system is composed of two main components: loggers and appenders.
Loggers are used to create log events, which are then passed to the appenders
associated with the logger and it's parent. An appender is a function that
takes a log event and writes it to some destination, such as the console, a
file, or a network socket. Appenders also have a logging level threshold, which
determines which log events are acted upon by the appender.

Loggers are hierarchical, with the hierarchy defined by the logger name. When a
log message is generated on a *Logger*, it is sent to any appenders associated
with that logger, and then triggered on the parent logger, being sent to any of
the parent logger's appenders, and so on up the hierarchy. Similarly, when a
logging event is generated, it is filtered by the effective logging level of
the logger. If there is no threshold set on the logger, the effective logging
level is inherited from the parent logger. This pattern is explained in detail
in the [logback documentation][effective logging level] and applies in the same
manner to this library.

Together, the cascading effective logging threshold and the upward propogation
of log events to parent appenders allows for simple yet fine-grained control
over the logging output of an application.

## Layouts

One difference from other logging libraries is the absense of layouts. Layouts
are used in many logging libraries to format the log message before it is
written to the appender. This requires the assumption of all logs being written
to a text-based destination, which is not always the case for us.

In this library, all logs are internally stored as structured data, defined by
the *LogMessage* interface. Notably, the *msg* field can be either a string
or an object, allowing for the addition of arbitrary fields to be added to the
log event.

The concept of Layouts still has a place, but it has been moved to be an
implementation detail of the appenders. *ConsoleAppender* accepts a
*LogMessageFormatter* function allowing for formatting of the resulting
messages written to the console. the *ApiAppender* would be an example of an
appender for which layout would be irrelevant.

Finally, notice that all of the appenders provided by this library
automatically persist log messages as structured data, flattening the `msg`
field if it is an object. *ConsoleAppender* will write the log message as a
JSON object, promoting fields in the `msg` object to top-level fields in
the output. For example:

```typescript
import { logService, ConsoleAppender } from '@jdbernard/logging';

logService.ROOT_LOGGER.appenders.push(new ConsoleAppender('TRACE'));
const logger = logService.getLogger('example');

function someBusinessLogic() {
  logger.debug({ method: 'someBusinessLogic', msg: 'Doing some business logic', foo: 'bar' });
}

logger.info('Starting application');
someBusinessLogic();
```

results in the following two events logged as output to the console:

```json
{"timestamp":"2021-09-01T00:00:00.000Z","level":"INFO","scope":"example","msg":"Starting application"}
{"timestamp":"2021-09-01T00:00:00.000Z","level":"DEBUG","scope":"example","msg":"Doing some business logic","method":"someBusinessLogic","foo":"bar"}
```

Note that the field name in the structured data for string messages is
"msg". In the case of an object message, the fields are used as provided.
Fields defined on the *LogMessage* interface are reserved and should not be
used as keys in the msg object (and will be ignored if they are). So, for
example:

```typescript
logger.debug({ level: 'WARN', msg: 'Example of ignored fields', timestamp: 'today' });

results in the following event logged as output to the console (note the
ignored `level` and `timestamp` fields from the object):

```json
{"timestamp":"2021-09-01T00:00:00.000Z","level":"DEBUG","scope":"example","msg":"Example of ignored fields"}
```

This flattening behavior is implemented in the `flattenMessage` function
exported from the `@jdbernard/logging/log-message.ts` module and is available
for use in custom appender implemetations.

As a final note, the *ConsoleAppender* has some special behavior for the ERROR
level and *stacktrace* field when running in a web browser to take advantage of
the console's built-in. See the documentation for the *ConsoleAppender* for
more information.

## Worked Example

To illustrate the usage of the logging system and the purpose of the
fine-grained control described above, consider the following TypeScript
example:

```typescript
// main.ts -- Entry point of the application
// A console appender is attached to the root logger to log all events at or
// above the INFO level.
logService.ROOT_LOGGER.appenders.push(new ConsoleAppender(LogLevel.INFO));

// An API appender is attached to the root logger to forward all ERROR events
// to a server-side error log collector.
logServive.ROOT_LOGGER.appenders.push(new ApiAppender(
  'https://api.example.com/error-logs',
  appStore.user.sessionToken,
  LogLevel.ERROR));

const appLog = logService.getLogger('app');
appLog.info('Starting application');

// api.ts -- API implementaiton
const apiLog = logService.getLogger('app/api');

// http-client.ts -- HTTP client implementation
const httpLog = logService.getLogger('app/api/http-client');
```

Because different parts of the application use namespaced loggers, we can
dynamically adjust the logging level of different parts of the application
without changing the code. For example, to increase the logging level of the
HTTP client to DEBUG, we can add the following line to the `main.ts` file:

```typescript
logService.getLogger('app/api/http-client').setLevel(LogLevel.DEBUG);
```

Additionally, if, for some reason, we only wanted to forward the ERROR events
from the API namespace to the server-side error log collector, we could attach
the *ApiAppender* to the `app/api` logger instead of the root logger. This
would allow us to log all events from both the API and HTTP client loggers to
the API log collector, but ignore the rest of the application regardless of the
logging level.

[log4j]: https://logging.apache.org/log4j/2.x/
[logback]: https://logback.qos.ch/
[effective logging level]: https://logback.qos.ch/manual/architecture.html#effectiveLevel
