import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Keyboard, Text, TouchableOpacity, View } from "react-native";
import { useSelectorContext } from "./SelectorContext";

const Selector = ({
  label,
  value,
  options,
  onSelect,
  placeholder,
  style,
  buttonStyle,
  textStyle,
  dropdownStyle,
  optionStyle,
  optionTextStyle,
  id,
}) => {
  const { t } = useTranslation();
  const { openSelector, closeSelector, isSelectorOpen, openSelectorId } =
    useSelectorContext();
  const [isOpen, setIsOpen] = useState(false);

  // Close this selector if another one opens
  useEffect(() => {
    if (openSelectorId !== null && openSelectorId !== id && isOpen) {
      setIsOpen(false);
    }
  }, [openSelectorId, id, isOpen]);

  const handleToggle = () => {
    Keyboard.dismiss();
    if (isOpen) {
      closeSelector();
      setIsOpen(false);
    } else {
      openSelector(id);
      setIsOpen(true);
    }
  };

  const handleSelect = (option) => {
    onSelect(option);
    closeSelector();
    setIsOpen(false);
  };

  const getDisplayValue = () => {
    if (!value) return placeholder || t("shopping.noSelection");
    const selectedOption = options.find((opt) => opt.key === value);
    return selectedOption ? selectedOption.label : value;
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.button, isOpen && styles.buttonFocused, buttonStyle]}
        onPress={handleToggle}
        activeOpacity={0.7}
      >
        <Text
          style={[styles.buttonText, textStyle]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {getDisplayValue()}
        </Text>
      </TouchableOpacity>

      {isOpen && (
        <View style={[styles.dropdown, dropdownStyle]}>
          <FlatList
            data={options}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.option, optionStyle]}
                onPress={() => handleSelect(item)}
                activeOpacity={0.7}
              >
                <Text style={[styles.optionText, optionTextStyle]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}
    </View>
  );
};

const styles = {
  container: {
    marginBottom: 10,
    position: "relative",
  },
  label: {
    fontSize: 14,
    color: "#333",
    fontFamily: "Nunito-Bold",
    marginBottom: 8,
  },
  button: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontFamily: "Nunito-Medium",
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 10,
    minHeight: 48,
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    fontFamily: "Nunito-Medium",
    color: "#333",
  },
  buttonFocused: {
    borderColor: "#FFC0CB",
  },
  dropdown: {
    position: "absolute",
    top: "90%",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  option: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f4",
  },
  optionText: {
    fontSize: 14,
    fontFamily: "Nunito-Medium",
    color: "#333",
  },
};

export default Selector;
