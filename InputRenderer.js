import React from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity, TextInput } from 'react-native';


const InputRenderer = props => {

  //console.info('props ?', props);

  let type = props.configuration ? props.configuration.type : false
  switch (type) {
    case 'selection':
      return (
        <View style={styles.content}>
          {props.configuration.options.map((option, idx) => {
            return (
              <View style={{width: 180, height: 50}} key={idx}>                            
                <TouchableOpacity style={styles.button}>
                  <Text style={{color: 'white'}} onPress={() => {
                    props.handler(option)
                  }}>{option}
                  </Text>
                </TouchableOpacity>
              </View>              
            )        
          })}
        </View>
      )
    case 'modal':
      return (
        <View style={styles.content}>      
          {props.configuration.inputs[0].options.map((place, idx) => {                        
            return (
            <View key={idx}>
              <TouchableOpacity style={styles.button}>                
                <Text 
                  onPress={() => {props.handler(place.text)}}
                  style={{color: 'white'}}>
                  {place.emoji + ' ' + place.text}                  
                </Text>                
              </TouchableOpacity>
            </View>
            )            
          })}         
      </View>
      )
      case 'input-group':
        return(
          <View>
            <Text style={styles.contentTextInput}>                    
              {props.configuration.inputs.map((input, idx) => {
                //console.log('props config', props.configuration)
                // console.log('input yea', input.placeholder  );
                return (                    
                  <TextInput onChangeText={(text) => {props.changeText(idx, text)}} autoFocus={true} key={idx} style={styles.inputText} placeholder={input.placeholder}></TextInput>                                      
                );
              })}     
            </Text>
            
            {/* boton para guardar las direcciones */}
            <View>
              <Text> 
              <TouchableOpacity style={{width:100, height:100}}>                
                <Text style={styles.buttonSend} onPress={props.saveGeoloc}>
                  Guardar            
                </Text>                
              </TouchableOpacity>
              </Text>
            </View>
           
        </View>        
        )        
    default:
      return <Text>''</Text>
  }  
}

const styles = StyleSheet.create({
  content: {    
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10
  }, 
  button: {
    backgroundColor: '#00E0AD',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'white',
    overflow: 'hidden',
    padding: 5,
    marginRight: 10,
    marginLeft: 10,
    alignItems: 'center'    
  },
  buttonSend: {
    width: 100,
    height: 30,
    backgroundColor: '#00E0AD',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'white',
    overflow: 'hidden',
    padding: 5,
    color: '#FFFFFF',
    marginTop: 15,
    marginLeft: 10
  },
  inputText: {
    width: 80,
    height: 30,
    borderColor: '#EBEBEB',
    borderWidth: 1,
    marginTop: 5,
    marginRight: 10,
    marginLeft: 10,
    alignItems: 'center', 
    marginBottom: 10
  },
  contentTextInput: {    
    marginBottom: 10
  }
});



export default InputRenderer
