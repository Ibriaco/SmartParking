import React, { Component } from "react";
import {
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  View,
  Image,
  KeyboardAvoidingView
} from "react-native";
import * as firebase from 'firebase'
import * as Facebook from "expo-facebook";
import * as Constants from "expo-constants";
import * as Google from 'expo-google-app-auth';


import { Button, Block, Text, Divider } from "../components";
import { theme } from "../constants";
import { SocialIcon } from 'react-native-elements'

import { Input, Icon } from "galio-framework"
import * as Animatable from 'react-native-animatable';
import { connect } from 'react-redux';


class Login extends Component {
  state = {
    email: "",
    password: "",
    errorMessage: null
  };

  setToArray()  {
    var temp = this.props.userData.reservations;
    var newArr = [];

    for(var i in temp)
       newArr.push(temp[i]);
    
    
    this.props.updateReservationsArray(newArr);

  }



  handleLogin() {
    const { navigation } = this.props;
    const { email, password } = this.state;

    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        
        firebase.database().ref('Users/' + firebase.auth().currentUser.uid).on('value', (snapshot) => {
          this.props.updateUserData(snapshot.val());
          this.setToArray();
        });

        this.props.navigation.navigate("Home")})
      .catch(error => this.setState({ errorMessage: error.message }));
      //this.props.navigation.navigate("Home")

    Keyboard.dismiss();
  }

    _loginWithGoogle = async () => {
    try {
      const result = await Google.logInAsync({
        androidClientId:"663247712461-6phn0s7ga57vlqjmub2sf972npnutabt.apps.googleusercontent.com",
        iosClientId:"663247712461-se8kfcpofh6qr458l8u266no50h42dij.apps.googleusercontent.com",
        scopes: ["profile", "email"]
      });
  
      if (result.type === "success") {
        const { idToken, accessToken } = result;
        const credential = firebase.auth.GoogleAuthProvider.credential(idToken, accessToken);
        firebase
          .auth()
          .signInWithCredential(credential)
          .then(() => {
    
            var tempUser = firebase.auth().currentUser;
            firebase.database().ref('Users/' + tempUser.uid).on('value', (snapshot) => {
             
              if(!snapshot.val()){
                //no user data => signup
                this.props.updateUserData({
                  uid: tempUser.uid,
                  name: tempUser.displayName,
                  email: tempUser.email,
                  photoUrl: tempUser.photoURL,
                  points: 0,
                  bonus: 0,
                  darkMode: false,
                  notifications: false,
                  vehiclePlate: "SM 000 PK",
                  license: "SMRTPKNG2020"
                });
  
                firebase.database().ref('Users/' + tempUser.uid).set(
                  this.props.userData
                );
  
              } else {
                //user data => login
                this.props.updateUserData(snapshot.val());
                this.setToArray();
              }

            });
            
            this.props.navigation.navigate("Home")
          }
            )
          .catch(error => {
            console.log("firebase cred err:", error);
          });
      } else {
        return { cancelled: true };
      }
    } catch (err) {
      console.log("err:", err);
    }
  };


  _loginWithFacebook = async () => {
    const permissions = ["public_profile", "email"]; 
    await Facebook.initializeAsync("280118969668120");
    const { type, token } = await Facebook.logInWithReadPermissionsAsync({
      permissions
    });
    if (type == "success") {
      await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
      const credential = firebase.auth.FacebookAuthProvider.credential(token);
      await firebase
        .auth()
        .signInWithCredential(credential) 
        .then(() => {

            var tempUser = firebase.auth().currentUser;
            firebase.database().ref('Users/' + tempUser.uid).on('value', (snapshot) => {

              if(!snapshot.val()){
                //no user data => signup
                this.props.updateUserData({
                  uid: tempUser.uid,
                  name: tempUser.displayName,
                  email: tempUser.email,
                  photoUrl: tempUser.photoURL,
                  points: 0,
                  bonus: 0,          
                  darkMode: false,
                  notifications: false,
                  vehiclePlate: "SM 000 PK",
                  license: "SMRTPKNG2020"
                });
  
                firebase.database().ref('Users/' + tempUser.uid).set(
                  this.props.userData
                );
  
              } else {
                //user data => login
                this.props.updateUserData(snapshot.val());
                this.setToArray();
              }
            });

          this.props.navigation.navigate("Home")})
        .catch(error => this.setState({ errorMessage: error.message }));; 
    }
  };

  
  render() {
    const { navigation } = this.props;

    return (
      <View style={{flex: 1}}>
      
      <KeyboardAvoidingView
      behavior={Platform.OS == "ios" ? "padding" : "height"}
      style={styles.login}
      >
      <View style={styles.container2}>
            <Animatable.Image animation="fadeIn" duration={1500} source={require('../assets/logo/logoText_green.png')} style={styles.image}/>
      </View>

        <Block padding={[0, theme.sizes.base * 2]}>
          
          <Text h1 bold>
          </Text>
          <Text style = {{fontFamily: 'Montserrat-Bold', fontSize: 32}}>
          Login
          </Text>
          <Block top>
            <View style={styles.errorMessage}>
              {this.state.errorMessage && <Text style={styles.error}>{this.state.errorMessage}</Text>}
            </View>
            <Block top>
            </Block>
            <Block top></Block>
            <Block top ></Block>
            <Block top>
            </Block>
            <Input
              placeholder ="Email Address"
              right
              icon="envelope"
              family="font-awesome"
              iconSize={18}
              iconColor="#a5a5a5"
              style={styles.input}
              onChangeText={email => this.setState({ email })}
              value={this.state.email}
            />
            <Input
              password
              viewPass
              iconColor ="#a5a5a5"
              iconSize = {20}
              placeholder="Password"
              style={[styles.input]}
              onChangeText={password => this.setState({ password })}
              value={this.state.password}
            />
            <Button style={styles.forget}>
             
            </Button>

            <Text></Text>

          </Block>
          <Block bottom style={styles.bottom}>
          <View style={styles.social}>
            <Animatable.View animation="slideInUp" duration={700} delay={200}>
                <Button style={styles.google} onPress={()=>this._loginWithGoogle()} >
                  <SocialIcon
                    type="google"
                    light
                  />
                </Button>
                </Animatable.View>
                <Text center gray2 h4>      </Text>
            <Animatable.View animation="slideInUp" duration={700} delay={300}>

                <Button style={styles.facebook} onPress={()=>this._loginWithFacebook()}>
                  <SocialIcon
                    type="facebook"
                    light
                  />
                </Button>
                </Animatable.View>

              </View>
              <Animatable.View animation="slideInUp" duration={700} delay={400}>

            <Button style={styles.loginButton} onPress={()=>this.handleLogin()}>
              <Text h2 white center style={{fontFamily: 'Montserrat-Bold'}}>
                Login
                </Text>
            </Button>
            </Animatable.View>

            <Animatable.View animation="slideInUp" duration={700} delay={600}>

            <Button style={styles.registerButton} onPress={() => navigation.navigate("Register")}>
              <Text h2 black center style={{fontFamily: 'Montserrat-Bold'}}>
                Register
                </Text>
            </Button>
            </Animatable.View>

          </Block>
        </Block>
      </KeyboardAvoidingView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  login: {
    flex: 1,
    justifyContent: "center",
  },
  input: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#fff",
    backgroundColor: "#fff",
    shadowOpacity: 0.3,
    shadowOffset: {width: 0, height: 2},
    elevation: 3,
    height: 60,
    shadowColor: "#a5a5a5"
  },
  hasErrors: {
    borderBottomColor: theme.colors.accent
  },
  loginButton: {
    backgroundColor: '#03A696',
    height: 60,
    borderRadius: 20,
    marginHorizontal: 25,
    shadowOpacity: 0.3,
    shadowOffset: {width: 0, height: 2},
    elevation: 6,
  },
  registerButton: {
    backgroundColor: "#fff",
    shadowOpacity: 0.3,
    shadowOffset: {width: 0, height: 2},
    elevation: 3,
    height: 60,
    borderRadius: 20,
    shadowColor: "#a5a5a5",
    marginHorizontal: 25,
  },
  bottom: {
    marginBottom: 30
  },
  signButton: {
    marginBottom: 40,
    height: 10
  },
  social: {
    flexDirection: "row",
    justifyContent: 'center',
    alignItems: 'center',
  },
  google: {
    backgroundColor: '#ffffff',
    height: 50,
    width: 50,
    alignItems: 'center',
    borderRadius: 25,
    shadowOpacity: 0.3,
    shadowOffset: {width: 0, height: 2},
    elevation: 6,
  },
  facebook: {
    backgroundColor: '#fff',
    height: 50,
    width: 50,
    alignItems: 'center',
    borderRadius: 25,
    shadowOpacity: 0.3,
    shadowOffset: {width: 0, height: 2},
    elevation: 6,
  },
  forget: {
    height: 20,
    backgroundColor: "#fff"
  },
  error: {
    color: "#F14336",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    fontFamily: 'Montserrat'
  },
  errorMessage: {
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 30,
  },
  container2: {
    flex: 0.15,
    //backgroundColor: theme.colors.secondary,
    top: 30,
    justifyContent: "center",
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  image: {
    width: 340,
    height: 340,
    resizeMode: 'contain',
  },
});


function mapStateToProps(state) {
  return {
    //state.areas gets data from the store
    //and we are mapping that data to the prop named areas
    userData: state.userData,
    reservationsArray: state.reservationsArray
  }
}

function mapDispatchToProps(dispatch) {
  return {
    updateReservationsArray: (param) => dispatch({ type: "UPDATE_RESERVATIONS_ARRAY", param: param }),
    updateUserData: (param) => dispatch({ type: "UPDATE_USER_DATA", param: param }),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);