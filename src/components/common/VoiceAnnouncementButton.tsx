import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ActivityIndicator, Pressable, StyleSheet} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import ttsService from '../../services/tts/TTSService';
import {colors, radius} from '../../theme';

type Status = 'idle' | 'loading' | 'playing';

interface Props {
  text: string;
  size?: number;
}

const VoiceAnnouncementButton = ({text, size = 18}: Props) => {
  const [status, setStatus] = useState<Status>('idle');
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const set = useCallback((s: Status) => {
    if (mountedRef.current) {setStatus(s);}
  }, []);

  const handlePress = useCallback(async () => {
    if (status === 'playing' || status === 'loading') {
      ttsService.stop();
      set('idle');
      return;
    }

    set('loading');
    await ttsService.speak(text, {
      onStart: () => set('playing'),
      onFinish: () => set('idle'),
      onCancel: () => set('idle'),
    });
  }, [status, text, set]);

  if (status === 'loading') {
    return (
      <Pressable style={styles.btn} hitSlop={8}>
        <ActivityIndicator size="small" color={colors.primary} />
      </Pressable>
    );
  }

  const isPlaying = status === 'playing';

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={8}
      style={({pressed}) => [
        styles.btn,
        isPlaying && styles.btnPlaying,
        pressed && styles.btnPressed,
      ]}>
      <MaterialCommunityIcons
        name={isPlaying ? 'stop-circle-outline' : 'volume-high'}
        size={size}
        color={isPlaying ? colors.danger : colors.primary}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    backgroundColor: colors.primaryFaint,
    borderColor: colors.primarySoft,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  btnPlaying: {
    backgroundColor: colors.dangerSoft,
    borderColor: `${colors.danger}40`,
  },
  btnPressed: {
    opacity: 0.75,
  },
});

export default VoiceAnnouncementButton;
