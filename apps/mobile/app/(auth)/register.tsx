import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const EMAIL_REGEX = /\S+@\S+\.\S+/;

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!EMAIL_REGEX.test(email.trim())) {
      newErrors.email = "Enter a valid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await register(email.trim(), password, name.trim());
      router.replace("/(tabs)");
    } catch (error: any) {
      const message =
        error.response?.data?.error || "Registration failed. Please try again.";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white px-6">
      <TouchableOpacity
        onPress={() => router.back()}
        className="absolute top-10 left-4 z-10 w-11 h-11 items-center justify-center"
      >
        <Ionicons name="arrow-back" size={24} color="#333" />
      </TouchableOpacity>

      <View className="flex-1 justify-center">
        <Text className="font-montserrat font-bold text-[40px] text-center text-primary mb-12">
          wasat
        </Text>

        <View className="mb-3">
          <TextInput
            className={`bg-[#F5F5F5] rounded-xl p-4 font-montserrat text-base ${
              errors.name ? "border border-red-500" : ""
            }`}
            placeholder="Full Name"
            placeholderTextColor="#999"
            autoCapitalize="words"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
            }}
          />
          {errors.name && (
            <Text className="text-red-500 font-montserrat text-xs mt-1 ml-1">
              {errors.name}
            </Text>
          )}
        </View>

        <View className="mb-3">
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

        <View className="mb-3">
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

        <View className="mb-3">
          <TextInput
            className={`bg-[#F5F5F5] rounded-xl p-4 font-montserrat text-base ${
              errors.confirmPassword ? "border border-red-500" : ""
            }`}
            placeholder="Confirm Password"
            placeholderTextColor="#999"
            secureTextEntry
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword)
                setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
            }}
          />
          {errors.confirmPassword && (
            <Text className="text-red-500 font-montserrat text-xs mt-1 ml-1">
              {errors.confirmPassword}
            </Text>
          )}
        </View>

        <TouchableOpacity
          className="bg-primary rounded-xl h-[50px] justify-center items-center mt-4"
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="font-montserrat font-bold text-base text-white">
              Register
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/(auth)/login")}
          className="mt-4 mb-8"
        >
          <Text className="font-montserrat font-medium text-sm text-primary text-center">
            Already have an account? Login
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
