import React, { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

export default function Input({
  value,
  onChangeText,
  placeholder,
  onSubmitEditing,
  blurOnSubmit = false,
  returnKeyType = "done",
  editable = true,
  autoFocus = false,
  autoCapitalize = "sentences",
  style,
  maxLength,
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={[
          styles.input,
          !editable && styles.disabledInput,
          isFocused && editable && styles.inputFocused,
          style,
        ]}
        value={value || ""}
        onChangeText={onChangeText}
        placeholder={placeholder}
        onSubmitEditing={onSubmitEditing}
        blurOnSubmit={blurOnSubmit}
        returnKeyType={returnKeyType}
        editable={editable}
        autoFocus={autoFocus}
        autoCapitalize={autoCapitalize}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        maxLength={maxLength}
        {...props}
      />

      {value && value.length > maxLength - 10 && (
        <Text style={styles.charCounterInInput}>
          {(value || "").length} / {maxLength}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 10,
    position: "relative",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    paddingRight: 58,
    fontFamily: "Nunito-Regular",
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 10,
  },
  disabledInput: {
    backgroundColor: "#f0f0f0",
    color: "#666",
    opacity: 0.5,
  },
  inputFocused: {
    borderColor: "#FFC0CB",
  },
  charCounterInInput: {
    position: "absolute",
    right: 12,
    top: 16,
    fontSize: 12,
    fontFamily: "Nunito-Regular",
    color: "#999",
    backgroundColor: "transparent",
  },
});
