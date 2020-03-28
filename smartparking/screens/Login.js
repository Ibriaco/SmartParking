import React, { Component } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  StyleSheet,
  View,
  Image
} from "react-native";
import * as Permissions from 'expo-permissions';
import * as firebase from 'firebase'
import * as Facebook from "expo-facebook";
import * as Constants from "expo-constants";
import * as Google from 'expo-google-app-auth';


import { Button, Block, Text } from "../components";
import { theme } from "../constants";
import { AntDesign, Entypo, FontAwesome } from "@expo/vector-icons";
import { SocialIcon } from 'react-native-elements'

import { Input, Icon } from "galio-framework"

 

class Login extends Component {
  state = {
    email: "",
    password: "",
    errorMessage: null
  };

  handleLogin() {
    const { navigation } = this.props;
    const { email, password } = this.state;

    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(() => this.props.navigation.navigate("Home"))
      .catch(error => this.setState({ errorMessage: error.message }));
      //this.props.navigation.navigate("Home")

    Keyboard.dismiss();
  }

  async signInWithGoogle() {
    try {
      const result = await Google.logInAsync({
        androidClientId: "712869520957-b7t4ngd62o00dnps2q6fprb5c4k8d8qp.apps.googleusercontent.com",
        //iosClientId: "712869520957-4nvk32j2pg2q85enijr98krkdctfrtm9.apps.googleusercontent.com",
        iosClientId: "712869520957-udo11tdug2hncpm1ela42eaq8to4p1ft.apps.googleusercontent.com",
        scopes: ['profile', 'email'],
      });
      console.log(result);
      if (result.type === 'success') {
        this.props.navigation.navigate("Home")
        return result.accessToken;
      } else {
        console.log("cancelled")
      }
    } catch (e) {
      console.log("error")
    }
  }


  signInWithFacebook = async () => {
    //const appId = "280118969668120"
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
        .then(() => this.props.navigation.navigate("Home"))
        .catch(error => this.setState({ errorMessage: error.message }));; // Sign in with Facebook credential
      //console.log(facebookProfileData);
    }
  };

  
  render() {
    const { navigation } = this.props;

    return (
      <View style={styles.login}>
        <Block padding={[0, theme.sizes.base * 2]}>
          <Text h1 bold>
          </Text>
          <Text h1 bold>
          Login
          </Text>
          <Text gray2 h3>Enter your credentials to sign in</Text>
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
              <Text
                gray2
                h4
                right
                style={{ textDecorationLine: "underline" }}>
                Forgot your password?
            </Text>
            </Button>

            <Text></Text>
            <Block >
              <Text></Text>
              <Text center gray2 h4>login with</Text>

              <View style={styles.social}>
                <Button style={styles.facebook} onPress={()=>this.signInWithGoogle()} >
                  <SocialIcon
                    type="google"
                    light
                  />
                </Button>
                <Text center gray2 h4>      </Text>
                <Button style={styles.google} onPress={()=>this.signInWithFacebook()}>
                  <SocialIcon
                    type="facebook"
                    light
                  />
                </Button>

              </View>


            </Block>

          </Block>
          <Block bottom style={styles.bottom}>
            <Button style={styles.loginButton} onPress={()=>this.signInWithGoogle()}>
              <Text h2 bold white center>
                Login
                </Text>
            </Button>
            <Button style={styles.registerButton} onPress={() => navigation.navigate("Register")}>
              <Text h2 bold black center>
                Register
                </Text>
            </Button>
          </Block>
        </Block>
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
    height: 60

    // borderBottomColor: theme.colors.gray2,
    //borderBottomWidth: StyleSheet.hairlineWidth
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
    backgroundColor: '#ffffff',
    height: 60,
    borderRadius: 16,
    marginHorizontal: 25,
    shadowOpacity: 0.3,
    shadowOffset: {width: 0, height: 2},
    elevation: 6,
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
    //justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    shadowOpacity: 0.2,
    elevation: 6,
  },
  facebook: {
    backgroundColor: '#fff',
    height: 40,
    width: 40,
    //justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    shadowOpacity: 0.2,
    elevation: 6,
  },
  forget: {
    height: 3,
  },
  error: {
    color: "#F14336",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center"
  },
  errorMessage: {
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 30,
  }
});

export default Login;