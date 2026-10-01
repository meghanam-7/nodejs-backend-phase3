const autocannon = require("autocannon");

const url = process.env.LOAD_TEST_URL || "http://localhost:5000";

console.log(`Task 4 load test: ${url}`);

autocannon(
  {
    url,
    connections: 100,
    duration: 10,
    pipelining: 1,
  },
  (err, result) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    console.log("\n--- Task 4 Load Test Results ---");
    console.log(`Requests/sec: ${result.requests.average}`);
    console.log(`Latency p95: ${result.latency.p95} ms`);
    console.log(`Total requests: ${result.requests.total}`);
    console.log(`Errors: ${result.errors}`);
    console.log(`Timeouts: ${result.timeouts}`);
    console.log(`2xx: ${result['2xx'] || 0}`);
    console.log(`4xx: ${result['4xx'] || 0}`);
    console.log(`5xx: ${result['5xx'] || 0}`);
  }
);
