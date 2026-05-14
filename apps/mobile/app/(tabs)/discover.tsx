import { useState, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { tradingApi } from "../../services/trading";

type Asset = {
  symbol: string;
  name: string;
  asset_class: string;
  tradable: boolean;
};

type Quotes = Record<string, { symbol: string; bid: number | null; ask: number | null }>;

export default function DiscoverScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [quotes, setQuotes] = useState<Quotes>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const typeMap: Record<string, string> = { all: "", stock: "stock", etf: "etf", crypto: "crypto" };
      const res = await tradingApi.getAssets({
        search: search || undefined,
        type: typeMap[filter] || undefined,
      });
      setAssets(res.data);
    } catch (e: any) {
      setError(e.message || "Failed to load assets");
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

  useEffect(() => {
    fetchAssets();
  }, [filter]);

  useEffect(() => {
    const timer = setTimeout(() => fetchAssets(), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (assets.length > 0) {
      const symbols = assets.map((a) => a.symbol).slice(0, 20);
      tradingApi.getQuotes(symbols).then((res) => setQuotes(res.data)).catch(() => {});
    }
  }, [assets]);

  const quickAssets = ["AAPL", "NVDA", "MSFT", "GOOGL", "AMZN", "SPY", "QQQ", "TSLA"];

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
      <View className="px-4 py-2">
        <Text className="font-montserrat font-bold text-2xl text-black dark:text-white">
          Discover
        </Text>
        <Text className="font-montserrat text-sm text-gray-500 dark:text-gray-400 mt-1">
          Stocks, ETFs & crypto
        </Text>
      </View>

      <View className="px-4 py-3">
        <View className="flex-row items-center bg-surface-container-low dark:bg-gray-800 rounded-xl px-4 h-12">
          <MaterialCommunityIcons name="magnify" size={20} color="#6b7a74" />
          <TextInput
            className="flex-1 ml-3 font-montserrat text-base text-black dark:text-white"
            placeholder="Search by symbol or name"
            placeholderTextColor="#6b7a74"
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch("")}>
              <MaterialCommunityIcons name="close-circle" size={20} color="#6b7a74" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View className="flex-row px-4 gap-2 mb-4">
        {["all", "stock", "etf"].map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            className={`px-4 py-2 rounded-full ${filter === f ? "bg-primary" : "bg-surface-container-low dark:bg-gray-800"}`}
          >
            <Text className={`font-montserrat text-sm font-semibold ${filter === f ? "text-white" : "text-gray-600 dark:text-gray-300"}`}>
              {f === "all" ? "All" : f === "stock" ? "Stocks" : "ETFs"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {!search && !loading && (
        <View className="px-4 mb-4">
          <Text className="font-montserrat font-semibold text-sm text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
            Popular
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-3">
            {quickAssets.map((sym) => {
              const q = quotes[sym];
              return (
                <TouchableOpacity
                  key={sym}
                  onPress={() => router.push({ pathname: "/buy", params: { symbol: sym } })}
                  className="bg-surface dark:bg-gray-800 rounded-xl px-5 py-4 mr-3 border border-outline-variant/40"
                >
                  <Text className="font-montserrat font-bold text-lg text-black dark:text-white">{sym}</Text>
                  <Text className="font-montserrat text-sm text-gray-500 mt-1">
                    {q?.ask ? `$${q.ask.toFixed(2)}` : "—"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#16D1A6" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-4">
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#ef4444" />
          <Text className="font-montserrat text-sm text-red-500 mt-3 text-center">{error}</Text>
          <TouchableOpacity onPress={fetchAssets} className="mt-4 bg-primary px-6 py-3 rounded-xl">
            <Text className="font-montserrat font-semibold text-white">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {assets.length === 0 ? (
            <View className="items-center py-12">
              <MaterialCommunityIcons name="file-search-outline" size={48} color="#6b7a74" />
              <Text className="font-montserrat text-sm text-gray-500 mt-3">No results found</Text>
            </View>
          ) : (
            assets.map((asset) => {
              const q = quotes[asset.symbol];
              return (
                <TouchableOpacity
                  key={asset.symbol}
                  onPress={() => router.push({ pathname: "/buy", params: { symbol: asset.symbol } })}
                  className="flex-row items-center py-4 border-b border-outline-variant/20"
                >
                  <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
                    <Text className="font-montserrat font-bold text-sm text-primary">
                      {asset.symbol.slice(0, 2)}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-montserrat font-semibold text-sm text-black dark:text-white">
                      {asset.symbol}
                    </Text>
                    <Text className="font-montserrat text-xs text-gray-500 mt-0.5" numberOfLines={1}>
                      {asset.name}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="font-montserrat font-semibold text-sm text-black dark:text-white">
                      {q?.ask ? `$${q.ask.toFixed(2)}` : "—"}
                    </Text>
                    <Text className="font-montserrat text-xs text-gray-500 mt-0.5">
                      {q?.bid ? `Bid $${q.bid.toFixed(2)}` : ""}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
