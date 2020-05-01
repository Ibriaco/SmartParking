import React from "react";
import {
  StyleSheet,
  View,
  Image,
  Dimensions,
  Linking,
  StatusBar,
  TouchableOpacity
} from "react-native";
import MapView, {
  Marker,
  AnimatedRegion,
  PROVIDER_GOOGLE
} from "react-native-maps";
import MapViewDirections from 'react-native-maps-directions';
import * as Permissions from 'expo-permissions';
import Modal from "react-native-modal";
import ActionButton from 'react-native-circular-action-menu';
import * as firebase from 'firebase';
import { YellowBox } from 'react-native';
import _ from 'lodash';
import { connect } from 'react-redux';
import { Block, Text, Button, Divider } from "../components";
import { FontAwesome5 } from 'react-native-vector-icons';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {showMessage} from "react-native-flash-message";
import {Ionicons} from 'react-native-vector-icons'



const HEIGHT = Dimensions.get('window').height;
const WIDTH = Dimensions.get('window').width;
const LATITUDE_DELTA = 0.0009;
const LONGITUDE_DELTA = 0.0009;
const LATITUDE = 46.166625;
const LONGITUDE = 9.87888;
const GOOGLE_MAPS_APIKEY = 'AIzaSyAQYSx-AfOH9myf-veyUCa38l7MTQ77NH8';

var lightMapStyle = require('./mapStyle.json');
var darkMapStyle = require('./mapStyle2.json');

var initialPosition = true;
const initialRegion = {
  latitude: 45.464664,
  longitude: 9.188540,
  latitudeDelta: 10,
  longitudeDelta: 10
};

//fuck those useless warnings
YellowBox.ignoreWarnings(['Setting a timer']);
const _console = _.clone(console);
console.warn = message => {
  if (message.indexOf('Setting a timer') <= -1) {
    _console.warn(message);
  }
};

class Map extends React.Component {
  constructor(props) {
    super(props);

    this._showParkingRoute = this._showParkingRoute.bind(this);
    this._handlePayment = this._handlePayment.bind(this);
    this._centerMap = this._centerMap.bind(this);



    this.state = {
      searchQuery: '',
      tappedAreaTime: "",
      tappedAreaDistance: "",
      parkCards: [],
      isModalVisible: false,
      isLoading: true,
      darkMode: false,
      email: "",
      displayName: "",

      currentCoordinates: {
        latitude: LATITUDE,
        longitude: LONGITUDE,
      },

      destinationCoordinates: null,

      //animated region used to animate the marker representing the user position
      coordinate: new AnimatedRegion({
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: 0,
        longitudeDelta: 0
      }),

    };
  }


  async readAndDrawAreas() {

    firebase.database().ref('Cities/' + this.props.currentCity + '/Areas').on('value', (snapshot) => {
      this.props.updateArea(snapshot.val());
      this.setState({ isLoading: false });
    })

  }


  signoutUser = () => {
    firebase.auth().signOut();
  }


