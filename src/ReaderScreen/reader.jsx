import { useDispatch, useSelector } from "react-redux";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { View, StatusBar, ScrollView, ActivityIndicator } from "react-native";
import PropTypes from "prop-types";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import colors from "../common/colors";
import constant from "../common/constant";
import { setBookmarkPosition, setPosition } from "../common/actions";
import ShabadItem from "./components/shabadItem";
import AutoScrollComponent from "./components/autoScrollComponent";
import Header from "./components/header";
import { useFetchShabad, usePagination } from "./utils/hooks";

function Reader({ navigation, route }) {
  const readerRef = useRef(null);

  const { isNightMode, bookmarkPosition, isAutoScroll, isStatusBar, savePosition } = useSelector(
    (state) => state
  );
  const [shabadID] = useState(Number(route.params.params.id));
  const [rowHeights, setRowHeights] = useState([]);
  const [itemsCount, setItemsCount] = useState(50);
  const [scrollPosition, setScrollPosition] = useState(0);
  const dispatch = useDispatch();
  const { shabad, isLoading } = useFetchShabad(shabadID);
  const { currentPage, handleScroll } = usePagination(shabad, itemsCount);

  const handleBackPress = useCallback(() => navigation.goBack(), [navigation]);
  const handleBookmarkPress = useCallback(() => {
    navigation.navigate("Bookmarks", { id: shabadID });
  }, [navigation, shabadID]);
  const handleSettingsPress = useCallback(
    () => navigation.navigate(constant.SETTINGS),
    [navigation]
  );

  useEffect(() => {
    if (!savePosition[shabadID]) {
      dispatch(setPosition(position, shabadID));
    }
  }, [handleBackPress]);

  const scrollToPosition = () => {
    if (currentPage && currentPage.length > 0) {
      setTimeout(() => {
        readerRef.current?.scrollTo({ y: 100, animated: true });
      }, 50);
    }
  };
  useEffect(() => {
    if (bookmarkPosition !== 0) {
      setItemsCount(bookmarkPosition + 10);
      const index = shabad.findIndex((item) => item.id === bookmarkPosition);
      if (index > 0 && rowHeights.length >= index) {
        const position = rowHeights.slice(0, index).reduce((a, b) => a + b, 0);
        readerRef.current?.scrollTo({ y: position, animated: true });
      }
      dispatch(setBookmarkPosition(0));
    }
  }, [bookmarkPosition, rowHeights, itemsCount]);

  return (
    <SafeAreaProvider
      style={{ backgroundColor: isNightMode ? colors.NIGHT_BLACK : colors.WHITE_COLOR }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar
          hidden={isStatusBar}
          backgroundColor={
            isNightMode ? colors.READER_STATUS_BAR_COLOR_NIGHT_MODE : colors.READER_STATUS_BAR_COLOR
          }
          barStyle={isNightMode ? "light-content" : "dark-content"}
        />

        <Header
          navigation={navigation}
          title={route.params.params.title}
          handleBackPress={handleBackPress}
          handleBookmarkPress={handleBookmarkPress}
          handleSettingsPress={handleSettingsPress}
        />

        {isLoading && <ActivityIndicator size="small" color={colors.READER_STATUS_BAR_COLOR} />}
        <ScrollView
          ref={readerRef}
          showsVerticalScrollIndicator
          scrollEventThrottle={16}
          onScroll={handleScroll}
        >
          <View onLayout={scrollToPosition}>
            {currentPage.map((item, index) => (
              <View
                key={item.id}
                onLayout={({ nativeEvent }) => {
                  const newRowHeights = rowHeights;
                  newRowHeights[index] = nativeEvent.layout.height;

                  setRowHeights(newRowHeights);
                }}
              >
                <ShabadItem item={item} index={index} />
              </View>
            ))}
          </View>
        </ScrollView>

        {isAutoScroll && <AutoScrollComponent shabadID={shabadID} />}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

Reader.propTypes = {
  navigation: PropTypes.shape().isRequired,
  route: PropTypes.shape().isRequired,
};

export default Reader;