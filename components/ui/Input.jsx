import React, { useState } from "react";
import { StyleSheet, TextInput } from "react-native";

export default function Input({
  value,
  onChangeText,
  placeholder,
  onSubmitEditing,
  blurOnSubmit = false,
  returnKeyType = "done",
  editable = true,
  autoFocus = false,
  autoCapitalize = "none",
  style,
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <TextInput
      style={[
        styles.input,
        !editable && styles.disabledInput,
        isFocused && editable && styles.inputFocused,
        style,
      ]}
      value={value}
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
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
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
});
