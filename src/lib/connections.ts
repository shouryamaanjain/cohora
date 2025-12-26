import studentsData from '../data/students.json'
import userData from '../data/user.json'

interface Student {
  id: string
  name: string
  connections: string[]
}

export interface ConnectionPath {
  degree: 1 | 2 | 3 | null
  path: string[] // Names in the path from user to target
  via: string | null // Who can introduce you (first mutual connection)
}

// Build adjacency list for BFS
function buildGraph(): Map<string, string[]> {
  const graph = new Map<string, string[]>()
  
  // Add user node
  graph.set('user', userData.connections)
  
  // Add all student nodes
  for (const student of studentsData as Student[]) {
    graph.set(student.id, student.connections || [])
  }
  
  return graph
}

// Get student name by ID
function getName(id: string): string {
  if (id === 'user') return 'You'
  const student = (studentsData as Student[]).find(s => s.id === id)
  return student?.name || id
}

// BFS to find shortest path from user to target
export function findConnectionPath(targetId: string): ConnectionPath {
  // Check if target is the user themselves
  if (targetId === 'user') {
    return { degree: null, path: [], via: null }
  }

  const graph = buildGraph()
  const visited = new Set<string>()
  const parent = new Map<string, string>()
  const queue: string[] = ['user']
  
  visited.add('user')
  
  while (queue.length > 0) {
    const current = queue.shift()!
    
    // Found the target
    if (current === targetId) {
      // Reconstruct path
      const path: string[] = []
      let node: string | undefined = current
      
      while (node !== undefined) {
        path.unshift(getName(node))
        node = parent.get(node)
      }
      
      const degree = path.length - 1
      
      if (degree > 3) {
        return { degree: null, path: [], via: null }
      }
      
      return {
        degree: degree as 1 | 2 | 3,
        path,
        via: path.length > 2 ? path[1] : null
      }
    }
    
    // Explore neighbors
    const neighbors = graph.get(current) || []
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        parent.set(neighbor, current)
        queue.push(neighbor)
      }
    }
  }
  
  // No path found
  return { degree: null, path: [], via: null }
}

// Get all 1st degree connections (for network panel)
export function getFirstDegreeConnections(): Student[] {
  return userData.connections
    .map(id => (studentsData as Student[]).find(s => s.id === id))
    .filter((s): s is Student => s !== undefined)
}

// Check if someone is a direct connection
export function isDirectConnection(targetId: string): boolean {
  return userData.connections.includes(targetId)
}

