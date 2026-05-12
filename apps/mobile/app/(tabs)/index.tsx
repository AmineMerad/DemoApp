import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* TopAppBar */}
        <View className="flex-row justify-between items-center py-2">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-surface-container items-center justify-center overflow-hidden">
              <MaterialCommunityIcons name="account" size={24} color="#3c4a44" />
            </View>
            <View>
              <Text className="font-montserrat font-bold text-xl text-primary">
                Wasat
              </Text>
              {user && (
                <Text className="font-montserrat text-sm text-gray-500 dark:text-gray-400">
                  Welcome, {user.name}
                </Text>
              )}
            </View>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity className="w-10 h-10 rounded-full items-center justify-center">
              <MaterialCommunityIcons name="bell-outline" size={24} color="#16D1A6" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleLogout}
              className="w-10 h-10 rounded-full items-center justify-center"
            >
              <MaterialCommunityIcons name="logout" size={24} color="#16D1A6" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Portfolio Balance Hero */}
        <View className="items-center py-8">
          <Text className="font-montserrat text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2 tracking-wider">
            Total Portfolio Balance
          </Text>
          <Text className="font-montserrat font-bold text-4xl text-black dark:text-white mb-1">
            $124,500.00
          </Text>
          <View className="flex-row items-center gap-1 bg-primary/10 px-3 py-1 rounded-full mt-2">
            <MaterialCommunityIcons name="trending-up" size={16} color="#16D1A6" />
            <Text className="font-montserrat text-sm font-semibold text-primary">
              +$1,250.00 (1.02%) Today
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="flex-row gap-4 mb-6">
          <TouchableOpacity
            className="flex-1 bg-primary p-4 rounded-xl items-center gap-2"
            onPress={() => router.push("/deposit")}
          >
            <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
              <MaterialCommunityIcons name="download" size={24} color="white" />
            </View>
            <Text className="font-montserrat text-sm font-semibold text-white">
              Deposit
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-white dark:bg-surface-dark p-4 rounded-xl items-center gap-2 border border-outline-variant dark:border-gray-600"
            onPress={() => router.push("/withdraw")}
          >
            <View className="w-10 h-10 rounded-full bg-tertiary/10 items-center justify-center">
              <MaterialCommunityIcons name="upload" size={24} color="#005db7" />
            </View>
            <Text className="font-montserrat text-sm font-semibold text-black dark:text-white">
              Withdraw
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-white dark:bg-surface-dark p-4 rounded-xl items-center gap-2 border border-outline-variant dark:border-gray-600"
            onPress={() => router.push("/rebalance")}
          >
            <View className="w-10 h-10 rounded-full bg-secondary/10 items-center justify-center">
              <MaterialCommunityIcons name="sync" size={24} color="#8142a4" />
            </View>
            <Text className="font-montserrat text-sm font-semibold text-black dark:text-white">
              Rebalance
            </Text>
          </TouchableOpacity>
        </View>

        {/* Balance Cards */}
        <View className="flex-row gap-4 mb-6">
          <View className="flex-1 bg-surface-container-low dark:bg-surface-dark p-6 rounded-xl gap-2">
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center">
                <MaterialCommunityIcons name="chart-pie" size={18} color="#16D1A6" />
              </View>
              <Text className="font-montserrat text-sm text-gray-500 dark:text-gray-400">
                Invested Balance
              </Text>
            </View>
            <Text className="font-montserrat font-bold text-xl text-black dark:text-white">
              $112,050.00
            </Text>
            <View className="w-full h-1 bg-surface-container-high dark:bg-gray-600 rounded-full mt-2 overflow-hidden flex-row">
              <View className="bg-primary w-[40%] h-full" />
              <View className="bg-secondary w-[30%] h-full" />
              <View className="bg-tertiary w-[30%] h-full" />
            </View>
          </View>

          <View className="flex-1 bg-surface-container-low dark:bg-surface-dark p-6 rounded-xl gap-2">
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-full bg-surface-container-high dark:bg-gray-600 items-center justify-center">
                <MaterialCommunityIcons name="wallet" size={18} color="#3c4a44" />
              </View>
              <Text className="font-montserrat text-sm text-gray-500 dark:text-gray-400">
                Available Cash
              </Text>
            </View>
            <Text className="font-montserrat font-bold text-xl text-black dark:text-white">
              $12,450.00
            </Text>
            <View className="w-full h-1 bg-surface-container-high dark:bg-gray-600 rounded-full mt-2 overflow-hidden">
              <View className="bg-primary w-full h-full opacity-20" />
            </View>
          </View>
        </View>

        {/* Top Ethical Performers */}
        <View className="bg-surface-container-low dark:bg-surface-dark p-6 rounded-xl mb-8">
          <View className="flex-row justify-between items-start mb-4">
            <View className="flex-1">
              <Text className="font-montserrat font-bold text-xl text-black dark:text-white">
                Top Ethical Performers
              </Text>
              <Text className="font-montserrat text-sm text-gray-500 dark:text-gray-400 mt-1">
                Driving change this week.
              </Text>
            </View>
            <TouchableOpacity className="flex-row items-center gap-1">
              <Text className="font-montserrat text-sm font-semibold text-primary">
                View All
              </Text>
              <MaterialCommunityIcons name="chevron-right" size={16} color="#16D1A6" />
            </TouchableOpacity>
          </View>

          <View className="gap-4">
            <TouchableOpacity className="flex-row items-center justify-between p-3 rounded-lg">
              <View className="flex-row items-center gap-3 flex-1">
                <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center">
                  <MaterialCommunityIcons name="leaf" size={24} color="#16D1A6" />
                </View>
                <View>
                  <Text className="font-montserrat text-sm font-semibold text-black dark:text-white">
                    Green Energy Fund
                  </Text>
                  <View className="flex-row gap-1 mt-1">
                    <View className="px-2 py-0.5 bg-surface-container-high dark:bg-gray-600 rounded-full">
                      <Text className="font-montserrat text-xs font-semibold text-gray-500 dark:text-gray-400">
                        ESG
                      </Text>
                    </View>
                    <View className="px-2 py-0.5 bg-surface-container-high dark:bg-gray-600 rounded-full">
                      <Text className="font-montserrat text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Halal
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              <View className="items-end">
                <Text className="font-montserrat text-sm font-semibold text-black dark:text-white">
                  $34,200
                </Text>
                <Text className="font-montserrat text-sm font-semibold text-primary">
                  +2.4%
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center justify-between p-3 rounded-lg">
              <View className="flex-row items-center gap-3 flex-1">
                <View className="w-10 h-10 rounded-full bg-secondary/10 items-center justify-center">
                  <MaterialCommunityIcons name="handshake" size={24} color="#8142a4" />
                </View>
                <View>
                  <Text className="font-montserrat text-sm font-semibold text-black dark:text-white">
                    Fair Trade Tech
                  </Text>
                  <View className="flex-row gap-1 mt-1">
                    <View className="px-2 py-0.5 bg-surface-container-high dark:bg-gray-600 rounded-full">
                      <Text className="font-montserrat text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Low Carbon
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              <View className="items-end">
                <Text className="font-montserrat text-sm font-semibold text-black dark:text-white">
                  $18,450
                </Text>
                <Text className="font-montserrat text-sm font-semibold text-primary">
                  +1.1%
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
