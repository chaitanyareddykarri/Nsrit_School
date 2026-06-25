import {PREDEFINED_CLASSES, WINGS, WING_LABELS} from '../../config/academic';
import academicRepository from '../../repositories/academicRepository';
import dataConnectClient from '../dataconnect/dataConnectClient';
import {DATA_CONNECT_MUTATIONS, DATA_CONNECT_QUERIES} from '../dataconnect/operations';

let seededBranches = new Set();

const wingCodeForClass = className =>
  PREDEFINED_CLASSES.find(item => item.name === String(className))?.wing;

const ensureWingsForBranch = async branchId => {
  const response = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_WINGS_BY_BRANCH, {branchId});
  const existingWings = response.wings || [];
  const created = [];

  for (const code of Object.values(WINGS)) {
    const exists = existingWings.some(wing => wing.code === code);
    if (exists) {
      continue;
    }

    await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.CREATE_WING, {
      branchId,
      code,
      name: WING_LABELS[code] || code,
    });
    created.push(code);
  }

  if (!created.length) {
    return existingWings;
  }

  const updated = await dataConnectClient.query(DATA_CONNECT_QUERIES.GET_WINGS_BY_BRANCH, {branchId});
  return updated.wings || [];
};

export const ensureMasterClassesForBranch = async ({branchId}) => {
  if (!branchId || seededBranches.has(branchId)) {
    return [];
  }

  const [wings, existingClasses] = await Promise.all([
    ensureWingsForBranch(branchId),
    academicRepository.getAcademicClasses(),
  ]);

  const branchClasses = existingClasses.filter(item => item.branchId === branchId);
  const created = [];

  for (const item of PREDEFINED_CLASSES) {
    const exists = branchClasses.some(
      academicClass => String(academicClass.name) === item.name,
    );
    if (exists) {
      continue;
    }

    const wing = wings.find(candidate => candidate.code === wingCodeForClass(item.name));
    if (!wing?.id) {
      console.log(`Wing ${wingCodeForClass(item.name)} not found for class ${item.name}.`);
      continue;
    }

    const response = await dataConnectClient.mutate(DATA_CONNECT_MUTATIONS.CREATE_CLASS, {
      branchId,
      wingId: wing.id,
      name: item.name,
      displayOrder: item.order,
    });
    created.push({id: response.academicClass_insert, ...item, branchId, wingId: wing.id});
  }

  const allClassesExist = PREDEFINED_CLASSES.every(item =>
    branchClasses.some(academicClass => String(academicClass.name) === item.name) ||
    created.some(academicClass => String(academicClass.name) === item.name),
  );

  if (allClassesExist) {
    seededBranches = new Set([...seededBranches, branchId]);
  }

  return created;
};

export const assertSystemManagedClassMutation = () => {
  throw new Error('Classes are fixed system-managed entities and cannot be modified or deleted.');
};

export const MASTER_CLASS_CODES = Object.freeze(
  PREDEFINED_CLASSES.map(item => ({
    name: item.name,
    wing: item.wing || WINGS.PRIMARY,
    order: item.order,
  })),
);

export default {
  ensureMasterClassesForBranch,
  assertSystemManagedClassMutation,
  MASTER_CLASS_CODES,
};
