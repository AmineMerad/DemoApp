import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, Image,
  ActivityIndicator, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "expo-router";
import { authService } from "../../services/auth";
import Toast from "../../components/Toast";

export default function SettingsScreen() {
  const { user, logout, setUser } = useAuth();
  const router = useRouter();
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setUploadingImage(true);
      try {
        const updatedUser = await authService.updateProfile({
          avatar: result.assets[0].uri,
        });
        setUser(updatedUser);
        setToast({ message: "Profile image updated", type: "success" });
      } catch {
        setToast({ message: "Failed to update avatar", type: "error" });
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const saveName = async () => {
    if (!name.trim()) {
      setToast({ message: "Name cannot be empty", type: "error" });
      return;
    }
    setSaving(true);
    try {
      const updatedUser = await authService.updateProfile({ name: name.trim() });
      setUser(updatedUser);
      setToast({ message: "Name updated successfully", type: "success" });
    } catch {
      setToast({ message: "Failed to update name", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      <Toast
        visible={!!toast}
        message={toast?.message || ""}
        type={toast?.type || "success"}
        onHide={() => setToast(null)}
      />
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <Text className="font-montserrat font-bold text-2xl text-black dark:text-white mt-4 mb-8">
          Settings
        </Text>

        {/* Avatar Section */}
        <View className="items-center mb-8">
          <TouchableOpacity onPress={pickImage} disabled={uploadingImage} className="relative">
            {user?.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                className="w-24 h-24 rounded-full"
              />
            ) : (
              <View className="w-24 h-24 rounded-full bg-surface-container items-center justify-center">
                <MaterialCommunityIcons name="account" size={48} color="#3c4a44" />
              </View>
            )}
            <View className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary rounded-full items-center justify-center">
              <MaterialCommunityIcons name="camera" size={16} color="white" />
            </View>
          </TouchableOpacity>
          {uploadingImage && (
            <ActivityIndicator size="small" color="#16D1A6" style={{ marginTop: 8 }} />
          )}
          <Text className="font-montserrat text-sm text-gray-500 mt-2">
            {user?.email}
          </Text>
        </View>

        {/* Name Section */}
        <View className="mb-8">
          <Text className="font-montserrat font-semibold text-sm text-gray-500 dark:text-gray-400 mb-2">
            Full Name
          </Text>
          <TextInput
            className="bg-[#F5F5F5] dark:bg-gray-800 rounded-xl p-4 font-montserrat text-base text-black dark:text-white"
            placeholder="Your name"
            placeholderTextColor="#999"
            value={name}
            onChangeText={setName}
          />
          <TouchableOpacity
            className="bg-primary rounded-xl h-[50px] justify-center items-center mt-4"
            onPress={saveName}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="font-montserrat font-bold text-base text-white">
                Save Changes
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Account Info */}
        <View className="bg-surface-container-low dark:bg-gray-800 rounded-xl p-4 mb-8">
          <Text className="font-montserrat font-bold text-lg text-black dark:text-white mb-4">
            Account Info
          </Text>
          <View className="flex-row justify-between py-3 border-b border-gray-100 dark:border-gray-700">
            <Text className="font-montserrat text-sm text-gray-500">Email</Text>
            <Text className="font-montserrat text-sm text-black dark:text-white">
              {user?.email}
            </Text>
          </View>
          <View className="flex-row justify-between py-3 border-b border-gray-100 dark:border-gray-700">
            <Text className="font-montserrat text-sm text-gray-500">User ID</Text>
            <Text className="font-montserrat text-sm text-black dark:text-white">
              #{user?.id}
            </Text>
          </View>
          <View className="flex-row justify-between py-3">
            <Text className="font-montserrat text-sm text-gray-500">Member Since</Text>
            <Text className="font-montserrat text-sm text-black dark:text-white">
              --
            </Text>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          className="flex-row items-center justify-center gap-2 border border-red-400 rounded-xl h-[50px] mb-8"
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="logout" size={20} color="#ef4444" />
          <Text className="font-montserrat font-bold text-base text-red-500">
            Logout
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
