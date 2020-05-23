import React, { Component } from 'react'
import { StyleSheet, View, Image, Dimensions, Platform, StatusBar, TouchableOpacity, TouchableWithoutFeedback } from 'react-native'
import { FontAwesome5 } from 'react-native-vector-icons';
import { connect } from 'react-redux';
import { theme, mocks } from "../constants";
import Animated from 'react-native-reanimated';
import { Button, Block, Text, Switch, Divider } from "../components";
import * as Animatable from 'react-native-animatable';
import { Card } from 'galio-framework';
import { Container, Header, Content, Tab, Tabs } from 'native-base';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width } = Dimensions.get('screen');


//const HEADER_HEIGHT = Platform.OS == 'ios' ? 115 : 70 + StatusBar.currentHeight;
const HEADER_HEIGHT = Platform.OS == 'ios' ? 145 : 100 + StatusBar.currentHeight;

class Parkings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      animation: new Animated.Value(0),
    }

  }
  scrollY = new Animated.Value(0);
  diffClampScrollY = new Animated.diffClamp(this.scrollY, 0, HEADER_HEIGHT);
  headerY = new Animated.interpolate(this.diffClampScrollY,
    {
      inputRange: [0, HEADER_HEIGHT],
      outputRange: [0, -HEADER_HEIGHT]
    });

  render() {
    return (

      <Container style={{ flex: 1, backgroundColor:this.props.userData.darkMode ? '#303030' : "rgba(3, 166, 150,0.02)" }}>
        <Animated.ScrollView
          style = {{backgroundColor:this.props.userData.darkMode ? '#303030' : "rgba(3, 166, 150,0.02)"}}
          contentContainerStyle={this.props.userData.darkMode ? styles.darkCards : styles.cards}
          showsVerticalScrollIndicator={false}
          bounces={false}
          scrollEventThrottle={16}
          onScroll={Animated.event([
            {
              nativeEvent: { contentOffset: { y: this.scrollY } }
            }
          ])}>
          {this.props.areas.map((area, index) => (
            <Animatable.View animation="slideInUp" duration={600} delay={100 + index * 300} key={index} style={{ flex: 1, margin: 10, backgroundColor:this.props.userData.darkMode ? '#303030' : "rgba(3, 166, 150,0.02)" }}>
              <TouchableWithoutFeedback onPress={() => {
                this.props.mapRef.animateCamera({ center: { latitude: area.latitude, longitude: area.longitude }, zoom: 18 }, { duration: 1000 });
                this.props.updateTappedArea(area);
                this.props.updateShowRoute(false);
                setTimeout(() => this.props.updateModalVisible(true), 1400);
                this.props.navigation.navigate("Home");
              }}>
                <Card
                  flex
                  borderless
                  shadowColor="black"
                  style={this.props.userData.darkMode ? styles.darkCard : styles.card}
                  title={area.distance + ", " + area.time}
                  avatar="https://i.imgur.com/dQGKmRZ.png"
                  caption={area.price != 0 ? area.price + " €/h" : "FREE"}
                  location={area.address}
                  image={area.image.uri}
                  imageStyle={styles.rounded}
                  imageBlockStyle={{ padding: theme.sizes.base / 2 }}
                >


                  <View style={{ flexDirection: "row", paddingVertical: 10, justifyContent: "center", alignItems:"baseline" }}>
                    <FontAwesome5 name="parking" size={30} color="rgba(3, 166, 150,1)">
                    </FontAwesome5>
                    <Text h2 secondary center style={{ fontFamily: "Montserrat-Bold" }}>  {area.nTot - area.nTaken}</Text>
                    <Text h3 secondary center secondary style={{ fontFamily: "Montserrat-Bold" }}> available spots</Text>
                  </View>

                  <View style={{ flexDirection: "row", justifyContent: "center" }}>

                    {area.nHandicap > 0 &&
                      <Icon name="wheelchair-accessibility" size={30} color="#6592F7" style={{ alignSelf: "center", paddingRight: 20 }} />
                    }

                    {area.nPregnant > 0 &&
                      <Icon name="human-pregnant" size={30} color="#FEB8C6" style={{ alignSelf: "center", paddingRight: 20 }} />
                    }

                    {area.nElectric > 0 &&
                      <Icon name="car-electric" size={30} color="#FED000" style={{ alignSelf: "center", paddingRight: 20 }} />
                    }

                  </View>
                  <Text></Text>
                </Card>
              </TouchableWithoutFeedback>
            </Animatable.View>
          ))}
          {this.props.areas.length == 0 && <Animatable.View animation="slideInUp" duration={600} delay={100} style={{ flex: 1, margin: 10 }}>
            <Text h1 style={{ color: "red", fontFamily: "Montserrat-Bold" }}>There are no parkings!</Text>

            <Text style={{ fontFamily: "Montserrat-Bold" }}>Please change location, destination or try using different filter paramenters!</Text>

          </Animatable.View>
          }

        </Animated.ScrollView>
      </Container>
    );
  }
}


const styles = StyleSheet.create({
  header: {
    paddingHorizontal: theme.sizes.base * 2,
    paddingVertical: theme.sizes.base * 4
  },
  container: {
    paddingHorizontal: theme.sizes.base * 2
  },
  cards: {
    backgroundColor: "white",
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  darkCards: {
    backgroundColor: "#303030",
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  card: {
    backgroundColor: "white",
    width: width - theme.sizes.base * 2,
    elevation: theme.sizes.base / 2,
    borderRadius: theme.sizes.base,
  },
  darkCard: {
    backgroundColor: "#404040",
    width: width - theme.sizes.base * 2,
    elevation: 2 ,
    borderRadius: theme.sizes.base,
  },
  
  rounded: {
    borderRadius: theme.sizes.base,
  },
  labels: {
    width: 100,
    height: 25,
    borderRadius: 8,
    backgroundColor: "#E5E5E5",
    alignItems: "center",
    marginHorizontal: 10
  },
});

function mapStateToProps(state) {
  return {
    //state.areas gets data from the store
    //and we are mapping that data to the prop named areas
    userData: state.userData,
    mapRef: state.mapRef,
    showRoute: state.showRoute,
    areas: state.areas,
    tappedArea: state.tappedArea
  }
}

function mapDispatchToProps(dispatch) {
  return {
    updateModalVisible: (param) => dispatch({ type: "UPDATE_MODAL_VISIBLE", param: param }),
    updateShowRoute: (param) => dispatch({ type: "UPDATE_SHOW_ROUTE", param: param }),
    updateArea: (param) => dispatch({ type: "UPDATE_AREA", param: param }),
    updateTappedArea: (param) => dispatch({ type: "UPDATE_TAPPED_AREA", param: param }),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Parkings);
