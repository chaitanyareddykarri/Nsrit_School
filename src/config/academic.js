export const WINGS = {
  PRE_PRIMARY: 'PRE_PRIMARY',
  PRIMARY: 'PRIMARY',
  MID_SCHOOL: 'MID_SCHOOL',
  HIGHER: 'HIGHER',
};

export const WING_LABELS = {
  [WINGS.PRE_PRIMARY]: 'Pre-Primary',
  [WINGS.PRIMARY]: 'Primary',
  [WINGS.MID_SCHOOL]: 'Mid School',
  [WINGS.HIGHER]: 'Higher',
};

export const WING_CLASS_MAP = {
  [WINGS.PRE_PRIMARY]: ['Nursery', 'LKG', 'UKG'],
  [WINGS.PRIMARY]: ['1', '2', '3', '4', '5'],
  [WINGS.MID_SCHOOL]: ['6', '7'],
  [WINGS.HIGHER]: ['8', '9', '10', '11', '12'],
};

export const SECTION_NAMES = ['A', 'B', 'C', 'D'];

export const STUDENT_STATUS = {
  ACTIVE: 'ACTIVE',
  TRANSFERRED: 'TRANSFERRED',
  GRADUATED: 'GRADUATED',
  DROPPED: 'DROPPED',
};

export const PREDEFINED_CLASSES = [
  ...Object.entries(WING_CLASS_MAP).flatMap(([wing, classNames]) =>
    classNames.map(name => ({label: name, value: name, name, wing})),
  ),
].map((item, index) => ({...item, order: index + 1}));

export const getClassWing = className =>
  PREDEFINED_CLASSES.find(item => item.value === String(className) || item.name === String(className))?.wing;

export const getNextClassName = className => {
  const currentIndex = PREDEFINED_CLASSES.findIndex(item => item.name === String(className));
  return currentIndex >= 0 ? PREDEFINED_CLASSES[currentIndex + 1]?.name || null : null;
};

export const getClassesForWing = wing =>
  PREDEFINED_CLASSES.filter(item => item.wing === wing);

export const isValidPredefinedClass = className =>
  PREDEFINED_CLASSES.some(item => item.value === String(className) || item.name === String(className));
