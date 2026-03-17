import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from 'firebase/auth';

import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { auth } from './firebaseConfig';

const SignPage = () => {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');

  const niceAuthError = (code?: string) => {
    switch (code) {
      case 'auth/invalid-email':
        return 'صيغة البريد الإلكتروني غير صحيحة.';
      case 'auth/user-not-found':
        return 'لا يوجد حساب لهذا البريد الإلكتروني.';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
      case 'auth/email-already-in-use':
        return 'هذا البريد الإلكتروني مسجل مسبقاً.';
      case 'auth/weak-password':
        return 'كلمة المرور ضعيفة. استخدم 6 أحرف على الأقل.';
      case 'auth/network-request-failed':
        return 'مشكلة في الاتصال بالإنترنت.';
      default:
        return 'حدث خطأ غير متوقع.';
    }
  };

  const handleMainAction = async () => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password;

    if (!cleanEmail || !cleanPassword) {
      alert('يرجى تعبئة جميع الحقول');
      return;
    }

    if (!isLogin) {
      if (!firstName.trim() || !lastName.trim() || !phone.trim() || !gender.trim()) {
        alert('يرجى تعبئة جميع بيانات التسجيل');
        return;
      }
      if (cleanPassword !== confirmPassword) {
        alert('كلمتا المرور غير متطابقتين');
        return;
      }
    }

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      } else {
        await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      }

      router.replace('/HomeScreen');
    } catch (error: any) {
      const msg = niceAuthError(error?.code);
      alert(msg);
    }
  };

  const handleForgetPassword = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      alert('أدخل البريد الإلكتروني أولاً');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      alert('تم إرسال رابط إعادة تعيين كلمة المرور');
    } catch (error: any) {
      alert(niceAuthError(error?.code));
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View style={{ flex: 1 }}>
        <LinearGradient
          colors={['#05010A', '#1A0033', '#2E005C', '#120022']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ position: 'absolute', width: '100%', height: '100%' }}
        />

        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: 20,
            paddingVertical: 40,
          }}
        >
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Text style={{
              color: 'white',
              fontSize: 42,
              fontWeight: '900',
              marginBottom: 6,
              fontFamily: 'calibril-bold'
            }}>
              وصال
            </Text>

            <Text style={{
              color: '#D7C5FF',
              fontSize: 16,
              textAlign: 'center',
              fontFamily: 'calibril-regular'
            }}>
              {isLogin ? 'مرحباً بعودتك' : 'إنشاء حساب جديد'}
            </Text>
          </View>

          <LinearGradient
            colors={['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.05)']}
            style={{
              width: '100%',
              borderRadius: 30,
              padding: 22,
            }}
          >

            <Text style={{
              color: 'white',
              fontSize: 30,
              fontWeight: '900',
              textAlign: 'center',
              marginBottom: 18
            }}>
              {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'}
            </Text>

            {!isLogin && (
              <>
                <Row>
                  <Input label="الاسم الأول" value={firstName} onChangeText={setFirstName} icon="person-outline" />
                  <Input label="اسم العائلة" value={lastName} onChangeText={setLastName} icon="person-outline" />
                </Row>

                <Row>
                  <Input label="رقم الجوال" value={phone} onChangeText={setPhone} icon="call-outline" />
                  <Input label="الجنس" value={gender} onChangeText={setGender} icon="transgender" material />
                </Row>
              </>
            )}

            <FullInput label="البريد الإلكتروني" value={email} onChangeText={setEmail} icon="mail-outline" />

            <FullInput
              label="كلمة المرور"
              value={password}
              onChangeText={setPassword}
              icon="lock-closed-outline"
              secureTextEntry={!showPassword}
            />

            {!isLogin && (
              <FullInput
                label="تأكيد كلمة المرور"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                icon="lock-closed-outline"
                secureTextEntry={!showPassword}
              />
            )}

            {isLogin && (
              <TouchableOpacity onPress={handleForgetPassword}>
                <Text style={{
                  color: '#D7C5FF',
                  textAlign: 'right',
                  marginTop: 2
                }}>
                  هل نسيت كلمة المرور؟
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={handleMainAction}>
              <LinearGradient
                colors={['#B56BFF', '#7C3AED']}
                style={{
                  paddingVertical: 17,
                  borderRadius: 20,
                  marginTop: 22,
                }}
              >
                <Text style={{
                  color: 'white',
                  textAlign: 'center',
                  fontWeight: '900',
                  fontSize: 16
                }}>
                  {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <Pressable onPress={() => setIsLogin(!isLogin)} style={{ marginTop: 18 }}>
              <Text style={{ color: 'white', textAlign: 'center' }}>
                {isLogin ? 'ليس لديك حساب؟ ' : 'لديك حساب بالفعل؟ '}
                <Text style={{ color: '#D7C5FF', fontWeight: '800' }}>
                  {isLogin ? 'إنشاء حساب' : 'تسجيل الدخول'}
                </Text>
              </Text>
            </Pressable>

          </LinearGradient>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

export default SignPage;



const Row = ({ children }: any) => (
  <View style={{
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  }}>
    {children}
  </View>
);



const Input = ({ label, value, onChangeText, icon, material }: any) => (
  <View style={{ width: '48%', marginBottom: 12 }}>

    <Text style={{
      color: '#F5EEFF',
      marginBottom: 6,
      fontSize: 12,
      fontWeight: '700'
    }}>
      {label}
    </Text>

    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.10)',
      borderRadius: 16,
      paddingHorizontal: 12,
    }}>

      {material
        ? <MaterialIcons name={icon} size={18} color="#EADFFF" />
        : <Ionicons name={icon} size={18} color="#EADFFF" />}

      <TextInput
        value={value}
        onChangeText={onChangeText}
        style={{
          flex: 1,
          color: 'white',
          paddingVertical: 13,
          marginLeft: 10
        }}
      />

    </View>

  </View>
);



const FullInput = ({
  label,
  value,
  onChangeText,
  icon,
  secureTextEntry
}: any) => (

  <View style={{ width: '100%', marginBottom: 12 }}>

    <Text style={{
      color: '#F5EEFF',
      marginBottom: 6,
      fontSize: 12,
      fontWeight: '700'
    }}>
      {label}
    </Text>

    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.10)',
      borderRadius: 16,
      paddingHorizontal: 12,
    }}>

      <Ionicons name={icon} size={18} color="#EADFFF" />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        style={{
          flex: 1,
          color: 'white',
          paddingVertical: 13,
          marginLeft: 10
        }}
      />

    </View>

  </View>

);
