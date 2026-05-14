import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { tradingApi } from "../services/trading";

export default function BuyScreen() {
  const router = useRouter();
  const { symbol: paramSymbol } = useLocalSearchParams<{ symbol: string }>();
  const symbol = (paramSymbol || "").toUpperCase();

  const [amount, setAmount] = useState("100");
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<{ bid: number; ask: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [orderResult, setOrderResult] = useState<any>(null);

  useEffect(() => {
    if (symbol) {
      setLoading(true);
      tradingApi.getQuotes([symbol])
        .then((res) => {
          const q = res.data?.[symbol];
          if (q) setQuote(q);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [symbol]);

  const handleBuy = async () => {
    const notional = parseFloat(amount);
    if (isNaN(notional) || notional <= 0) {
      Alert.alert("Invalid amount", "Enter a valid dollar amount.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await tradingApi.submitOrder({
        symbol,
        side: "buy",
        notional,
      });
      setOrderResult(res.data);
      setDone(true);
    } catch (e: any) {
      const msg = e.response?.data?.error || e.message || "Order failed";
      Alert.alert("Order Failed", msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    const estShares = orderResult?.filled_qty
      ? parseFloat(orderResult.filled_qty).toFixed(4)
      : amount && quote?.ask
        ? (parseFloat(amount) / quote.ask).toFixed(4)
        : "—";

    return (
      <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-6">
            <MaterialCommunityIcons name="check-circle" size={48} color="#16D1A6" />
          </View>
          <Text className="font-montserrat font-bold text-2xl text-black dark:text-white mb-2">
            Order Submitted
          </Text>
          <View className="bg-primary/20 px-4 py-1 rounded-full mb-4">
            <Text className="font-montserrat text-xs font-semibold text-primary uppercase tracking-wider">
              {orderResult?.status || "Accepted"}
            </Text>
          </View>
          <Text className="font-montserrat font-bold text-4xl text-black dark:text-white mb-1">
            ${amount}
          </Text>
          <Text className="font-montserrat text-base text-gray-500 dark:text-gray-400 mb-6">
            Buying {symbol}
          </Text>

          <View className="w-full bg-surface-container-low dark:bg-gray-800 rounded-xl p-5 mb-8">
            <View className="flex-row justify-between py-2 border-b border-outline-variant/20">
              <Text className="font-montserrat text-sm text-gray-500">Estimated shares</Text>
              <Text className="font-montserrat font-semibold text-sm text-black dark:text-white">{estShares}</Text>
            </View>
            <View className="flex-row justify-between py-2">
              <Text className="font-montserrat text-sm text-gray-500">Order ID</Text>
              <Text className="font-montserrat font-semibold text-xs text-black dark:text-white" numberOfLines={1}>
                {orderResult?.alpaca_order_id || "—"}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/(tabs)")}
            className="w-full bg-primary py-4 rounded-xl items-center"
          >
            <Text className="font-montserrat font-semibold text-white">Back to Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
      <View className="flex-row items-center px-4 h-14">
        <TouchableOpacity onPress={() => router.back()} className="w-11 h-11 items-center justify-center">
          <MaterialCommunityIcons name="arrow-left" size={24} color="#191c1e" />
        </TouchableOpacity>
        <Text className="font-montserrat font-semibold text-xl text-black dark:text-white flex-1 text-center pr-11">
          Buy
        </Text>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="items-center py-8">
          <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4">
            <Text className="font-montserrat font-bold text-xl text-primary">{symbol.slice(0, 2)}</Text>
          </View>
          <Text className="font-montserrat font-bold text-3xl text-black dark:text-white mb-1">{symbol}</Text>
          {loading ? (
            <ActivityIndicator size="small" color="#16D1A6" />
          ) : (
            <Text className="font-montserrat text-lg text-gray-500">
              {quote?.ask ? `$${quote.ask.toFixed(2)}` : "Loading price..."}
            </Text>
          )}
        </View>

        <View className="bg-surface-container-low dark:bg-gray-800 rounded-xl p-6 mb-6">
          <Text className="font-montserrat text-sm font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">
            Dollar Amount
          </Text>
          <View className="flex-row items-center border-b border-outline-variant/30 pb-2">
            <Text className="font-montserrat font-bold text-2xl text-black dark:text-white mr-2">$</Text>
            <TextInput
              className="flex-1 font-montserrat font-bold text-3xl text-black dark:text-white"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="100"
              placeholderTextColor="#6b7a74"
            />
          </View>
          {quote?.ask && (
            <Text className="font-montserrat text-sm text-gray-500 mt-3">
              Est. {parseFloat(amount) > 0 ? (parseFloat(amount) / quote.ask).toFixed(4) : "0"} shares
            </Text>
          )}
        </View>

        <TouchableOpacity
          onPress={handleBuy}
          disabled={submitting}
          className={`w-full py-4 rounded-xl items-center ${submitting ? "bg-primary/50" : "bg-primary"}`}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="font-montserrat font-semibold text-white text-lg">
              Buy ${amount || "0"} of {symbol}
            </Text>
          )}
        </TouchableOpacity>

        <Text className="font-montserrat text-xs text-gray-400 text-center mt-4 mb-8">
          Paper trading • No real money involved
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
