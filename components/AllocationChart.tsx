import { View, Text } from "react-native";

export interface AllocationItem {
  name: string;
  ticker: string;
  percentage: number;
  color: "primary" | "secondary" | "tertiary";
  icon: string;
}

interface AllocationChartProps {
  items: AllocationItem[];
}

const colorClasses = {
  primary: { bg: "bg-primary/10", bar: "bg-primary" },
  secondary: { bg: "bg-secondary/10", bar: "bg-secondary" },
  tertiary: { bg: "bg-tertiary/10", bar: "bg-tertiary" },
};

export function AllocationChart({ items }: AllocationChartProps) {
  return (
    <View className="flex flex-col gap-3">
      <Text className="font-headline-sm text-headline-sm text-on-surface dark:text-white border-b border-surface-variant pb-2">
        Target Allocation
      </Text>
      {items.map((item) => (
        <View
          key={item.ticker}
          className="flex flex-col gap-3 p-4 bg-surface-container-lowest dark:bg-surface-dark rounded-xl border border-outline-variant/30"
        >
          <View className="flex flex-row justify-between items-center">
            <View className="flex flex-row items-center gap-3">
              <View className={`w-10 h-10 rounded-full ${colorClasses[item.color].bg} flex items-center justify-center`}>
                <Text className="text-lg">{item.icon}</Text>
              </View>
              <View>
                <Text className="font-body-lg text-on-surface dark:text-white font-semibold">
                  {item.name}
                </Text>
                <Text className="font-label-md text-secondary dark:text-gray-400">
                  {item.ticker}
                </Text>
              </View>
            </View>
            <Text className="font-body-lg text-on-surface dark:text-white font-semibold">
              {item.percentage}%
            </Text>
          </View>
          <View className="w-full h-1.5 bg-surface-container dark:bg-gray-700 rounded-full overflow-hidden">
            <View
              className={`h-full ${colorClasses[item.color].bar} rounded-full`}
              style={{ width: `${item.percentage}%` }}
            />
          </View>
        </View>
      ))}
    </View>
  );
}