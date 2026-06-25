import React, {useEffect, useRef, useState} from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

const {width: W} = Dimensions.get('window');

const NAVY  = '#1F3E66';
const GREEN = '#3DAE49';
const WHITE = '#FFFFFF';
const CREAM = '#F7F9FC';

const LOGO_W = W * 0.44;
const LOGO_H = LOGO_W * 1.62;
const NETWORK_OFFSET_X = 80;

// Constellation nodes (viewBox coords within SVG width=160 height=90)
const NODES = [
  {id: 'n0', x: 80,  y: 10},
  {id: 'n1', x: 115, y: 25},
  {id: 'n2', x: 148, y: 18},
  {id: 'n3', x: 130, y: 55},
  {id: 'n4', x: 95,  y: 40},
  {id: 'n5', x: 155, y: 50},
  {id: 'n6', x: 108, y: 72},
  {id: 'n7', x: 140, y: 80},
];

const EDGES = [
  ['n0', 'n1'], ['n1', 'n2'], ['n2', 'n5'],
  ['n1', 'n4'], ['n4', 'n3'], ['n3', 'n5'],
  ['n3', 'n6'], ['n5', 'n7'], ['n6', 'n7'],
  ['n0', 'n4'], ['n2', 'n3'],
];

const nodeMap = Object.fromEntries(NODES.map(n => [n.id, n]));

// ── Letter-by-letter text reveal ──────────────────────────────────────────────
const AnimatedLetters = ({text, style, startDelay = 0, letterDelay = 55}) => {
  const opacities = useRef(text.split('').map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.parallel(
      text.split('').map((_, i) =>
        Animated.timing(opacities[i], {
          toValue: 1, duration: 180,
          delay: startDelay + i * letterDelay,
          easing: Easing.out(Easing.quad), useNativeDriver: true,
        }),
      ),
    ).start();
  }, [letterDelay, opacities, startDelay, text]);

  return (
    <View style={styles.lettersRow}>
      {text.split('').map((char, i) => (
        <Animated.Text key={i} style={[style, {opacity: opacities[i]}]}>
          {char}
        </Animated.Text>
      ))}
    </View>
  );
};

// ── Tech-network overlay ──────────────────────────────────────────────────────
// Uses a single Animated.Value (progress 0→1) to stagger edges + nodes.
// Nodes use fixed radius (no animated r) to avoid Android radius=0 crash.
const TechNetwork = ({progress}) => (
  <View style={styles.svgNetworkWrap} pointerEvents="none">
    {EDGES.map(([a, b], i) => {
      const na = nodeMap[a];
      const nb = nodeMap[b];
      const ax = na.x - NETWORK_OFFSET_X;
      const bx = nb.x - NETWORK_OFFSET_X;
      const dx = bx - ax;
      const dy = nb.y - na.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = `${Math.atan2(dy, dx)}rad`;
      const t0 = (i / EDGES.length) * 0.7;
      const t1 = Math.min(t0 + 0.3, 1);
      const opacity = progress.interpolate({
        inputRange: [t0, t1], outputRange: [0, 0.55], extrapolate: 'clamp',
      });
      return (
        <Animated.View
          key={`e${i}`}
          style={[
            styles.networkEdge,
            {left: ax, opacity, top: na.y, transform: [{rotate: angle}], width: length},
          ]}
        />
      );
    })}

    {NODES.map((node, i) => {
      const t0 = (i / NODES.length) * 0.65;
      const t1 = Math.min(t0 + 0.25, 1);
      const opacity = progress.interpolate({
        inputRange: [t0, t1], outputRange: [0, 1], extrapolate: 'clamp',
      });
      const size = i % 3 === 0 ? 7 : 4.4;
      return (
        <Animated.View
          key={node.id}
          style={[
            styles.networkNode,
            {
              height: size,
              left: node.x - NETWORK_OFFSET_X - size / 2,
              opacity,
              top: node.y - size / 2,
              width: size,
            },
          ]}
        />
      );
    })}
  </View>
);

