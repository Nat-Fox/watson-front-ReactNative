import React from 'react';
import { StyleSheet, Text, View, TextInput, Button, ScrollView, Platform } from 'react-native';
import axios from 'axios';
import InputRenderer from './InputRenderer';
import { Constants, Location, Permissions } from 'expo';
import { fetchDistanceMatrix } from './DistanceMatrix';
import moment from 'moment';

export default class App extends React.Component {    

  state = {
    message: '',
    lastResponse: '',
    responses: [],
    latTemp: '',
    lonTemp: '',
    locations: [],
    errorMessage: null,
    location: null
  };

  componentWillMount() {
    console.log('platform', Platform.OS)
    if (Platform.OS === 'android' && !Constants.isDevice) {
      this.setState({
        errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
      });
    } 
    else {
      this._getLocationAsync()          
    }
  }

  componentDidMount = () => {    
    this.sendMessageToWatson('hola')    
  }  

  // Permitir uso de la localización
  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);    
  };

  _watchLocation = () => {
    Location.watchPositionAsync({
      enableHighAccuracy: true,         
      timeInterval: 5000,
      // limite de 10m para entregar la nueva coordenada
      distanceInterval: 10
    }, ({ coords}) => {
      console.log('watching location', coords)
      this.setState({ location: coords})

      let origin = `${coords.latitude}, ${coords.longitude}`
      let destination = `${this.state.locations[1].latitude}, ${this.state.locations[1].longitude}`
      this.measureTimes(origin, destination)

    })
  }  

  sendMessageToWatson = message => {
    axios.post('http://localhost:4500/send-message', {message: message})
      .then(response => {
        //console.info('response by watson is ', response.data)  
        this.setState({
          responses: this.state.responses.concat(response.data.text)
            .concat(response.data.context.inputs) 
        });      
        this.refs.scrollView.scrollTo({x:0, y:0})
      })
      .catch(err => {
        console.info('error ', JSON.stringify(err, null, 4))
      });
  }

  handleChangeMessage = evt => {
    this.setState({
      message: evt.target.value
    });
  }

  sendMessage = () => {
    this.sendMessageToWatson(this.state.message);
  }

  selectionHandler = option => {
    //console.info('selected option is -> ', option)
    this.sendMessageToWatson(option)
  }

  changeText = (idx, text) => {
    
    // console.log('IDX', idx)
    // console.log('TEXT', text)
    if (idx) {
      this.setState({
        lonTemp: text
      })
    } else {
      this.setState({
        latTemp: text
      })
    }
  }

  saveGeoloc = () => {
    // console.log('locations', this.state.locations)
    // console.log('lat', this.state.latTemp)
    // console.log('long', this.state.lonTemp)

    this.setState((prevState) => {
      return {
        locations: prevState.locations.concat([{
          latitude: prevState.latTemp,
          longitude: prevState.lonTemp
        }]), 
        latTemp: '',
        lonTemp: ''
      };
    }, () => {      

      if (this.state.locations.length === 2) {
        this._watchLocation()
        this.setState({
          responses: this.state.responses.concat(['Calculando tus tiempos de desplazamiento'])            
        });        

        let origin = `${this.state.locations[0].latitude}, ${this.state.locations[0].longitude}`
        let destination = `${this.state.locations[1].latitude}, ${this.state.locations[1].longitude}`

        console.log('origin', origin)
        console.log('destination', destination)

        this.measureTimes(origin, destination)
        
      } 
    });      
  }

  measureTimes = (origin, destination) => {
    // calcular ...
    let distances = [
      fetchDistanceMatrix(origin, destination, 'walking'),
      fetchDistanceMatrix(origin, destination, 'driving'),
      fetchDistanceMatrix(origin, destination, 'transit'),
      fetchDistanceMatrix(origin, destination, 'bicycling')
    ]

    Promise.all(distances)            
    .then(response => {
      console.log('origin measures', origin)
      console.log('destination measure', destination)
      console.log('respons in measure time', response)
      let timeWalking = response[0].rows[0].elements[0].duration.text
      let timeDriving = response[1].rows[0].elements[0].duration.text
      let timeTransit = response[2].rows[0].elements[0].duration.text
      //let timeBicycling = response[3].rows[0].elements[0].duration.text
      
      this.setState({
        responses: this.state.responses.concat([`walking: ${ timeWalking}, Driving: ${timeDriving}, Transit: ${timeTransit}`])            
      });
    }).catch(error => {
      console.log('error', error)
    })
  }
  
  render() {
    return (
      <ScrollView ref="scrollView">
        <View style={styles.container}>            
          {this.state.responses.map((message, idx) => {                 
            return (           
              typeof(message) === 'string' ? 
              <Text key={idx} style={styles.message}>
                {message}
              </Text>  : <InputRenderer saveGeoloc={this.saveGeoloc} changeText={this.changeText} handler={this.selectionHandler} configuration={message} key={idx} />
            ) 
          })} 

          {/* Inicio de conversacion  */}   
          <View style={{display:'none'}}>
            <TextInput value={this.state.message} onChange={this.handleChangeMessage} placeholder="Aqui!"></TextInput>           
            <Button onPress={this.sendMessage} title="Learn More" />
          </View>  
                                
        </View>
      </ScrollView>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',    
    marginTop: 70    
  },
  message: {
    backgroundColor: '#513FE5',
    height: 70,
    borderRadius: 10,   
    overflow: 'hidden', 
    color: '#fff',
    paddingTop: 10,
    paddingLeft: 10,
    paddingRight: 10, 
    overflow: 'hidden',
    marginBottom: 5,
    marginLeft: 10,
    width: 280       
  }
});

