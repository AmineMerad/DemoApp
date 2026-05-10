import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type HistoryTransactionType = "deposit" | "withdrawal" | "rebalance";

interface HistoryTransaction {
  id: string;
  type: HistoryTransactionType;
  title: string;
  description: string;
  date: string;
}

type FilterKey = "all" | HistoryTransactionType;

const iconConfig = {
  deposit: { icon: "arrow-down" as const, bg: "bg-primary/10", color: "#16D1A6" },
  withdrawal: { icon: "arrow-up" as const, bg: "bg-tertiary/10", color: "#005db7" },
  rebalance: { icon: "sync" as const, bg: "bg-secondary/10", color: "#8142a4" },
};

const filters: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "deposit", label: "Deposits" },
  { key: "withdrawal", label: "Withdrawals" },
  { key: "rebalance", label: "Rebalances" },
];

const transactions: HistoryTransaction[] = [
  { id: "1", type: "rebalance", title: "Rebalance", description: "Realign investments to their target weights", date: "08 Feb 2024" },
  { id: "2", type: "deposit", title: "Deposit", description: "All-In Market Cap (USD) $1000", date: "07 Feb 2024" },
  { id: "3", type: "withdrawal", title: "Withdrawal", description: "BTC $500", date: "25 Jan 2024" },
  { id: "4", type: "deposit", title: "Deposit", description: "All-In Market Cap (USD) $1000", date: "25 Jan 2024" },
  { id: "5", type: "rebalance", title: "Rebalance", description: "Realign investments to their target weights", date: "24 Jan 2024" },
];

function TransactionCard({ transaction }: { transaction: HistoryTransaction }) {
  const config = iconConfig[transaction.type];

  return (
    <TouchableOpacity
      className="bg-surface-container-low dark:bg-surface-dark rounded-xl p-6 flex-row items-start gap-4"
      activeOpacity={0.7}
    >
      <View className={`w-10 h-10 rounded-full ${config.bg} items-center justify-center flex-shrink-0`}>
        <MaterialCommunityIcons name={config.icon} size={24} color={config.color} />
      </View>
      <View className="flex-1">
        <View className="flex-row justify-between items-start mb-1">
          <Text className="font-montserrat font-bold text-xl text-black dark:text-white">
            {transaction.title}
          </Text>
          <Text className="font-montserrat text-sm text-gray-500 dark:text-gray-400">
            {transaction.date}
          </Text>
        </View>
        <Text className="font-montserrat text-sm text-gray-500 dark:text-gray-400">
          {transaction.description}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      className={`px-4 py-2 rounded-full ${active ? "bg-primary" : "bg-surface-container-low dark:bg-surface-dark"}`}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text className={`font-montserrat text-xs font-semibold ${active ? "text-white" : "text-gray-500 dark:text-gray-400"}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function HistoryTabScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const filteredTransactions = activeFilter === "all"
    ? transactions
    : transactions.filter((t) => t.type === activeFilter);

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {/* TopAppBar */}
        <View className="flex-row justify-between items-center py-2 mb-6">
          <View className="flex-row items-center gap-4">
            <View className="w-10 h-10 rounded-full bg-surface-container items-center justify-center overflow-hidden">
              <MaterialCommunityIcons name="account" size={24} color="#3c4a44" />
            </View>
            <Text className="font-montserrat font-bold text-xl text-primary">
              Wasat
            </Text>
          </View>
          <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center">
            <MaterialCommunityIcons name="bell-outline" size={24} color="#3c4a44" />
          </TouchableOpacity>
        </View>

        {/* HISTORY Heading */}
        <Text className="font-montserrat font-bold text-3xl text-black dark:text-white mb-6">
          HISTORY
        </Text>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="pb-4 mb-4">
          <View className="flex-row gap-2">
            {filters.map((filter) => (
              <FilterChip
                key={filter.key}
                label={filter.label}
                active={activeFilter === filter.key}
                onPress={() => setActiveFilter(filter.key)}
              />
            ))}
          </View>
        </ScrollView>

        {/* Transaction List */}
        <View className="gap-4 pb-8">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((t) => (
              <TransactionCard key={t.id} transaction={t} />
            ))
          ) : (
            <View className="items-center py-12">
              <Text className="font-montserrat text-sm text-gray-500 dark:text-gray-400">
                No transactions found
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
