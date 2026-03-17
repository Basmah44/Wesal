import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
View,
Text,
TouchableOpacity,
StyleSheet
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { auth } from "./firebaseConfig";

export default function HomeScreen(){

const router = useRouter()

const user = auth.currentUser
const name = user?.displayName || user?.email?.split("@")[0] || "المستخدم"

const [menuVisible,setMenuVisible] = React.useState(false)

return(

<View style={{flex:1}}>

<LinearGradient
colors={['#05010A','#1A0033','#2E005C','#120022']}
start={{x:0,y:0}}
end={{x:1,y:1}}
style={{position:'absolute',width:'100%',height:'100%'}}
/>

<View style={styles.topBar}>

<TouchableOpacity onPress={()=>router.push("/")}>
<Ionicons name="arrow-back" size={28} color="white"/>
</TouchableOpacity>

<TouchableOpacity
onPress={()=>setMenuVisible(!menuVisible)}
>
<Ionicons name="menu" size={28} color="white"/>
</TouchableOpacity>

</View>

<View style={styles.header}>

<Text style={styles.welcome}>
 مرحباً بعودتك {name}
</Text>

<Text style={styles.title}>
الرئيسية
</Text>

<Text style={styles.subtitle}>
مساعد الذكاء الاصطناعي للغة الإشارة
</Text>

</View>

{menuVisible && (

<View style={styles.menuBox}>

<TouchableOpacity
style={styles.menuItem}
onPress={()=>router.push("/Emergency")}
>
<Ionicons name="warning-outline" size={20} color="white"/>
<Text style={styles.menuText}>الطوارئ</Text>
</TouchableOpacity>

<TouchableOpacity
style={styles.menuItem}
onPress={()=>router.push("/Favorites")}
>
<Ionicons name="star-outline" size={20} color="white"/>
<Text style={styles.menuText}>المفضلة</Text>
</TouchableOpacity>

</View>

)}

<View style={styles.centerContainer}>

<View style={styles.aiCard}>

<Ionicons name="sparkles" size={24} color="#a78bfa"/>

<Text style={styles.aiTitle}>
اكتشاف الإشارة بالذكاء الاصطناعي
</Text>

<Text style={styles.aiDescription}>
ترجمة لغة الإشارة بشكل فوري باستخدام الذكاء الاصطناعي
</Text>

</View>

<View style={styles.glow}/>

{/* زر تحويل الإشارة إلى نص */}

<TouchableOpacity
style={styles.mainButton}
activeOpacity={0.85}
onPress={()=>router.push("/SignToText")}
>

<Ionicons name="hand-left" size={26} color="white"/>

<Text style={styles.mainButtonText}>
تحويل الإشارة إلى نص
</Text>

</TouchableOpacity>

{/* زر تحويل النص إلى إشارة */}

<TouchableOpacity
style={styles.secondButton}
activeOpacity={0.85}
onPress={()=>router.push("/TextToSign")}
>

<Ionicons name="swap-horizontal" size={24} color="white"/>

<Text style={styles.secondButtonText}>
تحويل النص إلى إشارة
</Text>

</TouchableOpacity>

<Text style={styles.description}>
اختر الطريقة التي تريد ترجمة لغة الإشارة بها
</Text>

</View>

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

header:{
paddingHorizontal:24,
marginTop:20
},

welcome:{
color:'#ffffff',
fontSize:16,
marginBottom:6,
fontFamily:"calibril-regular"
},

title:{
color:'white',
fontSize:34,
fontFamily:"calibril-bold"
},

subtitle:{
color:'#9f8cff',
marginTop:6,
fontSize:15,
fontFamily:"calibril-regular"
},

centerContainer:{
flex:1,
justifyContent:'center',
alignItems:'center'
},

aiCard:{
backgroundColor:'rgba(255,255,255,0.06)',
padding:20,
borderRadius:20,
alignItems:'center',
width:260,
marginBottom:40
},

aiTitle:{
color:'white',
fontSize:16,
marginTop:8,
fontFamily:"calibril-bold"
},

aiDescription:{
color:'rgba(255,255,255,0.6)',
textAlign:'center',
marginTop:4,
fontSize:13,
fontFamily:"calibril-regular"
},

glow:{
position:'absolute',
width:300,
height:90,
borderRadius:50,
backgroundColor:'#7C3AED',
opacity:0.25
},

mainButton:{
flexDirection:'row',
alignItems:'center',
gap:10,
paddingVertical:18,
paddingHorizontal:40,
borderRadius:40,
backgroundColor:'rgba(255,255,255,0.12)',
borderWidth:1,
borderColor:'rgba(255,255,255,0.2)',
marginBottom:16
},

mainButtonText:{
color:'white',
fontSize:18,
fontFamily:"calibril-bold"
},

secondButton:{
flexDirection:'row',
alignItems:'center',
gap:10,
paddingVertical:16,
paddingHorizontal:36,
borderRadius:40,
backgroundColor:'rgba(255,255,255,0.12)',
borderWidth:1,
borderColor:'rgba(255,255,255,0.2)'
},

secondButtonText:{
color:'white',
fontSize:17,
fontFamily:"calibril-bold"
},

description:{
marginTop:18,
color:'rgba(255,255,255,0.6)',
textAlign:'center',
width:260,
fontFamily:"calibril-regular"
},

menuBox:{
position:'absolute',
top:110,
right:20,
backgroundColor:'#1a0033',
padding:18,
borderRadius:16,
width:200,
shadowColor:'#000',
shadowOpacity:0.3,
shadowRadius:10,
elevation:10
},

menuItem:{
flexDirection:'row',
alignItems:'center',
marginBottom:15,
gap:10
},

menuText:{
color:'white',
fontSize:16,
fontFamily:"calibril-regular"
}

})
