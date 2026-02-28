---
title: GoTogether
stack: React Native · Expo · Python · MySQL · Socket.io
summary: A ride-sharing mobile app with detour-aware matching, real-time group chat, and preference-based filtering.
github: https://github.com/pps-19012/GoTogether
description: GoTogether is a mobile ride-sharing app with detour-aware matching, real-time group chat, and preference-based filtering. Built with React Native, Python, and Socket.io.
featured: true
order: 3
---

## The Problem

Students commuting to and from campus often travel the same routes at the same times but have no easy way to find each other. Existing ride-sharing apps are designed for on-demand taxis, not for coordinating carpools among people heading in the same direction.

## What I Built

GoTogether is a mobile app where users either offer rides (if they have a car) or request them. The app matches compatible trips based on geographic proximity, route overlap, and passenger preferences — then lets matched riders chat in real time before committing to a shared ride.

## How Matching Works

This was the most interesting part to build. The matching isn't just "who's nearby" — it calculates the actual time cost of a detour:

- First, a Haversine distance filter finds trips within a 5km radius of each other's pickup/dropoff points.
- For each candidate match, the app calls the OpenRouteService API to compute the driver's original route time (A→B) versus the route with the detour (A→pickup→dropoff→B).
- Only matches where the detour falls within the driver's tolerance are shown.

This means a driver going from North Campus to the airport won't get matched with someone going in the opposite direction, even if they're physically close.

## Architecture

- **Mobile app** — React Native with Expo. Uses React Native Maps for location selection, Google Places autocomplete for address search, and Clerk for OAuth authentication.
- **REST API** — Python HTTP server handling user profiles, trip creation, match computation, and group management. Backed by MySQL on PlanetScale.
- **Chat server** — A separate Socket.io server for real-time group messaging. Uses room-based routing so messages only go to members of the same ride group.

## Key Design Decisions

- **Detour time over distance:** Matching by straight-line distance is misleading — two points 2km apart can be a 20-minute detour in traffic. Using actual route time from OpenRouteService gives drivers a realistic picture of the cost.
- **Group-then-chat flow:** Instead of a global chat, users first select specific matches to form a group, then chat within that group. This keeps conversations focused and avoids the noise of a public board.
- **One active trip per user:** Enforced at the backend level to keep the matching pool clean and prevent stale trips from cluttering results.
- **Separate chat service:** The Socket.io server runs independently from the REST API. This keeps the stateless API simple and lets the real-time layer manage its own connection state.

## Features

- Two modes: "I have a car" (offer rides) and "I don't have a car" (request rides)
- Preference filters — gender composition, seat count, detour tolerance
- Interactive map for selecting pickup and dropoff locations
- Real-time group chat with message persistence
- User profiles with ratings
- Cross-platform (iOS and Android via Expo)
