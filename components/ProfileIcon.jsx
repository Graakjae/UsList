import React from "react";
import { View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

const ProfileIcon = ({ color = "#2B2B2B", size = 30, ...props }) => {
  return (
    <View {...props}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth="1.5" />
        <Path
          d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6"
          stroke={color}
          strokeWidth="1.5"
        />
      </Svg>
    </View>
  );
};

export default ProfileIcon;
