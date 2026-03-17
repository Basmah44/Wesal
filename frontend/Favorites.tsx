import React, { useEffect, useState } from "react";
import {
View,
Text,
StyleSheet,
ScrollView,
TouchableOpacity,
Image
} from "react-native";

import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import labelsAr from "../backend/models/labels_ar.json";
const SIGN_IMAGES = {
Home: require("../assets/images/sign_images/Home.png"),
School: require("../assets/images/sign_images/School.png"),
Friend: require("../assets/images/sign_images/Friend.png"),
Father: require("../assets/images/sign_images/Father.png"),
Mother: require("../assets/images/sign_images/Mother.png"),
Company: require("../assets/images/sign_images/Company.png"),
Good: require("../assets/images/sign_images/Good.png"),
Smile: require("../assets/images/sign_images/Smile.png"),
Sorry: require("../assets/images/sign_images/Sorry.png")
};

export default function Favorites(){

const router = useRouter()

const [favorites,setFavorites] = useState([])

useEffect(()=>{
loadFavorites()
},[])

const loadFavorites = async () => {

const data = await AsyncStorage.getItem("favorites")

if(data){
setFavorites(JSON.parse(data))
}

}

const removeFavorite = async (item:string) => {

const updated = favorites.filter(f => f !== item)

setFavorites(updated)

await AsyncStorage.setItem("favorites",JSON.stringify(updated))

}

return(

<View style={{flex:1}}>

<LinearGradient
colors={['#05010A','#1A0033','#2E005C','#120022']}
style={{position:'absolute',width:'100%',height:'100%'}}
/>

<View style={styles.topBar}>

<TouchableOpacity onPress={()=>router.back()}>
<Ionicons name="arrow-back" size={28} color="white"/>
</TouchableOpacity>

<Text style={styles.title}>
المفضلة
</Text>

<View style={{width:28}}/>

</View>

{favorites.length === 0 ? (

<View style={styles.emptyContainer}>

<Ionicons name="star-outline" size={70} color="#bbb"/>

<Text style={styles.emptyTitle}>
لا توجد مفضلة بعد
</Text>

<Text style={styles.emptySub}>
الإشارات التي تحفظها ستظهر هنا
</Text>

</View>

):(

<ScrollView
contentContainerStyle={styles.grid}
showsVerticalScrollIndicator={false}
>

{favorites.map((item,index)=>(

<View key={index} style={styles.card}>

<Image
source={SIGN_IMAGES[item]}
style={styles.image}
resizeMode="contain"
/>

<Text style={styles.word}>
{labelsAr[item]||item}
</Text>

<TouchableOpacity
style={styles.remove}
onPress={()=>removeFavorite(item)}
>

<Ionicons name="trash-outline" size={18} color="white"/>

</TouchableOpacity>

</View>

))}

</ScrollView>

)}

</View>

)

}

const styles = StyleSheet.create({

topBar:{
marginTop:60,
paddingHorizontal:20,
flexDirection:'row',
justifyContent:'space-between',
alignItems:'center'
},

title:{
color:'white',
fontSize:26,
fontWeight:'600'
},

emptyContainer:{
flex:1,
justifyContent:'center',
alignItems:'center'
},

emptyTitle:{
color:'white',
fontSize:20,
marginTop:20
},

emptySub:{
color:'#bbb',
marginTop:6
},

grid:{
flexDirection:'row',
flexWrap:'wrap',
justifyContent:'center',
padding:20
},

card:{
width:150,
height:180,
margin:10,
borderRadius:25,
backgroundColor:'rgba(255,255,255,0.08)',
borderWidth:1,
borderColor:'rgba(255,255,255,0.15)',
alignItems:'center',
justifyContent:'center',
backdropFilter:'blur(20px)'
},

image:{
width:90,
height:90
},

word:{
color:'white',
marginTop:8,
fontSize:16
},

remove:{
position:'absolute',
top:10,
right:10,
backgroundColor:'#7C3AED',
borderRadius:20,
padding:6
}

})
