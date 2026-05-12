import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface StatusBadgeProps {
  status: "completed" | "pending" | "failed";
  children: React.ReactNode;
}

export function StatusBadge({ status, children }: StatusBadgeProps) {
  const statusColors = {
    completed: "bg-primary/20 text-primary",
    pending: "bg-tertiary-container text-tertiary",
    failed: "bg-error-container text-error",
  };

  return (
    <View className={`inline-flex items-center px-3 py-1 rounded-full ${statusColors[status]}`}>
      <Text className="font-label-md text-label-md">{children}</Text>
    </View>
  );
}