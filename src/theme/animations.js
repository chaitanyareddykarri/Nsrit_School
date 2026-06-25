export const animations = {
  spring: {
    gentle: {damping: 20, stiffness: 120, mass: 1},
    bouncy: {damping: 12, stiffness: 180, mass: 0.8},
    snappy: {damping: 25, stiffness: 300, mass: 0.8},
    smooth: {damping: 30, stiffness: 200, mass: 1},
    card: {damping: 18, stiffness: 200, mass: 0.9},
  },
  duration: {
    fast: 150,
    normal: 250,
    slow: 380,
    enter: 320,
    counter: 900,
    ring: 1000,
  },
  stagger: {
    item: 60,
    card: 80,
    section: 140,
  },
};

export default animations;
