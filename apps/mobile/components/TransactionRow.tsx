import { View, Text, TouchableOpacity } from "react-native";

export type TransactionType = "deposit" | "withdrawal" | "rebalance";

export interface Transaction {
  id: string;
  type: TransactionType;
  title: string;
  description: string;
  date: string;
  amount?: string;
}

interface TransactionRowProps {
  transaction: Transaction;
  onPress?: (transaction: Transaction) => void;
}

const iconMap = {
  deposit: { emoji: "📥", bg: "bg-primary/10" },
  withdrawal: { emoji: "📤", bg: "bg-tertiary/10" },
  rebalance: { emoji: "🔄", bg: "bg-secondary/10" },
};

export function TransactionRow({ transaction, onPress }: TransactionRowProps) {
  const { emoji, bg } = iconMap[transaction.type];

  return (
    <TouchableOpacity
      className={`rounded-xl p-4 flex flex-row items-center gap-4 bg-surface-container-lowest dark:bg-surface-dark mb-4 border border-outline-variant/30 dark:border-gray-700`}
      onPress={() => onPress?.(transaction)}
      activeOpacity={0.7}
    >
      <View className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center flex-shrink-0`}>
        <Text className="text-lg">{emoji}</Text>
      </View>
      <View className="flex-1">
        <View className="flex flex-row justify-between items-start mb-1">
          <Text className="font-headline-md text-headline-md text-on-surface dark:text-white">
            {transaction.title}
          </Text>
          {transaction.amount && (
            <Text className={`font-body-md text-body-md ${transaction.type === "withdrawal" ? "text-tertiary" : "text-primary"}`}>
              {transaction.amount}
            </Text>
          )}
        </View>
        <Text className="font-body-md text-secondary dark:text-gray-400">
          {transaction.description}
        </Text>
      </View>
      <View className="text-right">
        <Text className="font-body-md text-on-surface-variant dark:text-gray-400 text-sm">
          {transaction.date}
        </Text>
      </View>
    </TouchableOpacity>
  );
}