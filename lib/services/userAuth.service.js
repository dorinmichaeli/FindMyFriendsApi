import {initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';

// The [userAuth] service provides functionality
// for authenticating incoming HTTP requests.
export function createUserAuthService(config) {
  const firebaseApp = initializeApp(config.firebase);
  const firebaseAuth = getAuth(firebaseApp);

  // TODO: Is it possible to await until the Firebase app is ready?
  //  This could be useful to detect configuration errors.

  return {
    verifyIdToken(token) {
      return firebaseAuth.verifyIdToken(token);
    },
  };
}

