import storage from '@react-native-firebase/storage';

const extFromName = name => {
  const parts = (name || '').split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : 'pdf';
};

const uploadDocument = async ({studentId, docType, fileUri, fileName}) => {
  const ext = extFromName(fileName);
  const path = `students/${studentId}/documents/${docType}.${ext}`;
  const ref = storage().ref(path);
  await ref.putFile(fileUri);
  return ref.getDownloadURL();
};

const firebaseStorageService = {
  uploadTransferCertificate({studentId, fileUri, fileName}) {
    return uploadDocument({studentId, docType: 'tc', fileUri, fileName});
  },
  uploadBirthCertificate({studentId, fileUri, fileName}) {
    return uploadDocument({studentId, docType: 'bc', fileUri, fileName});
  },
};

export default firebaseStorageService;
