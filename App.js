import { StatusBar } from 'expo-status-bar';
import { Alert, Button, StyleSheet, Platform, View } from 'react-native';
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device';
import { useEffect } from 'react';

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }
  }
})

export default function App() {
  useEffect(() => {

    async function configPushNotifications() {
      let token
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          alert('Failed to get push token for push notification!');
          return;
        }
        token = (await Notifications.getExpoPushTokenAsync({ projectId: '1a77ffdf-5c86-4a10-9ff7-666c13594dcc' }));
        console.log(token)
      } else {
        alert('Must use physical device for Push Notifications');
      }
    }
    configPushNotifications()
  }, [])
  useEffect(() => {
    const subscription1 = Notifications.addNotificationReceivedListener(
      (notification) => {
        const username = notification.request.content.data.userName
        console.log(username)
      }
    )
    const subscription2 = Notifications.addNotificationResponseReceivedListener((response) => {
      const username = response.notification.request.content.data.userName
      console.log(username)
      console.log('notification response', response);
    })

    return () => {
      subscription1.remove()
      subscription2.remove();
    }
  }, [])
  function scheduleNotificationHandler() {
    Notifications.scheduleNotificationAsync({
      content: {
        title: 'my first local notification',
        body: 'This is the body of the notification',
        data: { userName: 'Max' }
      },
      trigger: {
        seconds: 5
      }
    })
  }

  function sendPushNotificationHandler() {
    fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        to: 'ExponentPushToken[YG3laPLpQpfaDlAE1G7Glh]',
        title: 'Test',
        body: 'This Test Text Comes From The Real Device'
      })
    })
  }
  return (
    <View style={styles.container}>
      <Button title='Schedule Notification' onPress={scheduleNotificationHandler} />
      <Button title='Send Push Notification' onPress={sendPushNotificationHandler} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
