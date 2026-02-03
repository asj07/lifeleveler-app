import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Medal, Award, Crown, Flame } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  weekly_xp: number;
  rank: number;
  tier: "A" | "B" | "C" | "D" | "E";
}

const tierConfig = {
  A: { label: "A", color: "bg-amber-500 text-amber-950", description: "Top 10%" },
  B: { label: "B", color: "bg-slate-400 text-slate-900", description: "Top 30%" },
  C: { label: "C", color: "bg-blue-500 text-blue-50", description: "Top 60%" },
  D: { label: "D", color: "bg-slate-500 text-slate-100", description: "Top 85%" },
  E: { label: "E", color: "bg-red-500 text-red-50", description: "Bottom 15%" },
};

const calculateTier = (rank: number, total: number): "A" | "B" | "C" | "D" | "E" => {
  if (total === 0) return "E";
  const percentile = (rank / total) * 100;
  if (percentile <= 10) return "A";
  if (percentile <= 30) return "B";
  if (percentile <= 60) return "C";
  if (percentile <= 85) return "D";
  return "E";
};

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Crown className="h-5 w-5 text-amber-500" />;
    case 2:
      return <Medal className="h-5 w-5 text-slate-400" />;
    case 3:
      return <Award className="h-5 w-5 text-amber-700" />;
    default:
      return <span className="text-muted-foreground font-mono">{rank}</span>;
  }
};

interface CurrentUserRank {
  display_name: string;
  avatar_url: string | null;
  weekly_xp: number;
  rank: number;
  tier: "A" | "B" | "C" | "D" | "E";
  isOnLeaderboard: boolean;
}

