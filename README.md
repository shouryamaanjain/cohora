# Cohora - Campus Skill Discovery + Connections

A conversational AI chatbot that helps you discover people with specific skills on campus AND shows how you're connected to them through your network.

## Features

### Skill Discovery
- **Natural Language Search** - "Who knows Python?", "Find me a frontend developer"
- **Semantic Matching** - Understands synonyms and related skills
- **Evidence-First** - Shows projects and experience as proof

### Connection Pathfinding
- **1st Degree Connections** - Your direct network (simulated LinkedIn integration)
- **2nd/3rd Degree Paths** - Shows who can introduce you to anyone
- **Visual Connection Path** - See exactly how you're connected (You → Priya → Arjun)
- **Network Panel** - View all your connections at a glance

## Database

- **40 fictional students** with diverse skills, projects, and club memberships
- **Connection graph** - Each student has 5-6 connections creating realistic network paths
- **Your profile** - 6 direct connections to demonstrate pathfinding

## Tech Stack

- React + Vite + TypeScript
- TailwindCSS
- OpenAI GPT-4o-mini

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open http://localhost:5173 and enter your OpenAI API key

## Sample Queries

**Skill Discovery:**
- "Who knows Python?"
- "Find me a frontend developer"
- "I need someone for mobile apps"
- "Find me a designer" (will ask for clarification!)

**Connection Paths:**
- Results show 1st/2nd/3rd degree badges
- Connection path displays who can introduce you
- Direct connections show "You're directly connected!"

## Project Structure

```
src/
├── App.tsx                  # API key entry screen
├── components/
│   ├── Chat.tsx             # Chat interface + Network panel
│   └── StudentCard.tsx      # Student cards with connection paths
├── data/
│   ├── students.json        # 40 fictional students
│   └── user.json            # Your profile and connections
└── lib/
    ├── openai.ts            # OpenAI integration
    └── connections.ts       # BFS pathfinding algorithm
```

## How Connection Paths Work

1. Uses BFS (Breadth-First Search) to find shortest path
2. Builds an adjacency list from all student connections
3. Traces path back from target to you
4. Displays: "You → Priya Sharma → Target Person"
5. First person in path can make the introduction

## Connection Degrees

| Degree | Meaning | Display |
|--------|---------|---------|
| 1st | Direct connection | Green badge, "You're directly connected!" |
| 2nd | Friend of a friend | Blue badge, shows mutual connection |
| 3rd | 2 hops away | Orange badge, shows full path |
| None | Not in network | Gray badge |
