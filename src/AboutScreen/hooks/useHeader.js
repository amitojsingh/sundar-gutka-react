import React, { useEffect } from "react";
import { Icon } from "@rneui/themed";
import colors from "../../common/colors";
import styles from "../styles";

const useHeader = (navigation) => {
  const { WHITE_COLOR } = colors;
  const { headerTitleStyle, headerStyle } = styles;
  const { goBack } = navigation;
  const headerLeft = () => (
    <Icon name="arrow-back" size={30} onPress={() => goBack()} color={WHITE_COLOR} />
  );
  useEffect(() => {
    navigation.setOptions({
      headerTitleStyle,
      headerStyle,
      headerLeft,
    });
  }, []);
};
export default useHeader;