// ── SplashScreen ──────────────────────────────────────────────────────────────
const SplashScreen = ({onFinish}) => {
  // Phase 1 — background fade
  const bgAnim      = useRef(new Animated.Value(0)).current;

  // Phase 2 — logo reveal
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale   = useRef(new Animated.Value(0.8)).current;
  const logoTransY  = useRef(new Animated.Value(24)).current;

  // Phase 3 — tech network
  const netProgress = useRef(new Animated.Value(0)).current;

  // Phase 4 — text reveal
  const [showTitle,    setShowTitle]    = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const subtitleOp   = useRef(new Animated.Value(0)).current;

  // Phase 5 — tagline + system
  const [showTagline, setShowTagline] = useState(false);
  const taglineOp    = useRef(new Animated.Value(0)).current;
  const dividerScale = useRef(new Animated.Value(0)).current;
  const systemOp     = useRef(new Animated.Value(0)).current;

  // Exit
  const screenOp = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Phase 1 — 0ms
    Animated.timing(bgAnim, {
      toValue: 1, duration: 250,
      easing: Easing.out(Easing.quad), useNativeDriver: false,
    }).start();

    // Phase 2 — 80ms
    setTimeout(() => {
      Animated.parallel([
        Animated.spring(logoScale,  {toValue: 1, tension: 70, friction: 8, useNativeDriver: true}),
        Animated.timing(logoOpacity, {toValue: 1, duration: 360, easing: Easing.out(Easing.cubic), useNativeDriver: true}),
        Animated.timing(logoTransY,  {toValue: 0, duration: 360, easing: Easing.out(Easing.cubic), useNativeDriver: true}),
      ]).start();
    }, 80);

    // Phase 3 — 320ms
    setTimeout(() => {
      Animated.timing(netProgress, {
        toValue: 1, duration: 500,
        easing: Easing.out(Easing.quad), useNativeDriver: false,
      }).start();
    }, 320);

    // Phase 4 — 520ms school name, 820ms badge
    setTimeout(() => setShowTitle(true), 520);
    setTimeout(() => {
      setShowSubtitle(true);
      Animated.timing(subtitleOp, {toValue: 1, duration: 220, useNativeDriver: true}).start();
    }, 820);

    // Phase 5 — 1000ms tagline, 1180ms system text
    setTimeout(() => {
      setShowTagline(true);
      Animated.parallel([
        Animated.timing(taglineOp,    {toValue: 1, duration: 240, useNativeDriver: true}),
        Animated.timing(dividerScale, {toValue: 1, duration: 240, easing: Easing.out(Easing.quad), useNativeDriver: true}),
      ]).start();
    }, 1000);
    setTimeout(() => {
      Animated.timing(systemOp, {toValue: 1, duration: 220, useNativeDriver: true}).start();
    }, 1180);

    // Exit — 1800ms
    setTimeout(() => {
      Animated.timing(screenOp, {
        toValue: 0, duration: 250,
        easing: Easing.in(Easing.quad), useNativeDriver: true,
      }).start(() => onFinish?.());
    }, 1800);
  }, [
    bgAnim,
    dividerScale,
    logoOpacity,
    logoScale,
    logoTransY,
    netProgress,
    onFinish,
    screenOp,
    subtitleOp,
    systemOp,
    taglineOp,
  ]);

  const bgColor = bgAnim.interpolate({inputRange: [0, 1], outputRange: [WHITE, CREAM]});

  return (
    <Animated.View style={[styles.root, {opacity: screenOp}]}>
      <StatusBar backgroundColor={WHITE} barStyle="dark-content" translucent />

      {/* Background */}
      <Animated.View style={[StyleSheet.absoluteFill, {backgroundColor: bgColor}]} />

      {/* Corner accents */}
      <View style={styles.cornerTL} />
      <View style={styles.cornerBR} />

      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Animated.View
            style={[
              styles.logoWrap,
              {opacity: logoOpacity, transform: [{scale: logoScale}, {translateY: logoTransY}]},
            ]}>
            <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
            <TechNetwork progress={netProgress} />
          </Animated.View>
        </View>

        <View style={styles.textStack}>
          {/* School name — letter-by-letter */}
          <View style={styles.titleSlot}>
            {showTitle && (
              <View style={styles.titleSection}>
                <AnimatedLetters text="NADIMPALLI SATYANARAYANA RAJU" style={styles.schoolName} startDelay={0} letterDelay={12} />
                <View style={styles.dividerRow}>
                  <View style={styles.dot} />
                  <Animated.View style={[styles.dividerLine, {transform: [{scaleX: dividerScale}]}]} />
                  <View style={styles.dot} />
                </View>
                <AnimatedLetters text="INTERNATIONAL TECHNO SCHOOL" style={styles.subName} startDelay={40} letterDelay={10} />
              </View>
            )}
          </View>

          {/* NSRIT Connect badge */}
          {/* <View style={styles.connectSlot}>
            {showSubtitle && (
              <Animated.View style={[styles.connectBadge, {opacity: subtitleOp}]}>
                <View style={styles.connectAccent} />
                <Animated.Text style={styles.connectText}>NSRIT Connect</Animated.Text>
                <View style={styles.connectAccent} />
              </Animated.View>
            )}
          </View> */}

          {/* Motto + tagline */}
          <View style={styles.mottoSlot}>
            {showTagline && (
              <Animated.View style={[styles.mottoSection, {opacity: taglineOp}]}>
                <Animated.Text style={styles.motto}>UNITY  •  LEARNING  •  GROWTH</Animated.Text>
                <View style={styles.sanskritRow}>
                  <View style={styles.dot} />
                  <Animated.View style={[styles.dividerLineHalf, {transform: [{scaleX: dividerScale}]}]} />
                  <Animated.Text style={styles.sanskrit}>ज्ञानं परमं बलम्</Animated.Text>
                  <Animated.View style={[styles.dividerLineHalf, {transform: [{scaleX: dividerScale}]}]} />
                  <View style={styles.dot} />
                </View>
                <Animated.Text style={styles.tagline}>Knowledge is the supreme strength</Animated.Text>
              </Animated.View>
            )}
          </View>

          {/* System label */}
          <Animated.View style={[styles.systemBadge, {opacity: systemOp}]}>
            <View style={styles.systemDot} />
            <Animated.Text style={styles.systemText}>Smart School Management System</Animated.Text>
            <View style={styles.systemDot} />
          </Animated.View>
        </View>
      </View>

      {/* Bottom strip */}
      <Animated.View style={[styles.bottomStrip, {opacity: systemOp}]}>
        <View style={styles.bottomBar} />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  root: {flex: 1, backgroundColor: WHITE},
  cornerTL: {
    backgroundColor: 'transparent', borderColor: GREEN,
    borderLeftWidth: 3, borderTopWidth: 3, borderTopLeftRadius: 6,
    height: 40, left: 20, opacity: 0.25, position: 'absolute', top: 48, width: 40,
  },
  cornerBR: {
    backgroundColor: 'transparent', borderColor: NAVY,
    borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 6,
    bottom: 40, height: 40, opacity: 0.2, position: 'absolute', right: 20, width: 40,
  },
  content: {
    alignItems: 'center', flex: 1, justifyContent: 'center',
    paddingHorizontal: 24, paddingBottom: 48,
  },
  logoContainer: {alignItems: 'center', justifyContent: 'center', marginBottom: 2},
  logoWrap: {alignItems: 'center', justifyContent: 'center', position: 'relative'},
  logo: {width: LOGO_W, height: LOGO_H},
  svgNetworkWrap: {height: 90, left: LOGO_W * 0.44, position: 'absolute', top: -8, width: 80},
  networkEdge: {
    backgroundColor: GREEN,
    height: 1,
    position: 'absolute',
  },
  networkNode: {
    backgroundColor: GREEN,
    borderRadius: 4,
    position: 'absolute',
  },
  textStack: {alignItems: 'center', width: '100%'},
  titleSlot: {alignItems: 'center', height: W < 360 ? 56 : 62, justifyContent: 'flex-start', width: '100%'},
  connectSlot: {alignItems: 'center', height: 28, justifyContent: 'flex-start', width: '100%'},
  mottoSlot: {alignItems: 'center', height: W < 360 ? 46 : 50, justifyContent: 'flex-start', width: '100%'},
  titleSection: {alignItems: 'center', marginTop: 8, width: '100%'},
  lettersRow: {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center'},
  schoolName: {
    color: NAVY, fontFamily: 'serif',
    fontSize: W < 360 ? 14 : 17, fontWeight: '900', letterSpacing: 0.4,
  },
  subName: {
    color: NAVY, fontSize: W < 360 ? 9 : 10.5,
    fontWeight: '700', letterSpacing: 1.5, textAlign: 'center',
  },
  dividerRow: {
    alignItems: 'center', flexDirection: 'row',
    marginVertical: 5, width: '84%',
  },
  dot: {backgroundColor: GREEN, borderRadius: 3, height: 5, width: 5},
  dividerLine: {
    backgroundColor: NAVY, flex: 1, height: 1, marginHorizontal: 6, opacity: 0.35,
  },
  dividerLineHalf: {
    backgroundColor: NAVY, flex: 1, height: 1, marginHorizontal: 6, opacity: 0.32,
  },
  connectBadge: {alignItems: 'center', flexDirection: 'row', gap: 8, marginTop: 3},
  connectAccent: {backgroundColor: GREEN, borderRadius: 1, height: 2, width: 18},
  connectText: {color: GREEN, fontSize: 18, fontWeight: '900', letterSpacing: 1},
  mottoSection: {alignItems: 'center', marginTop: 4, width: '100%'},
  motto: {
    color: GREEN, fontSize: W < 360 ? 9 : 10,
    fontWeight: '800', letterSpacing: 1.8, textAlign: 'center',
  },
  sanskritRow: {
    alignItems: 'center', flexDirection: 'row',
    marginTop: 5, marginBottom: 4, width: '84%',
  },
  sanskrit: {
    color: NAVY, fontSize: W < 360 ? 12 : 13, fontWeight: '700',
    marginHorizontal: 6, textAlign: 'center',
  },
  tagline: {color: GREEN, fontStyle: 'italic', fontSize: W < 360 ? 10 : 11, fontWeight: '600'},
  systemBadge: {alignItems: 'center', flexDirection: 'row', gap: 6, marginTop: 8},
  systemDot: {backgroundColor: NAVY, borderRadius: 3, height: 5, opacity: 0.35, width: 5},
  systemText: {color: NAVY, fontSize: 10, fontWeight: '600', letterSpacing: 0.5, opacity: 0.6},
  bottomStrip: {alignItems: 'center', paddingBottom: 32},
  bottomBar: {backgroundColor: GREEN, borderRadius: 2, height: 3, opacity: 0.35, width: 48},
});

export default SplashScreen;