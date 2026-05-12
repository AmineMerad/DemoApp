import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface AllocationItem {
  name: string;
  percentage: number;
  color: "primary" | "secondary" | "tertiary";
  icon: string;
}

interface RebalanceDetailsProps {
  date?: string;
  time?: string;
  description?: string;
  allocations?: AllocationItem[];
  status?: "completed" | "pending" | "failed";
}

const defaultAllocations: AllocationItem[] = [
  { name: "US ETF", percentage: 20, color: "primary", icon: "earth" },
  { name: "Europe ETF", percentage: 30, color: "secondary", icon: "bank" },
  { name: "Tech ETF", percentage: 50, color: "tertiary", icon: "memory" },
];

const colorConfig = {
  primary: { bg: "bg-primary/10", bar: "bg-primary", text: "text-primary" },
  secondary: { bg: "bg-secondary/10", bar: "bg-secondary", text: "text-secondary" },
  tertiary: { bg: "bg-tertiary/10", bar: "bg-tertiary", text: "text-tertiary" },
};

function AllocationCard({ item }: { item: AllocationItem }) {
  const colors = colorConfig[item.color];

  return (
    <View className="bg-white dark:bg-surface-dark rounded-xl border border-outline-variant/40 dark:border-gray-600 p-4 flex-col gap-3">
      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center gap-3">
          <View className={`w-8 h-8 rounded-full ${colors.bg} items-center justify-center`}>
            <MaterialCommunityIcons
              name={item.icon as any}
              size={16}
              color={item.color === "primary" ? "#16D1A6" : item.color === "secondary" ? "#8142a4" : "#005db7"}
            />
          </View>
          <Text className="font-montserrat font-semibold text-base text-black dark:text-white">
            {item.name}
          </Text>
        </View>
        <Text className="font-montserrat font-bold text-xl text-black dark:text-white">
          {item.percentage}%
        </Text>
      </View>
      <View className="w-full h-1.5 bg-surface-container dark:bg-gray-700 rounded-full overflow-hidden">
        <View
          className={`h-full rounded-full ${colors.bar}`}
          style={{ width: `${item.percentage}%` }}
        />
      </View>
    </View>
  );
}

export default function RebalanceScreen(props: RebalanceDetailsProps) {
  const router = useRouter();

  const {
    date = "Monday, 08 February 2024",
    time = "03:45 PM",
    description = "Realign investments to their target weights.",
    allocations = defaultAllocations,
    status = "completed",
  } = props;

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };

  const handleViewReceipt = () => {
    console.log("View Receipt");
  };

  const handleOk = () => {
    router.push("/");
  };

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 h-14">
        <TouchableOpacity
          onPress={handleBack}
          className="w-11 h-11 items-center justify-center"
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#191c1e" />
        </TouchableOpacity>
        <Text className="font-montserrat font-semibold text-xl text-black dark:text-white flex-1 text-center pr-11">
          Rebalance
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-4 pb-32"
        showsVerticalScrollIndicator={false}
      >
        {/* Success Graphic */}
        <View className="items-center pb-6">
          <View className="w-[72px] h-[72px] rounded-full bg-primary/10 items-center justify-center mb-6 relative">
            <View className="absolute inset-0 rounded-full border border-primary/20" style={{ transform: [{ scale: 1.15 }] }} />
            <MaterialCommunityIcons name="check-circle" size={40} color="#16D1A6" />
          </View>
          <Text className="font-montserrat font-bold text-3xl text-black dark:text-white text-center mb-4 tracking-tight">
            Rebalance
          </Text>
          <View className="bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20 flex-row items-center gap-1.5">
            <View className="w-1.5 h-1.5 rounded-full bg-primary" />
            <Text className="font-montserrat text-xs font-semibold text-primary uppercase tracking-widest">
              {status === "completed" ? "Completed" : status === "pending" ? "Pending" : "Failed"}
            </Text>
          </View>
        </View>

        {/* Content Area */}
        <View className="flex-col gap-6">
          {/* Context Card */}
          <View className="bg-surface-container-low dark:bg-surface-dark rounded-xl p-6 flex-col gap-3">
            <View className="flex-row items-center gap-2">
              <MaterialCommunityIcons name="calendar" size={18} color="#3c4a44" />
              <Text className="font-montserrat text-sm text-gray-500 dark:text-gray-400">
                {date}, {time}
              </Text>
            </View>
            <View className="w-full h-px bg-outline-variant/30 dark:bg-gray-600" />
            <View className="flex-row items-start gap-3 mt-1">
              <MaterialCommunityIcons name="trending-up" size={20} color="#16D1A6" style={{ marginTop: 2 }} />
              <Text className="font-montserrat text-base text-black dark:text-white flex-1">
                {description}
              </Text>
            </View>
          </View>

          {/* Target Allocations */}
          <View className="flex-col gap-4">
            <Text className="font-montserrat text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">
              Target Allocations
            </Text>
            {allocations.map((item) => (
              <AllocationCard key={item.name} item={item} />
            ))}
          </View>

          {/* View Receipt */}
          <View className="items-center mt-2">
            <TouchableOpacity
              onPress={handleViewReceipt}
              className="flex-row items-center gap-2 px-4 py-2"
            >
              <MaterialCommunityIcons name="file-document" size={20} color="#16D1A6" />
              <Text className="font-montserrat text-xs font-semibold text-primary">
                View Receipt
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Fixed OK Button */}
      <View className="absolute bottom-0 left-0 right-0 bg-background dark:bg-background-dark px-4 pb-6 pt-4">
        <TouchableOpacity
          onPress={handleOk}
          className="w-full bg-primary py-4 rounded-full items-center justify-center"
        >
          <Text className="font-montserrat text-sm font-semibold text-white uppercase tracking-widest">
            OK
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
