---
layout: post
title: "Building snowflake-rest"
date: 2026-04-04
---

I built [snowflake-rest](https://github.com/pps-19012/snowflake-rest) because the official Snowflake connector is absurdly heavy for what most serverless workloads actually need.

The problem is simple: `snowflake-connector-python` pulls in 50+ MB of C extensions. On AWS Lambda or Cloud Functions, that's a cold start tax you pay on every invocation. If all you're doing is running queries, there's no reason to ship a native binary just to talk to a REST API.

Snowflake has a [SQL API](https://docs.snowflake.com/en/developer-guide/sql-api/index) — a proper HTTP endpoint that accepts SQL and returns JSON. But using it directly is surprisingly painful. You need to:

1. Load your RSA private key, compute the SHA-256 fingerprint of the public key's DER encoding
2. Generate a JWT with a very specific issuer format (`ACCOUNT.USER.SHA256_FINGERPRINT`)
3. Cache and refresh tokens before expiry
4. Handle 202 responses (async promotion) by polling a status URL
5. Parse paginated results across multiple partitions
6. Coerce every value from strings back to proper types using result metadata
7. Deal with the binding limitation in multi-statement transactions

That's easily 800-1,000 lines of boilerplate before you write a single business query. So I wrapped it all up.

## The hard part: transactions

The trickiest piece was transaction support. Snowflake's multi-statement API has a quirk: parameter bindings (`?` placeholders) only work on the first statement. Every subsequent statement in the transaction needs values inlined directly into the SQL.

This means you need safe escaping that handles every edge case — NULL, booleans, timestamps, strings with embedded quotes, numeric types. Get it wrong and you have SQL injection in your own client library. I ended up building an escaping layer that maps Python types to their Snowflake SQL literals, with extensive test coverage for the weird cases.

## What it looks like now

```python
from snowflake_rest import SnowflakeClient

client = SnowflakeClient.from_env()

# Simple query
rows = client.query("SELECT * FROM users WHERE status = ?", ["active"])

# Transaction
with client.transaction() as tx:
    tx.set("now_ts", "CURRENT_TIMESTAMP()")
    tx.execute("UPDATE users SET updated=$now_ts WHERE id=?", [42])
    tx.execute("INSERT INTO audit (action, ts) VALUES (?, $now_ts)", ["update"])

# Streaming for large results
for row in client.query_stream("SELECT * FROM events"):
    process(row)
```

It's on [PyPI](https://pypi.org/project/snowflake-rest/) — `pip install snowflake-rest`. Under 100 KB, three dependencies (requests, PyJWT, cryptography), works everywhere Python does.
