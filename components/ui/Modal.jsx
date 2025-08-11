import React from "react";
import {
  Modal as RNModal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Modal({
  visible,
  onClose,
  title,
  children,
  buttons = [],
  animationType = "fade",
  transparent = true,
  onRequestClose,
  contentStyle,
  overlayStyle,
}) {
  return (
    <RNModal
      visible={visible}
      animationType={animationType}
      transparent={transparent}
      onRequestClose={onRequestClose || onClose}
    >
      <TouchableOpacity
        style={[styles.overlay, overlayStyle]}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          style={[styles.container, contentStyle]}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
          {title && <Text style={styles.title}>{title}</Text>}

          <View style={styles.content}>{children}</View>

          {buttons.length > 0 && (
            <View style={styles.buttonContainer}>
              {buttons.map((button, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.button,
                    button.style,
                    buttons.length > 1 && styles.buttonWithMargin,
                  ]}
                  onPress={button.onPress}
                  disabled={button.disabled}
                >
                  <Text style={[styles.buttonText, button.textStyle]}>
                    {button.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 20,
  },
  container: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontFamily: "Baloo2-Bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  content: {
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonWithMargin: {
    marginHorizontal: 5,
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "Baloo2-Bold",
    color: "#333",
  },
});
