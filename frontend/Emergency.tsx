import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect } from 'react';
import {
View,
Text,
TouchableOpacity,
StyleSheet,
TextInput,
FlatList,
Alert
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SMS from 'expo-sms';

export default function Emergency(){

const router = useRouter()

const [number,setNumber] = useState("")
const [contacts,setContacts] = useState<string[]>([])

useEffect(()=>{
loadContacts()
},[])

const loadContacts = async()=>{
const saved = await AsyncStorage.getItem("emergency_contacts")
if(saved){
setContacts(JSON.parse(saved))
}
}

const saveContacts = async(list:any)=>{
setContacts(list)
await AsyncStorage.setItem("emergency_contacts",JSON.stringify(list))
}

const addNumber = async()=>{

if(number.trim()===""){
Alert.alert("إدخل رقم هاتف صالح")
return
}

const newList = [...contacts,number]

saveContacts(newList)

setNumber("")
}

const deleteNumber = (index:number)=>{

const newList = contacts.filter((_,i)=>i!==index)

saveContacts(newList)

}

const sendEmergency = async()=>{

if(contacts.length===0){
Alert.alert("إدخل رقم هاتف واحد على الأقل")
return
}

const available = await SMS.isAvailableAsync()

if(!available){
Alert.alert("الإرسال غير متاح على هذا الجهاز")
return
}

await SMS.sendSMSAsync(
contacts,
"إريد مساعدة طارئة! هذا تنبيه تم إرساله من تطبيق مساعد لغة الإشارة. الرجاء التواصل مع الأسعاف ."
)

}

return(

<View style={{flex:1}}>

<LinearGradient
colors={['#05010A','#1A0033','#2E005C','#120022']}
style={{position:'absolute',width:'100%',height:'100%'}}
/>

<View style={styles.header}>

<TouchableOpacity onPress={()=>router.back()}>
<Ionicons name="arrow-back" size={28} color="white"/>
</TouchableOpacity>

<Text style={styles.title}>
Emergency
</Text>

<View style={{width:28}}/>

</View>

<View style={styles.container}>

<View style={styles.inputBox}>

<TextInput
placeholder="أدخل رقم هاتف"
placeholderTextColor="#aaa"
value={number}
onChangeText={setNumber}
style={styles.input}
/>

<TouchableOpacity onPress={addNumber}>
<Ionicons name="add-circle" size={32} color="#7C3AED"/>
</TouchableOpacity>

</View>

<FlatList
data={contacts}
keyExtractor={(item,index)=>index.toString()}
renderItem={({item,index})=>(
<View style={styles.contactRow}>

<Text style={styles.contactText}>
{item}
</Text>

<TouchableOpacity onPress={()=>deleteNumber(index)}>
<Ionicons name="trash" size={22} color="#ff3b3b"/>
</TouchableOpacity>

</View>
)}
/>

<View style={{height:30}}/>

<TouchableOpacity
style={styles.emergencyButton}
onPress={sendEmergency}
>

<Ionicons name="warning" size={40} color="white"/>

<Text style={styles.emergencyText}>
أرسل تنبيه الطوارئ لقائمة الاتصال
</Text>

</TouchableOpacity>

</View>

</View>

)

}

const styles = StyleSheet.create({

header:{
marginTop:60,
paddingHorizontal:20,
flexDirection:'row',
alignItems:'center',
justifyContent:'space-between'
},

title:{
color:'white',
fontSize:24,
fontWeight:'900'
},

container:{
flex:1,
padding:20
},

inputBox:{
flexDirection:'row',
alignItems:'center',
backgroundColor:'rgba(255,255,255,0.1)',
borderRadius:15,
paddingHorizontal:15,
marginBottom:20
},

input:{
flex:1,
color:'white',
paddingVertical:12
},

contactRow:{
flexDirection:'row',
justifyContent:'space-between',
alignItems:'center',
backgroundColor:'rgba(255,255,255,0.08)',
padding:14,
borderRadius:12,
marginBottom:10
},

contactText:{
color:'white'
},

emergencyButton:{
backgroundColor:'#ff3b3b',
padding:20,
borderRadius:20,
alignItems:'center',
shadowColor:'#ff0000',
shadowOpacity:0.8,
shadowRadius:20,
elevation:15
},

emergencyText:{
color:'white',
fontWeight:'bold',
marginTop:5
}

})
