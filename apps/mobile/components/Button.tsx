import { Text, TouchableOpacity } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  icon,
  fullWidth = true,
}: ButtonProps) {
  const variantStyles = {
    primary: "bg-primary text-white",
    secondary: "bg-secondary text-white",
    outline: "bg-transparent border border-outline text-primary",
  };

  return (
    <TouchableOpacity
      className={`h-12 rounded-lg font-button text-button flex items-center justify-center gap-2 ${variantStyles[variant]} ${fullWidth ? "w-full" : ""}`}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {icon}
      <Text className="font-button text-button">{title}</Text>
    </TouchableOpacity>
  );
}