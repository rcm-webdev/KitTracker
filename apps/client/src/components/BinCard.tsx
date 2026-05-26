import { Link } from "react-router"
import { MapPin, Pencil } from "lucide-react"
import type { Bin } from "@strawhats/shared"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface BinCardProps {
  bin: Bin
  canEdit?: boolean
}

export default function BinCard({ bin, canEdit = true }: BinCardProps) {
  const itemCount = bin.items?.length ?? 0
  const tags = bin.providerTags ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Link to={`/bins/${bin.id}`} className="hover:underline">
            {bin.name}
          </Link>
        </CardTitle>
        <CardDescription className="flex items-center gap-1">
          <MapPin className="size-3.5 shrink-0" />
          <Badge variant="secondary" className="font-normal">
            {bin.location}
          </Badge>
        </CardDescription>
      </CardHeader>
      {(bin.description || tags.length > 0) && (
        <CardContent className="space-y-2 pt-0">
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-[10px]">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          {bin.description && (
            <p className="text-xs text-muted-foreground">{bin.description}</p>
          )}
        </CardContent>
      )}
      <CardFooter className="justify-between border-t border-border pt-4">
        <span className="text-xs text-muted-foreground">
          {itemCount} {itemCount === 1 ? "supply" : "supplies"}
        </span>
        {canEdit && (
          <Button variant="ghost" size="icon-sm" asChild>
            <Link to={`/bins/${bin.id}/edit`} aria-label={`Edit ${bin.name}`}>
              <Pencil className="size-3.5" />
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