export const Leaderboard = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRank, setCurrentUserRank] = useState<CurrentUserRank | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUserId(user?.id || null);

        // Fetch leaderboard data
        const { data, error: fetchError } = await supabase.rpc("get_weekly_leaderboard");

        if (fetchError) throw fetchError;

        const total = data?.length || 0;
        const entriesWithTier: LeaderboardEntry[] = (data || []).map((entry: any) => ({
          ...entry,
          tier: calculateTier(entry.rank, total),
        }));

        setEntries(entriesWithTier);

        // Check if current user is on leaderboard
        if (user) {
          const userEntry = entriesWithTier.find(e => e.user_id === user.id);
          
          if (userEntry) {
            setCurrentUserRank({
              display_name: userEntry.display_name,
              avatar_url: userEntry.avatar_url,
              weekly_xp: userEntry.weekly_xp,
              rank: userEntry.rank,
              tier: userEntry.tier,
              isOnLeaderboard: true,
            });
          } else {
            // User not on leaderboard - fetch their profile to show rank
            const { data: profile } = await supabase
              .from("profiles")
              .select("display_name, avatar_url")
              .eq("user_id", user.id)
              .maybeSingle();

            if (profile) {
              // User has 0 XP this week, rank would be after all leaderboard entries
              setCurrentUserRank({
                display_name: profile.display_name || "Anonymous",
                avatar_url: profile.avatar_url,
                weekly_xp: 0,
                rank: total + 1,
                tier: "E",
                isOnLeaderboard: false,
              });
            }
          }
        }
      } catch (err: any) {
        console.error("Leaderboard fetch error:", err);
        setError(err.message || "Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Weekly Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Weekly Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-destructive">
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 text-sm underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (entries.length === 0) {
    return (
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            Weekly Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Flame className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No XP earned this week yet!</p>
            <p className="text-sm mt-2">Complete quests to appear on the leaderboard</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          Weekly Leaderboard
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Resets every Sunday at 23:59 IST
        </p>
      </CardHeader>
      <CardContent>
        {/* Top 3 Podium - Desktop */}
        {entries.length >= 3 && (
          <div className="hidden md:flex justify-center items-end gap-4 mb-8 pb-6 border-b">
            {/* 2nd Place */}
            <div className="flex flex-col items-center animate-slide-up" style={{ animationDelay: "100ms" }}>
              <Avatar className="h-16 w-16 border-4 border-slate-400 ring-2 ring-slate-300/30">
                <AvatarImage src={entries[1].avatar_url || undefined} />
                <AvatarFallback>{entries[1].display_name[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <Medal className="h-6 w-6 text-slate-400 mt-2" />
              <p className="font-semibold text-sm mt-1 max-w-[100px] truncate">{entries[1].display_name}</p>
              <p className="text-xs text-muted-foreground">{entries[1].weekly_xp} XP</p>
              <div className="h-16 w-20 bg-slate-400/20 rounded-t-lg mt-2" />
            </div>
            
            {/* 1st Place */}
            <div className="flex flex-col items-center animate-slide-up" style={{ animationDelay: "0ms" }}>
              <Avatar className="h-20 w-20 border-4 border-amber-500 ring-4 ring-amber-400/30">
                <AvatarImage src={entries[0].avatar_url || undefined} />
                <AvatarFallback>{entries[0].display_name[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <Crown className="h-7 w-7 text-amber-500 mt-2" />
              <p className="font-bold text-base mt-1 max-w-[120px] truncate">{entries[0].display_name}</p>
              <p className="text-sm text-muted-foreground">{entries[0].weekly_xp} XP</p>
              <div className="h-24 w-24 bg-amber-500/20 rounded-t-lg mt-2" />
            </div>
            
            {/* 3rd Place */}
            <div className="flex flex-col items-center animate-slide-up" style={{ animationDelay: "200ms" }}>
              <Avatar className="h-14 w-14 border-4 border-amber-700 ring-2 ring-amber-600/30">
                <AvatarImage src={entries[2].avatar_url || undefined} />
                <AvatarFallback>{entries[2].display_name[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <Award className="h-5 w-5 text-amber-700 mt-2" />
              <p className="font-semibold text-sm mt-1 max-w-[100px] truncate">{entries[2].display_name}</p>
              <p className="text-xs text-muted-foreground">{entries[2].weekly_xp} XP</p>
              <div className="h-12 w-16 bg-amber-700/20 rounded-t-lg mt-2" />
            </div>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Rank</TableHead>
                <TableHead>Player</TableHead>
                <TableHead className="text-right w-[100px]">Weekly XP</TableHead>
                <TableHead className="text-center w-[80px]">Tier</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => {
                const isCurrentUser = entry.user_id === currentUserId;
                const isTopThree = entry.rank <= 3;
                
                return (
                  <TableRow
                    key={entry.user_id}
                    className={`
                      transition-all duration-200 
                      ${isCurrentUser ? "bg-primary/10 hover:bg-primary/15" : "hover:bg-muted/50"}
                      ${isTopThree ? "font-medium" : ""}
                    `}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center justify-center w-8 h-8">
                        {getRankIcon(entry.rank)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className={`h-8 w-8 ${isTopThree ? "ring-2 ring-primary/30" : ""}`}>
                          <AvatarImage src={entry.avatar_url || undefined} />
                          <AvatarFallback className="text-xs">
                            {entry.display_name[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className={`truncate max-w-[150px] sm:max-w-[200px] ${isCurrentUser ? "text-primary font-semibold" : ""}`}>
                          {entry.display_name}
                          {isCurrentUser && <span className="text-xs ml-2 opacity-70">(You)</span>}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`font-mono ${isTopThree ? "text-primary font-bold" : ""}`}>
                        {entry.weekly_xp.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={`${tierConfig[entry.tier].color} font-bold px-3`}>
                        {tierConfig[entry.tier].label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Current User Ranking (if not on leaderboard) */}
        {currentUserRank && !currentUserRank.isOnLeaderboard && (
          <div className="mt-6 pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-3 font-medium">Your Ranking</p>
            <div className="flex items-center gap-4 p-3 rounded-lg bg-primary/10 border border-primary/20">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted font-mono text-lg font-bold">
                {currentUserRank.rank}
              </div>
              <Avatar className="h-10 w-10">
                <AvatarImage src={currentUserRank.avatar_url || undefined} />
                <AvatarFallback>{currentUserRank.display_name[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-primary truncate">
                  {currentUserRank.display_name} <span className="text-xs opacity-70">(You)</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {currentUserRank.weekly_xp === 0 
                    ? "No XP earned this week - complete quests to rank up!" 
                    : `${currentUserRank.weekly_xp.toLocaleString()} XP`}
                </p>
              </div>
              <Badge className={`${tierConfig[currentUserRank.tier].color} font-bold px-3`}>
                {currentUserRank.tier}
              </Badge>
            </div>
          </div>
        )}

        {/* Tier Legend */}
        <div className="mt-6 pt-4 border-t">
          <p className="text-xs text-muted-foreground mb-2 font-medium">Tier System</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(tierConfig) as Array<keyof typeof tierConfig>).map((tier) => (
              <div key={tier} className="flex items-center gap-1.5 text-xs">
                <Badge className={`${tierConfig[tier].color} font-bold px-2 py-0`}>
                  {tier}
                </Badge>
                <span className="text-muted-foreground">{tierConfig[tier].description}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
