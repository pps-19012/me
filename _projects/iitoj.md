---
title: IIT Online Judge
stack: React · TypeScript · Go · Docker · Turso
summary: A full-stack competitive programming platform with containerized code execution, real-time contests, leaderboards, and multi-language support.
github: https://github.com/pps-19012/online-judge
description: A full-stack competitive programming platform with containerized code execution, real-time contests, and leaderboards. Built with React, Go, and Docker.
featured: true
order: 2
---

## The Problem

IIT Gandhinagar needed an internal competitive programming platform for hosting coding contests. Existing options were either too expensive for institutional use or lacked the flexibility to run custom contests with controlled participation.

## What I Built

A full-stack online judge where instructors can create contests, add problems with hidden test cases, and invite specific students. Participants write and submit code in multiple languages, which gets evaluated in real time against test cases with automatic verdict generation and leaderboard ranking.

## Architecture

The system is split into three services:

- **Frontend** — React 18 with TypeScript, Tailwind CSS, and Radix UI components. Handles contest browsing, the code editor, submission history, and leaderboards.
- **Backend API** — Go (Fiber framework) serving REST endpoints for contest/problem management, user auth (Google OAuth + JWT), and submission orchestration. Backed by Turso (cloud SQLite).
- **Judge Service** — A separate Go service that receives code submissions, spins up isolated Docker containers per submission, executes user code against test inputs, and validates outputs. Uses a goroutine-based job queue for concurrent processing.

## Key Design Decisions

- **Containerized execution:** Every submission runs inside an isolated Alpine Linux Docker container. This prevents malicious code from affecting the host and enforces time/memory limits per language.
- **Separate judge service:** Decoupling the judge from the API server means the judge can be scaled independently and a slow submission queue doesn't block API responses.
- **Turso/LibSQL:** Chose cloud-hosted SQLite over Postgres to simplify deployment and avoid managing a database server — good enough for the expected load.
- **Google OAuth:** Students already have institutional Google accounts, so this eliminated the need for a custom auth system.

## Features

- Multi-language support (Python, C++, C) with per-language time and memory limits
- Contest creation with start/end times and invite-only participation
- Hidden and visible test cases per problem
- "Run" mode for testing code before final submission
- Real-time leaderboards with score tracking
- Submission history with verdicts (AC, WA, TLE, RE)
