import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { NavigationActions } from "react-navigation";
import Database from "../utils/database";
import { mergedBaniList } from "../utils/helpers";
import * as actions from "../actions/actions";
import BaniList from "../components/BaniList";

class Home extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      data: [],
      isLoading: true
    };
  }

  reorder(arr, index) {
    var ordered = new Array(index.length);

    for (var i = 0; i < index.length; i++) {
      ordered[i] = arr[index[i]];
    }
    return ordered;
  }

  sortBani() {
    this.setState({
      data: this.reorder(
        this.props.mergedBaniData.baniOrder,
        this.props.baniOrder
      )
    });
  }

  componentWillMount() {
    Database.getBaniList().then(baniList => {
      this.props.setMergedBaniData(mergedBaniList(baniList));
      this.sortBani();
      this.setState({
        isLoading: false
      });
    });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.baniOrder != this.props.baniOrder) {
      this.sortBani();
    }
  }

  handleOnPress(item, navigator) {
    if (!item.folder) {
      Database.getShabadForId(item.id).then(shabad => {
        navigator.navigate("Reader", { id: item.id, shabad: shabad });
      });
    } else {
      navigator.navigate("FolderBani", { data: item.folder });
    }
  }

  render() {
    return (
      <BaniList
        data={this.state.data}
        nightMode={this.props.nightMode}
        fontSize={this.props.fontSize}
        fontFace={this.props.fontFace}
        romanized={this.props.romanized}
        navigation={this.props.navigation}
        isLoading={this.state.isLoading}
        onPress={this.handleOnPress}
      />
    );
  }
}

function mapStateToProps(state) {
  return {
    nightMode: state.nightMode,
    baniOrder: state.baniOrder,
    mergedBaniData: state.mergedBaniData,
    romanized: state.romanized,
    fontSize: state.fontSize,
    fontFace: state.fontFace
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(actions, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
