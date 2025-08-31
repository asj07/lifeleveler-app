import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Coins, IndianRupee, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface ShopProps {
  coins: number;
  onCoinsUpdate: (coins: number) => void;
}

interface Redemption {
  id: string;
  coins_redeemed: number;
  amount_inr: number;
  status: string;
  payment_method: string | null;
  created_at: string;
  processed_at: string | null;
  notes: string | null;
}

export function Shop({ coins, onCoinsUpdate }: ShopProps) {
  const [redeemAmount, setRedeemAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const { toast } = useToast();

  const conversionRate = 100; // 100 coins = ₹1
  const minRedemption = 500; // Minimum 500 coins (₹5)
  const maxRedemption = Math.floor(coins / conversionRate) * conversionRate;
  const rupeeValue = redeemAmount ? parseInt(redeemAmount) / conversionRate : 0;

  useEffect(() => {
    fetchRedemptions();
  }, []);

  const fetchRedemptions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("redemptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setRedemptions(data);
    }
  };

  const handleRedeem = async () => {
    const coinsToRedeem = parseInt(redeemAmount);
    
    if (!coinsToRedeem || coinsToRedeem < minRedemption) {
      toast({
        title: "Invalid amount",
        description: `Minimum redemption is ${minRedemption} coins (₹${minRedemption / conversionRate})`,
        variant: "destructive",
      });
      return;
    }

    if (coinsToRedeem > coins) {
      toast({
        title: "Insufficient coins",
        description: "You don't have enough coins for this redemption",
        variant: "destructive",
      });
      return;
    }

    if (coinsToRedeem % conversionRate !== 0) {
      toast({
        title: "Invalid amount",
        description: `Amount must be in multiples of ${conversionRate} coins`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to redeem coins",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("redemptions").insert({
      user_id: user.id,
      coins_redeemed: coinsToRedeem,
      amount_inr: rupeeValue,
      payment_method: null,
      payment_details: null,
    });

    if (error) {
      toast({
        title: "Redemption failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      // Update local coins
      onCoinsUpdate(coins - coinsToRedeem);
      
      // Update user stats in database
      await supabase
        .from("user_stats")
        .update({ coins: coins - coinsToRedeem })
        .eq("user_id", user.id);

      toast({
        title: "Redemption request submitted!",
        description: `Your request for ₹${rupeeValue} has been submitted. Processing typically takes 1-2 business days.`,
      });

      // Reset form
      setRedeemAmount("");
      fetchRedemptions();
    }

    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "processing":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "processing":
        return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      case "rejected":
        return "bg-red-500/10 text-red-700 dark:text-red-400";
      default:
        return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Coin Shop
        </CardTitle>
        <CardDescription>
          Redeem your coins for real money. Conversion rate: 100 coins = ₹1
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="redeem" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="redeem">Redeem Coins</TabsTrigger>
            <TabsTrigger value="history">Redemption History</TabsTrigger>
          </TabsList>

          <TabsContent value="redeem" className="space-y-6">
            <div className="bg-primary/5 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available Balance</p>
                  <p className="text-3xl font-bold flex items-center gap-2">
                    <Coins className="h-6 w-6" />
                    {coins.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Redeemable Value</p>
                  <p className="text-2xl font-bold flex items-center gap-1">
                    <IndianRupee className="h-5 w-5" />
                    {(coins / conversionRate).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="redeem-amount">Coins to Redeem</Label>
                <Input
                  id="redeem-amount"
                  type="number"
                  placeholder={`Minimum ${minRedemption} coins`}
                  value={redeemAmount}
                  onChange={(e) => setRedeemAmount(e.target.value)}
                  min={minRedemption}
                  max={maxRedemption}
                  step={conversionRate}
                />
                {redeemAmount && (
                  <p className="text-sm text-muted-foreground mt-1">
                    = ₹{rupeeValue.toFixed(2)}
                  </p>
                )}
              </div>

              <Button
                onClick={handleRedeem}
                disabled={loading || !redeemAmount || coins < minRedemption}
                className="w-full"
              >
                {loading ? "Processing..." : `Redeem ₹${rupeeValue.toFixed(2)}`}
              </Button>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Minimum redemption: {minRedemption} coins (₹{minRedemption / conversionRate})</p>
                <p>• Processing time: 1-2 business days</p>
                <p>• Redemptions are processed manually and subject to verification</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {redemptions.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No redemption history yet
              </p>
            ) : (
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {redemptions.map((redemption) => (
                    <Card key={redemption.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(redemption.status)}
                              <Badge className={getStatusColor(redemption.status)}>
                                {redemption.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="font-medium">
                                {redemption.coins_redeemed} coins
                              </span>
                              <span className="text-muted-foreground">→</span>
                              <span className="font-bold text-green-600 dark:text-green-400">
                                ₹{redemption.amount_inr}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(redemption.created_at), "PPp")}
                            </p>
                            {redemption.notes && (
                              <p className="text-xs text-muted-foreground">
                                Note: {redemption.notes}
                              </p>
                            )}
                          </div>
                          <div className="text-right text-xs text-muted-foreground">
                            {redemption.payment_method}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}