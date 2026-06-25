import React, {useEffect} from 'react';
import {LoadingScreen} from '../../components';

const ViewAllFeesScreen = ({navigation}) => {
  useEffect(() => {
    navigation.replace('FeeReports');
  }, [navigation]);
  return <LoadingScreen message="Opening fee reports…" />;
};

export default ViewAllFeesScreen;
