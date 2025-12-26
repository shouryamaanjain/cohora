import type { ConnectionPath } from '../lib/connections'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Briefcase, Users, GitBranch, ArrowRight } from "lucide-react"

interface Student {
  id: string
  name: string
  batch: string
  skills: string[]
  matchReason: string
  projects: { name: string; description: string }[]
  clubs: string[]
  bio: string
  connectionPath?: ConnectionPath
}

interface StudentCardProps {
  student: Student
}

function ConnectionBadge({ connectionPath }: { connectionPath: ConnectionPath }) {
  if (!connectionPath || connectionPath.degree === null) {
    return (
      <Badge variant="outline" className="gap-1.5 font-normal text-muted-foreground bg-background/50">
        <GitBranch className="w-3 h-3" />
        Not in network
      </Badge>
    )
  }

  const styles = {
    1: 'border-green-600/30 bg-green-50 text-green-700 hover:bg-green-100',
    2: 'border-blue-600/30 bg-blue-50 text-blue-700 hover:bg-blue-100',
    3: 'border-orange-600/30 bg-orange-50 text-orange-700 hover:bg-orange-100'
  }

  const labels = {
    1: '1st degree',
    2: '2nd degree',
    3: '3rd degree'
  }

  return (
    <Badge variant="outline" className={`gap-1.5 font-normal transition-colors ${styles[connectionPath.degree]}`}>
      <GitBranch className="w-3 h-3" />
      {labels[connectionPath.degree]}
    </Badge>
  )
}

function ConnectionPathDisplay({ connectionPath }: { connectionPath: ConnectionPath }) {
  if (!connectionPath || connectionPath.degree === null) return null
  
  if (connectionPath.degree === 1) {
    return (
      <div className="flex items-center gap-2 text-xs text-green-700 mt-3 p-2.5 bg-green-50 rounded-md border border-green-200">
        <Users className="w-3.5 h-3.5 flex-shrink-0" />
        <span>You're directly connected!</span>
      </div>
    )
  }

  return (
    <div className="mt-3 p-3 bg-muted/50 rounded-md border border-border">
      <p className="text-xs text-muted-foreground mb-2 font-medium">Connection path</p>
      <div className="flex items-center gap-1.5 flex-wrap">
        {connectionPath.path.map((name, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <Badge variant="secondary" className={`text-xs font-normal border ${
              index === 0 
                ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/15' 
                : index === connectionPath.path.length - 1
                  ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                  : 'bg-background hover:bg-muted'
            }`}>
              {name}
            </Badge>
            {index < connectionPath.path.length - 1 && (
              <ArrowRight className="w-3 h-3 text-muted-foreground/50" />
            )}
          </div>
        ))}
      </div>
      {connectionPath.via && connectionPath.degree > 1 && (
        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
          <span className="text-primary font-medium">{connectionPath.path[1]}</span> can introduce you
        </p>
      )}
    </div>
  )
}

export default function StudentCard({ student }: StudentCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg bg-card border-border/60">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-background shadow-sm ring-1 ring-border">
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {student.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-base font-semibold leading-none mb-1.5">{student.name}</h3>
              <p className="text-xs text-muted-foreground font-medium">Batch of {student.batch}</p>
            </div>
          </div>
          {student.connectionPath && (
            <ConnectionBadge connectionPath={student.connectionPath} />
          )}
        </div>

        {student.matchReason && (
          <div className="mb-4 text-xs text-primary bg-primary/5 border border-primary/10 px-3 py-2 rounded-md flex items-start gap-2">
            <div className="mt-0.5 min-w-[4px] h-[4px] rounded-full bg-primary" />
            <span className="leading-relaxed">{student.matchReason}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5 mb-4">
          {student.skills.slice(0, 4).map(skill => (
            <Badge key={skill} variant="secondary" className="font-normal">
              {skill}
            </Badge>
          ))}
          {student.skills.length > 4 && (
            <Badge variant="outline" className="font-normal text-muted-foreground">
              +{student.skills.length - 4} more
            </Badge>
          )}
        </div>

        {student.projects.length > 0 && (
          <>
            <Separator className="my-3 opacity-50" />
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                <Briefcase className="w-3.5 h-3.5" />
                <span>Recent Work</span>
              </div>
              <div className="space-y-2">
                {student.projects.slice(0, 2).map(project => (
                  <div key={project.name} className="group">
                    <p className="text-sm font-medium leading-none mb-1 group-hover:text-primary transition-colors">
                      {project.name}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-1">
                      {project.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {student.clubs.length > 0 && (
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            <span>{student.clubs.join(' · ')}</span>
          </div>
        )}

        {student.connectionPath && (
          <ConnectionPathDisplay connectionPath={student.connectionPath} />
        )}
      </CardContent>
    </Card>
  )
}
