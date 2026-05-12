import { View, Text } from "react-native";

interface InfoRowProps {
  label: string;
  value: string | React.ReactNode;
  showBorder?: boolean;
  icon?: React.ReactNode;
}

export function InfoRow({ label, value, showBorder = true, icon }: InfoRowProps) {
  return (
    <View className={`flex-row justify-between items-center py-4 ${showBorder ? "border-b border-outline-variant dark:border-gray-700" : ""}`}>
      <Text className="text-body-md text-secondary dark:text-gray-400">{label}</Text>
      {typeof value === "string" ? (
        <View className="flex-row items-center gap-2">
          {icon}
          <Text className="text-body-md text-on-surface dark:text-white font-semibold">
            {value}
          </Text>
        </View>
      ) : (
        <View className="flex-row items-center gap-2">{value}</View>
      )}
    </View>
  );
}