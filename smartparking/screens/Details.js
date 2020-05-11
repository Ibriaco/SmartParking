import React, { Component } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Divider, Button, Block, Text, Switch } from "../components";
import { theme, mocks } from "../constants";
import * as Animatable from 'react-native-animatable';
import { connect } from 'react-redux';
import { Input, Icon } from "galio-framework"
import * as Progress from 'react-native-progress';

  
class Details extends Component {
  constructor(props) {
    super(props);

  this.state = {
    showPicker: false,
    selectedTime: 0,
    timeInMS: 0, 
    isTimeSelected: false, 
    userBonus: 1.00,
    userProgress: 50,
    notificationsEnabled: false
  };
  }
  
render(){
  return (
    <View style={{flex: 1}}>

<View style={{paddingTop:50}}>

  <Text h1 black center style={{fontFamily: 'Helvetica-Bold'}}>
      Parking Details
  </Text>
  
  <Text h2 black center style={{fontFamily: 'Montserrat'}}>
      Choose all the options for your stop at
  </Text>

  <Text h2 secondary center style={{fontFamily: 'Montserrat'}}>
      {this.props.tappedArea.address}
  </Text>

  <Button style={{backgroundColor: "black"}} onPress={() => this.setState({showPicker: true})}>
    <Text h2 white center style={{fontFamily: 'Montserrat-Bold'}}>
    Time
    </Text>
  </Button>

  {this.state.isTimeSelected &&
  <Text h2 black center style={{fontFamily: 'Montserrat-Bold'}}>
    From now to: {this.state.selectedTime}
  </Text>
}
  {(this.state.isTimeSelected && this.props.tappedArea.price > 0) &&
  <Text h2 black center style={{fontFamily: 'Montserrat-Bold'}}>
    Price: {(((this.state.timeInMS - (new Date()).getTime()) / 3600000 ) * this.props.tappedArea.price).toFixed(2) + " €"}
  </Text>
}


<Text h2 black center style={{fontFamily: 'Montserrat-Bold'}}>
</Text>


{this.props.tappedArea.price > 0 &&
<View style={{shadowOpacity: 0.5,
        backgroundColor: '#fff', borderRadius: 20, elevation: 16}}>
<Text h2 black center style={{fontFamily: 'Montserrat'}}>
    Favourite Payment Method
  </Text>
  <Text h2 black center style={{fontFamily: 'Montserrat'}}>
    edit
  </Text>
 
  </View>
}

  <Text h2 black center style={{fontFamily: 'Montserrat-Bold'}}>
</Text>

{this.props.tappedArea.price > 0 &&

<Input
              placeholder ="DX 999 SS"
              editable={false}
              right
              icon="car"
              family="font-awesome"
              iconSize={18}
              iconColor="#a5a5a5"
              onChangeText={email => this.setState({ email })}
              value={this.state.email}
            />
}

  <Text h2 black center style={{fontFamily: 'Montserrat-Bold'}}>
</Text>

{(this.state.isTimeSelected && this.props.tappedArea.price > 0) &&

  <Text h2 black center style={{fontFamily: 'Montserrat-Bold'}}>
    Bonus: {this.state.userBonus.toFixed(2)} €
  </Text>
}
  {(this.state.isTimeSelected && this.props.tappedArea.price > 0) &&

<Text h2 black center style={{fontFamily: 'Montserrat-Bold'}}>
    Total: {((((this.state.timeInMS - (new Date()).getTime()) / 3600000 ) * this.props.tappedArea.price) - this.state.userBonus).toFixed(2)} €
  </Text>
  }

  {this.props.tappedArea.price == 0 &&
  <Button style={{backgroundColor: "gray"}}>
    <Text h2 black center style={{fontFamily: 'Montserrat-Bold'}}>
      Skip
    </Text>
  </Button>
  }

  {(this.state.isTimeSelected && this.props.tappedArea.price == 0) &&
  <Button style={{backgroundColor: "orange"}} onPress={() => this.setState({userProgress: this.state.userProgress + 10})}>
    <Text h2 black center style={{fontFamily: 'Montserrat-Bold'}}>
      Continue
    </Text>
  </Button>
  }

  {(this.state.isTimeSelected && this.props.tappedArea.price > 0) &&
  <Button style={{backgroundColor: "blue"}} onPress={() => this.setState({userProgress: this.state.userProgress + 40})}>
    <Text h2 black center style={{fontFamily: 'Montserrat-Bold'}}>
      Pay
    </Text>
  </Button>
  }




<Text h2 black center style={{fontFamily: 'Montserrat-Bold'}}>
</Text>


{(this.state.isTimeSelected && this.props.tappedArea.price > 0) &&
  <View>
    <Text h2 black center style={{fontFamily: 'Montserrat-Bold'}}>
      With this payment you will get 
    </Text>

    <Text h1 black center style={{fontFamily: 'Montserrat-Bold'}}>
    {((((this.state.timeInMS - (new Date()).getTime()) / 3600000 ) * this.props.tappedArea.price) - this.state.userBonus).toFixed(1) * 5}
    </Text>

    <Text h2 black center style={{fontFamily: 'Montserrat-Bold'}}>
      bonus points!
    </Text>

    </View>
}


{(this.state.isTimeSelected && this.props.tappedArea.price == 0) &&
  <View>
    <Text h2 black center style={{fontFamily: 'Montserrat-Bold'}}>
      By telling us when you will leave you will get 
    </Text>

    <Text h1 black center style={{fontFamily: 'Montserrat-Bold'}}>
    10
    </Text>

    <Text h2 black center style={{fontFamily: 'Montserrat-Bold'}}>
      bonus points!
    </Text>

    </View>
}
<Progress.Bar progress={(this.state.userProgress / 100)} height = {20} width={null} color="rgba(255, 22, 44, 0.2)"/>



{this.state.isTimeSelected  &&
  <View>
    <Text h2 black center style={{fontFamily: 'Montserrat-Bold'}}>
      Notifications? 
    </Text>

    <Switch
                value={this.state.notificationsEnabled}
                onValueChange={value => {
                  this.setState({ notificationsEnabled: value })
              }}
              />

    </View>
}




  </View>
          
    <DateTimePickerModal
    isVisible={this.state.showPicker}
    mode="time"
    date={new Date()}
    onCancel={() => console.log("cancel")}
    onConfirm={(date) => {
      if(date > new Date())
        this.setState({
          isTimeSelected: true,
          selectedTime: date.toLocaleTimeString(),
          timeInMS: date.getTime(),
          showPicker: false})
        }}/>

  </View>
  );
};
}

