import OpenAI from 'openai'
import studentsData from '../data/students.json'
import userData from '../data/user.json'
import { findConnectionPath, type ConnectionPath } from './connections'

export interface Student {
  id: string
  name: string
  batch: string
  skills: string[]
  projects: { name: string; description: string }[]
  clubs: string[]
  bio: string
  connections: string[]
  matchReason?: string
  connectionPath?: ConnectionPath
}

export interface SearchResult {
  message: string
  students: (Student & { matchReason: string; connectionPath: ConnectionPath })[]
}

// Create a simplified view of the database for the LLM (without connection details)
const studentsForPrompt = (studentsData as Student[]).map(s => ({
  id: s.id,
  name: s.name,
  batch: s.batch,
  skills: s.skills,
  projects: s.projects,
  clubs: s.clubs,
  bio: s.bio
}))

const SYSTEM_PROMPT = `You are Cohora, a campus skill discovery assistant. You are ACTION-ORIENTED and HELPFUL.

IMPORTANT: Your job is to FIND and RETURN matching students, not to ask endless questions. Only ask ONE clarifying question if the query is truly ambiguous (like "designer" could mean graphic or UI/UX). For most queries, just return results.

The current user has these direct connections (1st degree):
${userData.connections.map(id => {
  const s = (studentsData as Student[]).find(st => st.id === id)
  return s ? `- ${s.name} (ID: ${id})` : ''
}).filter(Boolean).join('\n')}

RULES:
1. "Find me a frontend developer" → Return people with React, Vue, JavaScript, CSS skills. DO NOT ask for clarification.
2. "Who knows Python?" → Return Python developers. DO NOT ask for clarification.
3. "I need a designer" → This IS ambiguous. Ask: "UI/UX designer or graphic designer?"
4. For any skill search, return 2-4 matching students with evidence.
5. Always explain WHY each person matches based on their projects.
6. Be concise. One short sentence intro, then show results.

Student Database:
${JSON.stringify(studentsForPrompt, null, 2)}

RESPONSE FORMAT (JSON):
{
  "message": "Brief intro (1 sentence max), then I found X people for you:",
  "matchedStudentIds": ["id1", "id2", "id3"],
  "matchReasons": {
    "id1": "Has React/TypeScript skills, built CampusConnect",
    "id2": "Frontend specialist with Next.js experience"
  }
}

ALWAYS include matchedStudentIds when user asks for skills. Only skip if it's a greeting or truly unclear.`

export async function searchStudents(apiKey: string, query: string): Promise<SearchResult> {
  const openai = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true
  })

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: query }
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' }
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('No response from OpenAI')
  }

  try {
    const parsed = JSON.parse(content) as {
      message: string
      matchedStudentIds?: string[]
      matchReasons?: Record<string, string>
    }

    const matchedStudents: (Student & { matchReason: string; connectionPath: ConnectionPath })[] = []

    if (parsed.matchedStudentIds && parsed.matchedStudentIds.length > 0) {
      for (const id of parsed.matchedStudentIds) {
        const student = (studentsData as Student[]).find(s => s.id === id)
        if (student) {
          const connectionPath = findConnectionPath(id)
          matchedStudents.push({
            ...student,
            matchReason: parsed.matchReasons?.[id] || 'Matched based on skills',
            connectionPath
          })
        }
      }
    }

    return {
      message: parsed.message,
      students: matchedStudents
    }
  } catch {
    // If JSON parsing fails, return just the message
    return {
      message: content,
      students: []
    }
  }
}
