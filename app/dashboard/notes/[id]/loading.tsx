import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function NoteLoading() {
  return (
    <div className="container mx-auto py-6">
      <Button variant="ghost" disabled className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Notes
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Medical Note</CardTitle>
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-20" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Note Content</h3>
                <Skeleton className="h-[300px] w-full" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Note Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Note ID</h3>
                  <Skeleton className="h-5 w-20 mt-1" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Patient</h3>
                  <Skeleton className="h-5 w-40 mt-1" />
                  <Skeleton className="h-4 w-24 mt-1" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Date</h3>
                  <Skeleton className="h-5 w-32 mt-1" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
                  <Skeleton className="h-5 w-36 mt-1" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <Skeleton className="h-6 w-24 mt-1" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Tags</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Doctor</h3>
                  <Skeleton className="h-5 w-40 mt-1" />
                  <Skeleton className="h-4 w-32 mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
