import { useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface ToastProps {
  visible: boolean;
  message: string;
  type?: "success" | "error";
  onHide: () => void;
  duration?: number;
}

export default function Toast({
  visible,
  message,
  type = "success",
  onHide,
  duration = 2500,
}: ToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 15,
        stiffness: 200,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(translateY, {
          toValue: -100,
          duration: 200,
          useNativeDriver: true,
        }).start(() => onHide());
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  const bg = type === "success" ? "bg-[#16D1A6]" : "bg-red-500";
  const icon = type === "success" ? "check-circle" : "alert-circle";

  return (
    <Animated.View
      className={`absolute top-16 left-4 right-4 z-50 ${bg} rounded-xl px-4 py-3.5 flex-row items-center gap-3 shadow-lg`}
      style={{ transform: [{ translateY }] }}
    >
      <MaterialCommunityIcons name={icon} size={20} color="white" />
      <Text className="font-montserrat font-semibold text-sm text-white flex-1">
        {message}
      </Text>
    </Animated.View>
  );
}
