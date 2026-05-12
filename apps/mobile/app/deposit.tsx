import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface DepositDetailsProps {
  transactionId?: string;
  amount?: string;
  date?: string;
  time?: string;
  fromAccount?: string;
  toAccount?: string;
  fee?: string;
  status?: "completed" | "pending" | "failed";
}

export default function DepositScreen(props: DepositDetailsProps) {
  const router = useRouter();

  const {
    transactionId = "WST-9827364",
    amount = "$500.00",
    date = "Today",
    time = "10:42 AM",
    fromAccount = "Cash Account",
    toAccount = "Investment Portfolio",
    fee = "$0.00",
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

  const handleBackToHome = () => {
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
          Deposit
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-6 pb-12"
        contentContainerClassName="items-center"
        showsVerticalScrollIndicator={false}
      >
        {/* Status & Amount */}
        <View className="items-center mb-8 w-full">
          <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-4">
            <MaterialCommunityIcons name="check-circle" size={32} color="#16D1A6" />
          </View>
          <View className="bg-primary/20 px-3 py-1 rounded-full mb-1">
            <Text className="font-montserrat text-xs font-semibold text-primary">
              {status === "completed" ? "Completed" : status === "pending" ? "Pending" : "Failed"}
            </Text>
          </View>
          <Text className="font-montserrat text-sm text-gray-500 dark:text-gray-400 mb-6">
            {date}, {time}
          </Text>
          <Text className="font-montserrat font-bold text-3xl text-black dark:text-white mb-1 tracking-tight">
            {amount}
          </Text>
          <Text className="font-montserrat text-sm text-gray-500 dark:text-gray-400">
            Successfully deposited
          </Text>
        </View>

        {/* Details Card */}
        <View className="w-full bg-surface dark:bg-surface-dark rounded-xl border border-outline-variant dark:border-gray-600 p-4 mb-8">
          <View className="flex-row justify-between items-center py-2 border-b border-surface-container dark:border-gray-600">
            <Text className="font-montserrat text-sm text-gray-500 dark:text-gray-400">
              Transaction ID
            </Text>
            <Text className="font-montserrat text-sm text-black dark:text-white font-semibold">
              {transactionId}
            </Text>
          </View>
          <View className="flex-row justify-between items-center py-2 border-b border-surface-container dark:border-gray-600">
            <Text className="font-montserrat text-sm text-gray-500 dark:text-gray-400">
              From
            </Text>
            <View className="flex-row items-center gap-2">
              <MaterialCommunityIcons name="bank" size={18} color="#3c4a44" />
              <Text className="font-montserrat text-sm text-black dark:text-white font-semibold">
                {fromAccount}
              </Text>
            </View>
          </View>
          <View className="flex-row justify-between items-center py-2 border-b border-surface-container dark:border-gray-600">
            <Text className="font-montserrat text-sm text-gray-500 dark:text-gray-400">
              To
            </Text>
            <View className="flex-row items-center gap-2">
              <MaterialCommunityIcons name="wallet" size={18} color="#3c4a44" />
              <Text className="font-montserrat text-sm text-black dark:text-white font-semibold">
                {toAccount}
              </Text>
            </View>
          </View>
          <View className="flex-row justify-between items-center py-2">
            <Text className="font-montserrat text-sm text-gray-500 dark:text-gray-400">
              Fee
            </Text>
            <Text className="font-montserrat text-sm text-black dark:text-white font-semibold">
              {fee}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View className="w-full gap-4">
          <TouchableOpacity
            onPress={handleViewReceipt}
            className="w-full h-12 bg-primary rounded-lg flex-row items-center justify-center gap-2"
          >
            <MaterialCommunityIcons name="file-document" size={20} color="white" />
            <Text className="font-montserrat text-sm font-semibold text-white">
              View Receipt
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleBackToHome}
            className="w-full h-12 bg-transparent rounded-lg border border-outline-variant dark:border-gray-600 flex-row items-center justify-center"
          >
            <Text className="font-montserrat text-sm font-semibold text-primary">
              Back to Home
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
