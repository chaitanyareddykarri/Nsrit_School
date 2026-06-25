import {PREDEFINED_CLASSES} from '../../config/academic';
import academicRepository from '../../repositories/academicRepository';

export const classService = {
  getPredefinedClasses() {
    return PREDEFINED_CLASSES;
  },

  async getClassesByWing(wingId) {
    const classes = await academicRepository.getAcademicClasses();
    return wingId ? classes.filter(item => item.wingId === wingId || item.wing?.code === wingId) : classes;
  },

  async getClasses() {
    const classes = await academicRepository.getAcademicClasses();
    return classes.length ? classes : PREDEFINED_CLASSES;
  },

  async createClass() {
    throw new Error('Classes are predefined. Create sections under an existing class instead.');
  },

  async createSection(payload) {
    const id = await academicRepository.createSection(payload);
    return {id, ...payload, isActive: true};
  },
};

export default classService;
