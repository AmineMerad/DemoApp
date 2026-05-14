import { useState, useEffect, useCallback } from "react";
import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import { tradingApi } from "../../services/trading";

type AccountData = {
  buying_power: number;
  cash: number;
  portfolio_value: number;
  equity: number;
  status: string;
};

type Position = {
  symbol: string;
  qty: number;
  market_value: number;
  cost_basis: number;
  unrealized_pl: number;
  unrealized_plpc: number;
  current_price: number;
  avg_entry_price: number;
  change_today: number;
};

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [account, setAccount] = useState<AccountData | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [acctRes, posRes] = await Promise.all([
        tradingApi.getAccount(),
        tradingApi.getPositions(),
      ]);
      setAccount(acctRes.data);
      setPositions(posRes.data || []);
    } catch (e) {
      console.log("Failed to fetch trading data", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  const totalMarketValue = positions.reduce((s, p) => s + p.market_value, 0);
  const totalPL = positions.reduce((s, p) => s + p.unrealized_pl, 0);
  const totalPLpc = totalMarketValue > 0
    ? (totalPL / (totalMarketValue - totalPL)) * 100
    : 0;

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#16D1A6" />}
      >
        {/* TopAppBar */}
        <View className="flex-row justify-between items-center py-2">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-surface-container items-center justify-center overflow-hidden">
              <MaterialCommunityIcons name="account" size={24} color="#3c4a44" />
            </View>
            <View>
              <Text className="font-montserrat font-bold text-xl text-primary">Wasat</Text>
              {user && (
                <Text className="font-montserrat text-sm text-gray-500 dark:text-gray-400">
                  Welcome, {user.name}
                </Text>
              )}
            </View>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={handleLogout}
              className="w-10 h-10 rounded-full items-center justify-center"
            >
              <MaterialCommunityIcons name="logout" size={24} color="#16D1A6" />
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View className="items-center py-20">
            <ActivityIndicator size="large" color="#16D1A6" />
          </View>
        ) : account ? (
          <>
            {/* Portfolio Balance Hero */}
            <View className="items-center py-8">
              <Text className="font-montserrat text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 tracking-wider">
                Total Portfolio Value
              </Text>
              <Text className="font-montserrat font-bold text-4xl text-black dark:text-white mb-1">
                ${account.portfolio_value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </Text>
              {totalPL !== 0 && (
                <View className="flex-row items-center gap-1 bg-primary/10 px-3 py-1 rounded-full mt-2">
                  <MaterialCommunityIcons
                    name={totalPL >= 0 ? "trending-up" : "trending-down"}
                    size={16}
                    color={totalPL >= 0 ? "#16D1A6" : "#ef4444"}
                  />
                  <Text className={`font-montserrat text-sm font-semibold ${totalPL >= 0 ? "text-primary" : "text-red-500"}`}>
                    {totalPL >= 0 ? "+" : ""}${totalPL.toFixed(2)} ({totalPLpc >= 0 ? "+" : ""}{totalPLpc.toFixed(2)}%)
                  </Text>
                </View>
              )}
            </View>

            {/* Quick Actions */}
            <View className="flex-row gap-4 mb-6">
              <TouchableOpacity
                className="flex-1 bg-primary p-4 rounded-xl items-center gap-2"
                onPress={() => router.push("/(tabs)/discover")}
              >
                <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
                  <MaterialCommunityIcons name="trending-up" size={24} color="white" />
                </View>
                <Text className="font-montserrat text-sm font-semibold text-white">Buy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-white dark:bg-surface-dark p-4 rounded-xl items-center gap-2 border border-outline-variant dark:border-gray-600"
                onPress={() => router.push("/(tabs)/history")}
              >
                <View className="w-10 h-10 rounded-full bg-tertiary/10 items-center justify-center">
                  <MaterialCommunityIcons name="history" size={24} color="#005db7" />
                </View>
                <Text className="font-montserrat text-sm font-semibold text-black dark:text-white">History</Text>
              </TouchableOpacity>
            </View>

            {/* Balance Cards */}
            <View className="flex-row gap-4 mb-6">
              <View className="flex-1 bg-surface-container-low dark:bg-surface-dark p-6 rounded-xl gap-2">
                <View className="flex-row items-center gap-2">
                  <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
                    <MaterialCommunityIcons name="chart-pie" size={18} color="#16D1A6" />
                  </View>
                  <Text className="font-montserrat text-sm text-gray-500 dark:text-gray-400">Invested</Text>
                </View>
                <Text className="font-montserrat font-bold text-xl text-black dark:text-white">
                  ${totalMarketValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </Text>
              </View>
              <View className="flex-1 bg-surface-container-low dark:bg-surface-dark p-6 rounded-xl gap-2">
                <View className="flex-row items-center gap-2">
                  <View className="w-8 h-8 rounded-full bg-surface-container-high dark:bg-gray-600 items-center justify-center">
                    <MaterialCommunityIcons name="wallet" size={18} color="#3c4a44" />
                  </View>
                  <Text className="font-montserrat text-sm text-gray-500 dark:text-gray-400">Cash</Text>
                </View>
                <Text className="font-montserrat font-bold text-xl text-black dark:text-white">
                  ${account.cash.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </Text>
              </View>
            </View>

            {/* Positions */}
            <View className="bg-surface-container-low dark:bg-surface-dark p-6 rounded-xl mb-8">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="font-montserrat font-bold text-xl text-black dark:text-white">Positions</Text>
                <Text className="font-montserrat text-sm text-gray-500 dark:text-gray-400">{positions.length} holdings</Text>
              </View>

              {positions.length === 0 ? (
                <View className="items-center py-8">
                  <MaterialCommunityIcons name="briefcase-outline" size={40} color="#6b7a74" />
                  <Text className="font-montserrat text-sm text-gray-500 mt-3 text-center">
                    No positions yet
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push("/(tabs)/discover")}
                    className="mt-4 bg-primary px-6 py-3 rounded-xl"
                  >
                    <Text className="font-montserrat font-semibold text-white text-sm">Start Investing</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                positions.map((p) => (
                  <TouchableOpacity
                    key={p.symbol}
                    className="flex-row items-center justify-between py-3 border-b border-outline-variant/20"
                  >
                    <View className="flex-row items-center gap-3 flex-1">
                      <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                        <Text className="font-montserrat font-bold text-xs text-primary">{p.symbol.slice(0, 2)}</Text>
                      </View>
                      <View>
                        <Text className="font-montserrat text-sm font-semibold text-black dark:text-white">{p.symbol}</Text>
                        <Text className="font-montserrat text-xs text-gray-500">{p.qty} shares</Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <Text className="font-montserrat text-sm font-semibold text-black dark:text-white">
                        ${p.market_value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </Text>
                      <Text className={`font-montserrat text-xs font-semibold ${p.unrealized_pl >= 0 ? "text-primary" : "text-red-500"}`}>
                        {p.unrealized_pl >= 0 ? "+" : ""}${p.unrealized_pl.toFixed(2)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </>
        ) : (
          <View className="items-center py-20">
            <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#ef4444" />
            <Text className="font-montserrat text-sm text-red-500 mt-3 text-center">
              Could not load data. Pull down to retry.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
