import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MainPage = () => {
  return (
    <View style={styles.container}>
      <Text>This is the Main Page!</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff330',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default MainPage;
