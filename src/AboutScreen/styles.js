import { StyleSheet } from "react-native";
import colors from "../common/colors";

const styles = StyleSheet.create({
  nightMode: { backgroundColor: colors.NIGHT_BLACK, color: colors.WHITE_COLOR },
  margin: { marginTop: 20 },
  SGTitle: { fontSize: 20, fontWeight: "bold" },
  singleLine: { flexDirection: "row", justifyContent: "space-between" },
});
export default styles;