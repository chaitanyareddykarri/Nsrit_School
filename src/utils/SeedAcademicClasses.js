import academicRepository from '../repositories/academicRepository';
import dataConnectClient from '../services/dataconnect/dataConnectClient';
import {DATA_CONNECT_MUTATIONS, DATA_CONNECT_QUERIES} from '../services/dataconnect/operations';

const SEED_CLASSES = [
  // PRE_PRIMARY
  {name: 'Nursery', classCode: 'NUR', wingCode: 'PRE_PRIMARY', sortOrder: 1, isActive: true},
  {name: 'LKG', classCode: 'LKG', wingCode: 'PRE_PRIMARY', sortOrder: 2, isActive: true},
  {name: 'UKG', classCode: 'UKG', wingCode: 'PRE_PRIMARY', sortOrder: 3, isActive: true},
  // PRIMARY
  {name: '1', classCode: 'CLS1', wingCode: 'PRIMARY', sortOrder: 4, isActive: true},
  {name: '2', classCode: 'CLS2', wingCode: 'PRIMARY', sortOrder: 5, isActive: true},
  {name: '3', classCode: 'CLS3', wingCode: 'PRIMARY', sortOrder: 6, isActive: true},
  {name: '4', classCode: 'CLS4', wingCode: 'PRIMARY', sortOrder: 7, isActive: true},
  {name: '5', classCode: 'CLS5', wingCode: 'PRIMARY', sortOrder: 8, isActive: true},
  // MID_SCHOOL
  {name: '6', classCode: 'CLS6', wingCode: 'MID_SCHOOL', sortOrder: 9, isActive: true},
  {name: '7', classCode: 'CLS7', wingCode: 'MID_SCHOOL', sortOrder: 10, isActive: true},
  // HIGHER
  {name: '8', classCode: 'CLS8', wingCode: 'HIGHER', sortOrder: 11, isActive: false},
  {name: '9', classCode: 'CLS9', wingCode: 'HIGHER', sortOrder: 12, isActive: false},
  {name: '10', classCode: 'CLS10', wingCode: 'HIGHER', sortOrder: 13, isActive: false},
  {name: '11', classCode: 'CLS11', wingCode: 'HIGHER', sortOrder: 14, isActive: false},
  {name: '12', classCode: 'CLS12', wingCode: 'HIGHER', sortOrder: 15, isActive: false},
];

export const seedAcademicClasses = async (branchId) => {
  try {
    // 1. Fetch all wings for the branch
    const wingsResponse = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_WINGS_BY_BRANCH, {
      branchId,
    });
    const wingsList = wingsResponse.wings || [];

    // 2. Fetch existing classes
    const existingClasses = await academicRepository.getAcademicClasses();
    const existingNames = new Set(existingClasses.map(c => c.name));

    let newClassesCount = 0;

    for (const cls of SEED_CLASSES) {
      if (existingNames.has(cls.name)) {
        continue; // Skip existing classes to preserve activation status
      }

      const wing = wingsList.find(w => w.code === cls.wingCode);
      if (!wing) {
        console.warn(`Wing ${cls.wingCode} not found for class ${cls.name}. Ensure wings are seeded first.`);
        continue;
      }

      try {
        await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.SEED_ACADEMIC_CLASS, {
          branchId,
          wingId: wing.id,
          name: cls.name,
          classCode: cls.classCode,
          sortOrder: cls.sortOrder,
          isActive: cls.isActive,
        });
        newClassesCount++;
      } catch (e) {
        console.error(`Error inserting class ${cls.name}:`, e);
      }
    }

    return { success: true, seeded: newClassesCount };
  } catch (error) {
    console.error('Failed to seed classes:', error);
    return { success: false, error: error.message };
  }
};