function mapStateToProps(state) {
  return {
    //state.areas gets data from the store
    //and we are mapping that data to the prop named areas
    tappedArea: state.tappedArea
  }
}

function mapDispatchToProps(dispatch) {
  return {
    updateUserData: (param) => dispatch({ type: "UPDATE_USER_DATA", param: param }),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Details);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: theme.sizes.base * 2
  },
  avatar: {
    height: theme.sizes.base * 2.2,
    width: theme.sizes.base * 2.2
  },
  inputs: {
    marginTop: theme.sizes.base * 0.7,
    paddingHorizontal: theme.sizes.base * 2
  },
  inputRow: {
    alignItems: "flex-end"
  },
  sliders: {
    marginTop: theme.sizes.base * 2,
    //paddingHorizontal: theme.sizes.base * 2
  },
  thumb: {
    width: theme.sizes.base*1.2 ,
    height: theme.sizes.base*1.2 ,
    borderRadius: theme.sizes.base*1.2 ,
    borderColor: "white",
    borderWidth: 3,
    backgroundColor:"white",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
  },
  button: {
    backgroundColor: '#03A696',
    height: 60,
    borderRadius: 20,
    marginHorizontal: 45,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
    marginBottom: 30,
  },
  filterButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.5)",
    height: 40,
    width: 70,
    borderRadius: 8,
    marginHorizontal: 45,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 6,
    marginBottom: 30,
  },
  filterButtonTriggered: {
    backgroundColor: 'rgba(3, 166, 150, 0.10)',
    borderWidth: 1,
    borderColor: "#03A696",
    height: 40,
    width: 70,
    borderRadius: 8,
    marginHorizontal: 45,
    marginBottom: 30
  },
  add: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
    alignSelf:"flex-end",
    shadowOpacity: 0.3,
    shadowOffset: {width: 0, height: 2},
    elevation: 6,
    bottom: 60,
    position: "absolute"


  }
});
