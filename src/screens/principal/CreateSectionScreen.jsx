import React, {useEffect} from 'react';
import {LoadingScreen} from '../../components';

const CreateSectionScreen = ({navigation}) => {
  useEffect(() => {
    navigation.replace('SectionManagement');
  }, [navigation]);

  return <LoadingScreen message="Opening section management" />;
};

export default CreateSectionScreen;
