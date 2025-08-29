import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, isToday, isFuture } from "date-fns";
import { useHistoricalData } from "@/hooks/useHistoricalData";
import { CheckCircle2, Calendar as CalendarIcon, Trophy, Target, Scroll } from "lucide-react";
import { calculateLevel, calculateCoins } from "@/utils/gameLogic";

export function HistoryView() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { completedQuests, journalEntry, loading } = useHistoricalData(selectedDate);

  const totalXP = completedQuests.reduce((sum, quest) => sum + quest.xp, 0);
  const totalCoins = calculateCoins(totalXP);
  const isViewingToday = isToday(selectedDate);
  const isViewingFuture = isFuture(selectedDate);

  const categoryColors = {
    Health: "bg-green-500/10 text-green-700 dark:text-green-400",
    Wealth: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
    Relationships: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Quest History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-[350px_1fr] gap-6">
            <div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                disabled={(date) => isFuture(date) && !isToday(date)}
                className="rounded-md border"
              />
            </div>

            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                  {isViewingToday && (
                    <Badge variant="default" className="ml-2">Today</Badge>
                  )}
                </h3>
                
                {isViewingFuture && !isViewingToday ? (
                  <p className="text-muted-foreground">
                    Future dates are not available for viewing.
                  </p>
                ) : loading ? (
                  <p className="text-muted-foreground">Loading...</p>
                ) : (
                  <Tabs defaultValue="quests" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="quests">Quests</TabsTrigger>
                      <TabsTrigger value="stats">Stats</TabsTrigger>
                      <TabsTrigger value="journal">Journal</TabsTrigger>
                    </TabsList>

                    <TabsContent value="quests" className="space-y-4">
                      {completedQuests.length === 0 ? (
                        <p className="text-muted-foreground py-8 text-center">
                          No quests completed on this day.
                        </p>
                      ) : (
                        <ScrollArea className="h-[400px] pr-4">
                          <div className="space-y-2">
                            {completedQuests.map((quest) => (
                              <div
                                key={quest.id}
                                className="flex items-center justify-between p-3 rounded-lg border bg-card"
                              >
                                <div className="flex items-center gap-3">
                                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                                  <div>
                                    <p className="font-medium">{quest.title}</p>
                                    <div className="flex gap-2 mt-1">
                                      <Badge
                                        variant="secondary"
                                        className={categoryColors[quest.category]}
                                      >
                                        {quest.category}
                                      </Badge>
                                      <Badge variant="outline">
                                        {quest.xp} XP
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </TabsContent>

                    <TabsContent value="stats" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4 text-primary" />
                              <p className="text-sm font-medium">Quests Completed</p>
                            </div>
                            <p className="text-2xl font-bold mt-2">
                              {completedQuests.length}
                            </p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="pt-6">
                            <div className="flex items-center gap-2">
                              <Trophy className="h-4 w-4 text-primary" />
                              <p className="text-sm font-medium">XP Earned</p>
                            </div>
                            <p className="text-2xl font-bold mt-2">{totalXP}</p>
                          </CardContent>
                        </Card>
                      </div>

                      <Card>
                        <CardContent className="pt-6">
                          <p className="text-sm font-medium mb-3">Category Breakdown</p>
                          {["Health", "Wealth", "Relationships"].map((category) => {
                            const categoryQuests = completedQuests.filter(
                              (q) => q.category === category
                            );
                            const categoryXP = categoryQuests.reduce(
                              (sum, q) => sum + q.xp,
                              0
                            );
                            return (
                              <div key={category} className="flex justify-between py-2">
                                <span className="text-sm">{category}</span>
                                <div className="flex gap-2">
                                  <Badge variant="outline">
                                    {categoryQuests.length} quests
                                  </Badge>
                                  <Badge variant="secondary">{categoryXP} XP</Badge>
                                </div>
                              </div>
                            );
                          })}
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="journal" className="space-y-4">
                      {journalEntry.notes || journalEntry.affirmation ? (
                        <div className="space-y-4">
                          {journalEntry.notes && (
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                  <Scroll className="h-4 w-4" />
                                  Notes
                                </CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm whitespace-pre-wrap">
                                  {journalEntry.notes}
                                </p>
                              </CardContent>
                            </Card>
                          )}
                          
                          {journalEntry.affirmation && (
                            <Card>
                              <CardHeader>
                                <CardTitle className="text-base">Affirmation</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <p className="text-sm italic">"{journalEntry.affirmation}"</p>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      ) : (
                        <p className="text-muted-foreground py-8 text-center">
                          No journal entries for this day.
                        </p>
                      )}
                    </TabsContent>
                  </Tabs>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}