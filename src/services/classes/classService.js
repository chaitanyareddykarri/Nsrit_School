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

  async getClasses(branchId) {
    const classes = await academicRepository.getAcademicClasses();
    const filtered = branchId ? classes.filter(c => c.branchId === branchId) : classes;
    return filtered.length ? filtered : PREDEFINED_CLASSES;
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
