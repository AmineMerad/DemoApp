import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace("/(tabs)");
    } catch (error: any) {
      const message = error.response?.data?.error || "Login failed. Please try again.";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white justify-center px-6">
      <Text className="font-montserrat font-bold text-[40px] text-center text-primary mb-12">
        wasat
      </Text>

      <View className="mb-4">
        <TextInput
          className={`bg-[#F5F5F5] rounded-xl p-4 font-montserrat text-base ${
            errors.email ? "border border-red-500" : ""
          }`}
          placeholder="Email"
          placeholderTextColor="#999"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
        />
        {errors.email && (
          <Text className="text-red-500 font-montserrat text-xs mt-1 ml-1">
            {errors.email}
          </Text>
        )}
      </View>

      <View className="mb-4">
        <TextInput
          className={`bg-[#F5F5F5] rounded-xl p-4 font-montserrat text-base ${
            errors.password ? "border border-red-500" : ""
          }`}
          placeholder="Password"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
          }}
        />
        {errors.password && (
          <Text className="text-red-500 font-montserrat text-xs mt-1 ml-1">
            {errors.password}
          </Text>
        )}
      </View>

      <TouchableOpacity
        className="bg-primary rounded-xl h-[50px] justify-center items-center mt-6"
        onPress={handleLogin}
        disabled={loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="font-montserrat font-bold text-base text-white">
            Login
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/(auth)/register")} className="mt-4">
        <Text className="font-montserrat font-medium text-sm text-primary text-center">
          Don't have an account? Register
        </Text>
      </TouchableOpacity>
    </View>
  );
}
