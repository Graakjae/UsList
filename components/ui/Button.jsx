import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { StyleSheet, Text, TouchableOpacity } from "react-native";

export default function Button({
  children,
  onPress,
  style,
  variant = "primary",
  textStyle,
  disabled = false,
  icon,
}) {
  const getButtonStyle = () => {
    const baseStyle = [styles.button];

    switch (variant) {
      case "primary":
        baseStyle.push(styles.primary);
        break;
      case "secondary":
        baseStyle.push(styles.secondary);
        break;
      case "delete":
        baseStyle.push(styles.delete);
        break;
      default:
        baseStyle.push(styles.primary);
    }

    if (disabled) {
      baseStyle.push(styles.disabled);
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseTextStyle = [styles.buttonText];

    switch (variant) {
      case "primary":
        baseTextStyle.push(styles.primaryText);
        break;
      case "secondary":
        baseTextStyle.push(styles.secondaryText);
        break;
      case "delete":
        baseTextStyle.push(styles.deleteText);
        break;
      default:
        baseTextStyle.push(styles.primaryText);
    }

    if (disabled) {
      baseTextStyle.push(styles.disabledText);
    }

    return baseTextStyle;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[...getButtonStyle(), style]}
      disabled={disabled}
    >
      {typeof children === "string" ? (
        <Text style={[...getTextStyle(), textStyle]}>{children}</Text>
      ) : (
        children
      )}
      {icon && (
        <FontAwesomeIcon
          icon={icon}
          size={16}
          style={[...getTextStyle(), textStyle]}
        />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: "100%",
    flexDirection: "row",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  primary: {
    backgroundColor: "#FFC0CB",
  },
  secondary: {
    backgroundColor: "#f0f0f0",
  },
  delete: {
    backgroundColor: "#F44336",
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "Nunito-Bold",
    fontWeight: "500",
  },
  primaryText: {
    color: "#000",
  },
  secondaryText: {
    color: "#333",
  },
  deleteText: {
    color: "#fff",
  },
  disabledText: {
    opacity: 0.6,
  },
});