  async componentDidMount() {

    //authentication
    const { email, displayName, uid } = firebase.auth().currentUser
    this.setState({ email, displayName });

    //welcome message
    showMessage({
      message: "Welcome!",
      description: uid,
      type: "default",
      backgroundColor: "black", // background color
      color: "white", // text color
    });

    //when everything is mounted i fetch the db to get areas to render
    //await this.readAndDrawAreas();


    //guardare questa istruzione
    const { coordinate } = this.state;

    //ask for gps permission and watch for position changes
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status === 'granted') {
      this.watchID = navigator.geolocation.watchPosition(
        position => {
          const { latitude, longitude } = position.coords;

          const newCoordinate = {
            latitude,
            longitude
          };

          //when position changes, animate the marker
          coordinate.timing(newCoordinate).start();

          //and update the route at index 0

          this.setState({ currentCoordinates: newCoordinate });
          this.props.updateCoordinates(newCoordinate);


          if (initialPosition) {
            initialPosition = !initialPosition
            this.updateCamera();
            this.readAndDrawAreas();
          }

          //this.updateDist()



        },
        error => alert('Please give us the permission!'),
        {
          //this should update position every 1m, mmmmmm
          enableHighAccuracy: true,
          timeout: 2000,
          maximumAge: 0,
          distanceFilter: 1
        }
      );


    }
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID);
  }

  async updateCamera() {

    //funziona solo cosi? pazzesco
    if (this.mapView !== null)
      this.mapView.animateCamera({ center: this.state.currentCoordinates, zoom: 16 }, { duration: 2000 });

  }


  getMapRegion() {
    return {
      latitude: this.state.coordinate.longitude,
      longitude: this.state.routeCoordinates[0].longitude,

      latitudeDelta: LATITUDE_DELTA,
      longitudeDelta: LONGITUDE_DELTA
    }
  }

  /*
  DA QUA DEVO GESTIRE LA MADONNA DEL MODAL
  */
  async onAreaTapped(area) {

    if (this.props.showRoute)
      this.props.updateShowRoute(false);

    await this.props.updateTappedArea(area);

    setTimeout(() => { this.setState({ isModalVisible: true }) }, 200)
  }

  _showParkingRoute() {

    this.setState({ isModalVisible: false })
    this.props.updateShowRoute(true);

  }

  _handlePayment() {

    this.setState({ isModalVisible: false })
    this.props.navigation.navigate("Payment");
  }

  _centerMap() {

    //funziona solo cosi? pazzesco
    if (this.mapView !== null)
      this.mapView.animateCamera({ center: this.state.currentCoordinates, zoom: 16 }, { duration: 1000 });

  }


  handleSelection(details){
    
    this.setState({destinationCoordinates: {
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng
    }});

    if (this.mapView !== null)
      this.mapView.animateCamera({ center: this.state.destinationCoordinates, zoom: 100 }, { duration: 1000 });
    
  }

  async setModalVisible(visible) {
    this.setState({
      isModalVisible: visible,
    })
  }


  async updateDist() {

    var tempAreas = this.props.areas;
    var newAreas = [];

    for (var area of tempAreas) {

      try {
        let response = await fetch('https://maps.googleapis.com/maps/api/distancematrix/json?origins=' + this.state.currentCoordinates.latitude + ',' + this.state.currentCoordinates.longitude + '&destinations=' + area.latitude + ',' + area.longitude + '&key=' + GOOGLE_MAPS_APIKEY);
        let json = await response.json();

        area = {
          ...area,
          distance: json.rows[0].elements[0].distance.text,
          time: json.rows[0].elements[0].duration.text
        };

        newAreas.push(area);

      } catch (error) {
        console.error(error);

      };
    }
    this.props.updateArea(newAreas)

  }


  render() {
    const { searchQuery } = this.state;
    const { navigation } = this.props;
    return (

      <View style={styles.container}>
        <TouchableOpacity
          style={{ alignItems: "flex-start", margin: 16, position: "absolute", backgroundColor: "#147c" }}
          onPress={this.props.navigation.openDrawer}
        >
          <FontAwesome5 name="bars" size={24} color="#161924" />
        </TouchableOpacity>
        <MapView
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          maxZoomLevel={19}
          loadingEnabled={true}
          customMapStyle={this.props.darkTheme ? darkMapStyle : lightMapStyle}
          ref={ref => { this.mapView = ref }}
          initialRegion={initialRegion}
          showsUserLocation={false}
        >

          {!this.state.isLoading && this.props.areas.map((area, index) => (

            <MapView.Marker key={index}
              stopPropagation={true}
              coordinate={{ latitude: area.latitude, longitude: area.longitude }}
              onPress={() => this.onAreaTapped(area)}>
              <FontAwesome5 name="parking" color="#FF9800" size={30} />
            </MapView.Marker>
          ))}

          {(this.state.destinationCoordinates != null) && (

          <MapView.Marker
              coordinate={{ latitude: this.state.destinationCoordinates.latitude, longitude: this.state.destinationCoordinates.longitude }}>
                                     <Animatable.View animation="bounceIn" duration={700} delay={2000} >
<FontAwesome5 name="map-marker-alt" color="#FF9800" size={30} />
             </Animatable.View></MapView.Marker>
         
          )}
          
          
          {(this.props.showRoute) && (
            <MapViewDirections
              origin={this.state.currentCoordinates}
              destination={{
                latitude: this.props.tappedArea.latitude,
                longitude: this.props.tappedArea.longitude
              }}
              apikey={GOOGLE_MAPS_APIKEY}
              strokeWidth={3}
              strokeColor="rgba(0,0,0,1)"
              optimizeWaypoints={true}
              onStart={(params) => {

              }}
              onReady={result => {

                this.mapView.fitToCoordinates(result.coordinates), {
                  edgePadding: { top: 150, right: 150, bottom: 150, left: 150 },
                  animated: true,
                };


              }}
              onError={(errorMessage) => {
                // console.log('GOT AN ERROR');
              }}

            />
          )}
        
        <Marker.Animated
            ref={marker => { this.marker = marker; }}
            coordinate={this.state.coordinate}>
            <Icon name="circle-slice-8" size = {24} color ="#rgba(3, 166, 150,0.7)"/>

          </Marker.Animated>


        </MapView>

        <Animatable.View animation="slideInDown" duration={800} delay={1800} style={{
          backgroundColor: '#fff', position: 'absolute', width: '80%', top: 50, borderRadius: 20, borderColor: "#fff", alignSelf: 'center', shadowOpacity: 0.3,
          shadowOffset: { width: 0, height: 2 },
          elevation: 3,
        }}>
          <GooglePlacesAutocomplete

            minLength={2} // minimum length of text to search
            autoFocus={false}
            returnKeyType={'search'} // Can be left out for default return key https://facebook.github.io/react-native/docs/textinput.html#returnkeytype
            keyboardAppearance={'light'} // Can be left out for default keyboardAppearance https://facebook.github.io/react-native/docs/textinput.html#keyboardappearance
            listViewDisplayed='false'    // true/false/undefined
            fetchDetails={true}
            renderDescription={row => row.description} // custom description render
            onPress={(data, details) => { // 'details' is provided when fetchDetails = true
              
              this.handleSelection(details);

            }}

            getDefaultValue={() => ''}

            query={{
              // available options: https://developers.google.com/places/web-service/autocomplete
              key: 'AIzaSyAQYSx-AfOH9myf-veyUCa38l7MTQ77NH8',
              language: 'en', // language of the results
            }}

            styles={{
              container: {
                borderRadius: 15,
                borderColor: '#fff',
                backgroundColor: "#ffff",
                height: '100%',
              },
              poweredContainer: {
                width: 0,
                height: 0
              },
              powered: {
                width: 0,
                height: 0
              },
              loader: {
                width: '50%',

              },
              textInputContainer: {
                borderTopWidth: 0,
                borderBottomWidth: 0,
                borderWidth: 10,
                borderRadius: 20,
                borderColor: '#fff',
                backgroundColor: "#ffff",
                height: 60,
                alignSelf: 'center'
              },
              description: {
                color: '#a5a5a5',
              },
              predefinedPlacesDescription: {
                color: '#DCDCDC',
              },
              textInput: {
                marginHorizontal: 20,
                borderWidth: 0,
                borderColor: '#fff',
                backgroundColor: "#ffff",
                alignSelf: 'center',
                color: '#a5a5a5',
              }
            }}

            //currentLocation={true} // Will add a 'Current location' button at the top of the predefined places list
            //currentLocationLabel="Current location"
            nearbyPlacesAPI='GooglePlacesSearch' // Which API to use: GoogleReverseGeocoding or GooglePlacesSearch
            GoogleReverseGeocodingQuery={{
              // available options for GoogleReverseGeocoding API : https://developers.google.com/maps/documentation/geocoding/intro
            }}
            GooglePlacesSearchQuery={{
              // available options for GooglePlacesSearch API : https://developers.google.com/places/web-service/search
              rankby: 'distance',
            }}

            GooglePlacesDetailsQuery={{
              // available options for GooglePlacesDetails API : https://developers.google.com/places/web-service/details
              fields: 'geometry',
            }}

            filterReverseGeocodingByTypes={['locality', 'administrative_area_level_3']} // filter the reverse geocoding results by types - ['locality', 'administrative_area_level_3'] if you want to display only cities


            debounce={200} // debounce the requests in ms. Set to 0 to remove debounce. By default 0ms.
            renderLeftButton={() => <FontAwesome5 name="map-marker-alt" size={20} color="#D4D4D4" style={{ alignSelf: 'center', }} />}
            renderRightButton={() => <FontAwesome5 name="sliders-h" size={20} color="#D4D4D4" style={{ alignSelf: 'center', }} onPress={() => this.props.navigation.navigate("Filter")} />}
          />



        </Animatable.View>


        <Block>
          <Modal isVisible={this.state.isModalVisible} style={{ flex: 1, justifyContent: "flex-end", alignSelf: "center", width: '70%',}}
            onBackdropPress={() => { this.setModalVisible(false) }}>
            <View style={{ flex: 0.3, backgroundColor: "#f8f8ff", borderRadius: 15, justifyContent: "space-evenly", flexDirection: "row", width: '100%', marginVertical: 5, alignSelf:"flex-start" }}>

              <View style={{ marginTop: 5, flexDirection: "column", justifyContent: "space-between" }}>
                <View style={{ flexDirection: "column" }}>
                  <Text h2 bold secondary>Via Washington, 25</Text>
                  <Text h3>{this.props.tappedArea.distance}, {this.props.tappedArea.time}</Text>
                  <Text h2 bold>Price: <Text h2 bold color="#03A696">{this.props.tappedArea.price != 0 && this.props.tappedArea.price}{this.props.tappedArea.price == 0 && "FREE"}<Text h2 color="#03A696">{this.props.tappedArea.price != 0 && "€"}<Text h3 secondary>{this.props.tappedArea.price != 0 && "/h"}</Text></Text></Text></Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between", }}>
                  {/*
                <Button style={styles.modalContent}>
                    <FontAwesome5 name="map-marked" color="#03A696" size={18} onPress={() => Linking.openURL('https://www.google.com/maps/dir/?api=1&destination=' + this.props.tappedArea.latitude + ',' + this.props.tappedArea.longitude)} />
                  </Button>
                {this.props.tappedArea.address}
                 */}
                  <FontAwesome5 name="parking" size={24} color="rgba(3, 166, 150,0.5)"> <Text h3 bold secondary> 3</Text><Text title>/10 spots</Text></FontAwesome5>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
                  <Button style={styles.labels}>
                    <Text>disables</Text>
                  </Button>
                  <Button style={styles.labels}>
                    <Text>disables</Text>
                  </Button>
                </View>

                <View style={{ flexDirection: "row", justifyContent: "space-evenly",  }}>
                {/*
                
                <Button style={styles.modalContentLowLeft} onPress={this._showParkingRoute}>
                    <FontAwesome5 name="route" size={18} color="#fff"><Text h3 bold white > Show</Text></FontAwesome5>
                  </Button>
                 */}
                 <Button style={styles.modalContent}>
                    <Icon name="directions" color="#fff" size={30} onPress={this._showParkingRoute} />
                  </Button>
                  <Button style={styles.modalContent}>
                    <Icon name="google-maps" color="#fff" size={30} onPress={() => Linking.openURL('https://www.google.com/maps/dir/?api=1&destination=' + this.props.tappedArea.latitude + ',' + this.props.tappedArea.longitude)} />
                  </Button>
                  <Button style={styles.modalContent}>
                    <Icon name="credit-card" color="#fff" size={30} onPress={this._showParkingRoute} />
                  </Button>
                </View>

              </View>
              {/*
              
              <View style={{ justifyContent: "space-evenly", flexDirection: "column", marginHorizontal: 20, }}>
                <Text h1 bold color="#03A696">{this.props.tappedArea.price != 0 && this.props.tappedArea.price}{this.props.tappedArea.price == 0 && "FREE"}<Text h1 color="#03A696">{this.props.tappedArea.price != 0 && "€"}<Text h3 secondary>{this.props.tappedArea.price != 0 && "/h"}</Text></Text></Text>
                <Button style={styles.modalContentLowRight} >
                  <Text h2 bold white >Pay</Text>
                </Button>
                <Text></Text>
                <Button style={styles.modalContent}>
                    <Icon name="google-maps" color="#03A696" size={30} onPress={() => Linking.openURL('https://www.google.com/maps/dir/?api=1&destination=' + this.props.tappedArea.latitude + ',' + this.props.tappedArea.longitude)} />
                  </Button>
              </View>
              
               */}
              
            </View>
          </Modal>
        </Block>

        <Animatable.View animation="zoomIn" duration={800} delay={2100} style={{
          position: 'absolute', bottom: 30, elevation: 3,alignSelf:"center", 
        }}>
        <Button style = {styles.centerUser} onPress={this._centerMap}>
        <Icon name="crosshairs-gps" size = {28} color ="#fff"/>
        </Button>
        </Animatable.View>
      </View>

    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center"
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  centerUser: {
    backgroundColor: "#000",
    width: 50,
    height: 50,
    top: 20,
    borderRadius: 25,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    alignItems: "center"
  },
  latlng: {
    width: 200,
    alignItems: "stretch"
  },
  button: {
    width: 80,
    paddingHorizontal: 12,
    alignItems: "center",
    marginHorizontal: 10
  },
  buttonContainer: {
    flexDirection: "row",
    marginVertical: 20,
    backgroundColor: "transparent"
  },
  modalView: {
    position: "absolute",
    bottom: -30,
    left: -10,
    borderRadius: 20,
    backgroundColor: "white",
    width: WIDTH - 20,
    height: HEIGHT / 2
  },
  searchbar: {
    marginTop: 40,
    marginHorizontal: 20,
    borderRadius: 10,
    opacity: 1,
    height: 60,
    //bottom: HEIGHT*5/6

  },
  labels: {
    width: 55,
    height: 20,
    borderRadius: 8,
    backgroundColor: "#E5E5E5",
    alignItems: "center"
  },
  modalContent: {
    backgroundColor: '#000',
    height: 40,
    width: 50,
    //justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#000",
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  modalContentLowLeft: {
    backgroundColor: '#03A696',
    height: 40,
    width: 140,
    //justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 18,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  modalContentLowRight: {
    backgroundColor: '#03A696',
    height: 65,
    width: 60,
    flexDirection: "column",
    //justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    shadowColor: '#03A696'
  }
});

function mapStateToProps(state) {
  return {
    //state.areas gets data from the store
    //and we are mapping that data to the prop named areas
    darkTheme: state.darkTheme,
    showRoute: state.showRoute,
    areas: state.areas,
    tappedArea: state.tappedArea,
    currentCity: state.currentCity,
    userCoordinates: state.userCoordinates
  }
}

function mapDispatchToProps(dispatch) {
  return {
    updateShowRoute: (param) => dispatch({ type: "UPDATE_SHOW_ROUTE", param: param }),
    updateCity: (param) => dispatch({ type: "UPDATE_CURRENT_CITY", param: param }),
    updateCoordinates: (param) => dispatch({ type: "UPDATE_COORDINATES", param: param }),
    updateArea: (param) => dispatch({ type: "UPDATE_AREA", param: param }),
    updateTappedArea: (param) => dispatch({ type: "UPDATE_TAPPED_AREA", param: param }),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Map);