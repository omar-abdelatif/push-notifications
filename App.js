import { StatusBar } from 'expo-status-bar';
import { Alert, Button, StyleSheet, Platform, View } from 'react-native';
import * as Notifications from 'expo-notifications'
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
      const { status } = await Notifications.getPermissionsAsync()
      let finalStatus = status

      if (finalStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync()
        finalStatus = status
      }

      if (finalStatus !== 'granted') {
        Alert.alert('Permission Required', 'Push notifications need the appropriate permissions')
        return
      }

      const pushTokenData = await Notifications.getExpoPushTokenAsync({ projectId: '1a77ffdf-5c86-4a10-9ff7-666c13594dcc' }).data;
      console.log(pushTokenData)

      if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.DEFAULT,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        })
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
  function schefuleNotificationHandler() {
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
  return (
    <View style={styles.container}>
      <Button title='Schedule Notification' onPress={schefuleNotificationHandler} />
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
