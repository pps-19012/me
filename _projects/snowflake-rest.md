---
title: snowflake-rest
stack: Python · Snowflake SQL API · JWT · REST
summary: A lightweight Python client for the Snowflake SQL API — built for serverless environments where the official connector is too heavy.
github: https://github.com/pps-19012/snowflake-rest
pypi: https://pypi.org/project/snowflake-rest/
description: Lightweight Python client for the Snowflake SQL API. No native connector needed. Built for serverless environments like AWS Lambda and Cloud Functions.
featured: true
order: 1
---

## The Problem

The official `snowflake-connector-python` is 50+ MB with C extensions. In serverless environments (AWS Lambda, Cloud Functions), that means bloated deployment packages, slow cold starts, and painful dependency management. If all you need is to run queries via Snowflake's REST-based SQL API, you're paying an enormous overhead for features you'll never use.

Using the SQL API directly isn't trivial either — it requires JWT generation with RSA key fingerprinting, async polling for long-running queries, multi-partition result pagination, manual type coercion (everything comes back as strings), and a binding limitation where only the first statement in a transaction supports parameter bindings.

## What I Built

A focused Python client that handles all the SQL API complexity internally and exposes a clean interface:

```python
from snowflake_rest import SnowflakeClient

client = SnowflakeClient(
    account="myorg-myaccount",
    user="SVC_USER",
    private_key_path="~/.snowflake/rsa_key.p8",
    database="MY_DB",
    warehouse="COMPUTE_WH",
)

rows = client.query("SELECT * FROM users WHERE status = ?", ["active"])
```

Under 100 KB installed. No C dependencies. Works anywhere Python runs.

## Key Design Decisions

- **JWT auth with automatic refresh:** Computes the SHA-256 fingerprint of the public key DER, generates short-lived JWTs, and caches/refreshes them transparently. The user never touches token logic.
- **Transparent async promotion:** Snowflake returns 202 for long-running queries. The client automatically polls the status URL until completion — callers just see results.
- **Safe transaction escaping:** Snowflake's multi-statement API only supports bindings on the first statement. For transactions, the library safely escapes and inlines values for subsequent statements, handling the edge cases (NULL, booleans, timestamps, strings with quotes).
- **Automatic type coercion:** Uses result set metadata to convert strings back to proper Python types (int, Decimal, datetime, bool, etc.). Opt-out available.
- **Streaming with lazy partition fetching:** For large result sets, rows are yielded one at a time with partitions fetched on demand — constant memory usage regardless of result size.

## Features

- Multiple query styles: `query`, `query_one`, `query_scalar`, `query_column`, `query_stream`
- Result mapping to dataclasses and Pydantic models
- Transaction support with session variables
- Batch insert with configurable batch size
- Async query submission and polling
- COPY INTO export helper
- Pandas DataFrame integration
- CLI for ad-hoc queries (table, CSV, JSON output)
- Configurable retries on transient errors (429, 502, 503, 504)
- Query profiling hooks

## Performance

Query speeds are comparable to the official connector, but connection setup is faster and more consistent. Install size is 40 MB (with deps) vs 117 MB. In serverless where cold starts dominate, this is the difference that matters.
