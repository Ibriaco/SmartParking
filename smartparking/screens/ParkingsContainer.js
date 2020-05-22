import React, { Component } from 'react';
import { Platform, StatusBar, View} from 'react-native'
import { Container, Header, Content, Tab, Tabs } from 'native-base';
import Parkings from './Parkings';
import { theme, mocks } from "../constants";
import ActiveParkings from './ActiveParkings';
import History from './History'
import { Text, Block } from '../components';
import { connect } from 'react-redux';


const HEADER_HEIGHT = Platform.OS == 'ios' ? 45 : StatusBar.currentHeight;

class ParkingsContainer extends Component {
  render() {
    return (
      <Container style={{ marginTop: HEADER_HEIGHT}}>
          <View style = {{flex: 0.1, alignContent:"center", flexDirection:"row", alignItems:"center", marginHorizontal:30}}>
            <Text style = {{fontSize: 32, fontFamily: "Helvetica-Bold"}} >Parkings</Text>
          </View>
        <Tabs activeTabStyle = {{backgroundColor:"#fff"}} style = {{backgroundColor:"#fff"}} tabBarUnderlineStyle={{backgroundColor:"#03A696", height: 3}} noShadow tabContainerStyle={{elevation:0}}>
          <Tab heading="Available" style={{backgroundColor:"#fff"}} textStyle={{color:"#C7CCD5", fontSize:16, fontFamily: "Montserrat", }} activeTextStyle={{color:"#000", fontSize:16 , fontFamily:"Montserrat-Bold"}} tabStyle = {{backgroundColor:"#fff", borderWidth: 0}} activeTabStyle = {{backgroundColor:"#fff"}} style = {{backgroundColor:"#fff"}} >
            <Parkings navigation={this.props.navigation}/>
          </Tab>
          <Tab heading="Active" style={{backgroundColor:"#fff"}} textStyle={{color:"#C7CCD5", fontSize: 16, fontFamily: "Montserrat"}} activeTextStyle={{color:"#000", fontSize: 16, fontFamily:"Montserrat-Bold"}} activeTabStyle = {{backgroundColor:"#fff"}} tabStyle = {{backgroundColor:"#fff"}} style = {{backgroundColor:"#fff"}}>
            <ActiveParkings/>
          </Tab>
          <Tab heading="History" style={{backgroundColor:"#fff"}}textStyle={{color:"#C7CCD5", fontSize: 16, fontFamily: "Montserrat"}} activeTextStyle={{color:"#000", fontSize:16, fontFamily:"Montserrat-Bold"}} activeTabStyle = {{backgroundColor:"#fff"}} tabStyle = {{backgroundColor:"#fff"}} style = {{backgroundColor:"#fff"}}>
          <History/>
          </Tab>
        </Tabs>
      </Container>
    );
  }
}

function mapStateToProps(state) {
  return {
    //state.areas gets data from the store
    //and we are mapping that data to the prop named areas
    userData: state.userData,
  }
}

export default connect(mapStateToProps)(ParkingsContainer);