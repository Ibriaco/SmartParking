import React, { Component } from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { connect } from 'react-redux';
import ParkCard from "../components/ParkCard";
import CardList from "react-native-card-animated-modal";

const now = new Date();

class ListScreen extends Component {
  constructor(props) {
    super(props);

    
  }   
  
    render() {
        return (
          <CardList  
          listProps={{
            ListHeaderComponent: () => (
              <View style={{ padding: 16, paddingBottom: 0 }}>
                <Text
                  style={{
                    fontSize: 13,
                    color: "rgba(0, 0, 0, 0.5)"
                  }}
                >
                  {now.toDateString()}
                </Text>
                <Text style={{ fontSize: 32, fontWeight: "bold" }}>Parkings</Text>
              </View>
            )
          }} 
          data={this.props.areas}
          
          renderItem={({ item, index }) => {
            //Render card per item
            return (
              <ParkCard item={item}/>
            );
          }}
          renderDetails={({ item, index }) => (
            <View style={{ paddingVertical: 30, paddingHorizontal: 16 }}>
              <Text style={{ color: "rgba(0, 0, 0, 0.7)", fontSize: 18 }}>
              PORCODIOPORCODIOPORCODIOPORCODIOPORCODIOPORCODIOPORCODIOPORCODIOPORCODIOPORCODIOPORCODIOPORCODIOPORCODIOPORCODIOPORCODIOPORCODIOPORCODIOPORCODIOPORCODIOPORCODIOPORCODIOPORCODIOPORCODIOPORCODIOPORCODIOPORCODIOPORCODIOPORCODIO
              </Text>
            </View>
          )}
        />
        )
    }
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#38BC7C',
      flexDirection: 'column',
      alignItems: 'center'
    },
    logo: {
      width: 80,
      height: 80,
      position: 'absolute',
      top: 250
    },
    title: {
      width: 300,
      height: 200,
      position: 'absolute',
      top: 250,
      left: 50
    }
  });

  function mapStateToProps(state) {
    return {
      //state.areas gets data from the store
      //and we are mapping that data to the prop named areas
      areas: state.areas, 
      tappedArea: state.tappedArea
    }
  }
  
  function mapDispatchToProps(dispatch) {
    return {
      updateArea: (param) => dispatch({type: "UPDATE_AREA", param: param}), 
      updateTappedArea: (param) => dispatch({type: "UPDATE_TAPPED_AREA", param: param}),    
    }
  }
  
  export default connect(mapStateToProps, mapDispatchToProps)(ListScreen);