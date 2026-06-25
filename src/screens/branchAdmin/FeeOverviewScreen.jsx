import React, {useEffect} from 'react';
import {LoadingScreen} from '../../components';

const FeeOverviewScreen = ({navigation}) => {
  useEffect(() => {
    navigation.replace('FeeDashboard');
  }, [navigation]);
  return <LoadingScreen message="Opening fee dashboard…" />;
};

export default FeeOverviewScreen;
