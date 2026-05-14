import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { tradingApi } from "../../services/trading";

type FilterKey = "all" | "buy" | "sell";

const filters: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "buy", label: "Buys" },
  { key: "sell", label: "Sells" },
];

export default function HistoryTabScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const filterParam = activeFilter !== "all" ? activeFilter : undefined;
      const res = await tradingApi.getOrders(filterParam);
      setOrders(res.data || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-center py-2 mb-6">
          <View className="flex-row items-center gap-4">
            <View className="w-10 h-10 rounded-full bg-surface-container items-center justify-center overflow-hidden">
              <MaterialCommunityIcons name="account" size={24} color="#3c4a44" />
            </View>
            <Text className="font-montserrat font-bold text-xl text-primary">Wasat</Text>
          </View>
        </View>

        <Text className="font-montserrat font-bold text-3xl text-black dark:text-white mb-6">HISTORY</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-4 mb-4">
          <View className="flex-row gap-2">
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter.key}
                className={`px-4 py-2 rounded-full ${activeFilter === filter.key ? "bg-primary" : "bg-surface-container-low dark:bg-surface-dark"}`}
                onPress={() => setActiveFilter(filter.key)}
              >
                <Text className={`font-montserrat text-xs font-semibold ${activeFilter === filter.key ? "text-white" : "text-gray-500 dark:text-gray-400"}`}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {loading ? (
          <View className="items-center py-12">
            <ActivityIndicator size="large" color="#16D1A6" />
          </View>
        ) : orders.length === 0 ? (
          <View className="items-center py-12">
            <MaterialCommunityIcons name="history" size={48} color="#6b7a74" />
            <Text className="font-montserrat text-sm text-gray-500 mt-3">No orders yet</Text>
          </View>
        ) : (
          <View className="gap-4 pb-8">
            {orders.map((order: any) => (
              <View
                key={order.id}
                className="bg-surface-container-low dark:bg-surface-dark rounded-xl p-6 flex-row items-start gap-4"
              >
                <View className={`w-10 h-10 rounded-full ${order.side === "buy" ? "bg-primary/10" : "bg-red-500/10"} items-center justify-center flex-shrink-0`}>
                  <MaterialCommunityIcons
                    name={order.side === "buy" ? "arrow-down" : "arrow-up"}
                    size={24}
                    color={order.side === "buy" ? "#16D1A6" : "#ef4444"}
                  />
                </View>
                <View className="flex-1">
                  <View className="flex-row justify-between items-start mb-1">
                    <Text className="font-montserrat font-bold text-xl text-black dark:text-white">
                      {order.side === "buy" ? "Buy" : "Sell"} {order.symbol}
                    </Text>
                    <Text className="font-montserrat text-xs text-gray-500">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString() : ""}
                    </Text>
                  </View>
                  <View className="flex-row gap-3 mt-1">
                    <Text className="font-montserrat text-sm text-gray-500">
                      {order.filled_qty ? `${order.filled_qty} shares` : order.notional ? `$${order.notional}` : ""}
                    </Text>
                    {order.filled_avg_price && (
                      <Text className="font-montserrat text-sm text-gray-500">
                        @ ${order.filled_avg_price}
                      </Text>
                    )}
                  </View>
                  <View className="flex-row items-center mt-2">
                    <View className={`px-2 py-0.5 rounded-full ${order.status === "filled" ? "bg-primary/20" : order.status === "accepted" ? "bg-yellow-500/20" : "bg-red-500/20"}`}>
                      <Text className={`font-montserrat text-xs font-semibold ${order.status === "filled" ? "text-primary" : order.status === "accepted" ? "text-yellow-600" : "text-red-500"}`}>
                        {order.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
