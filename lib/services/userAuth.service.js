import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// The [userAuth] service provides functionality
// for authenticating incoming HTTP requests.
export function createUserAuthService(config, testMode) {
  const firebaseApp = initializeApp(config.firebase);
  const firebaseAuth = getAuth(firebaseApp);

  // TODO: Is it possible to await until the Firebase app is ready?
  //  This could be useful to detect configuration errors.

  return {
    verifyIdToken(token) {
      let promise = firebaseAuth.verifyIdToken(token);

      if (testMode) {
        // In test mode, if authentication fails then a
        // dummy user info is generated for the user.
        promise = promise.catch(() => {
          return getDummyUserInfo(token);
        });
      }
      return promise;
    },
  };
}

const tokenUserMap = new Map();

// export function createDummyUserAuthService() {
//   return {
//     async verifyIdToken(token) {
//       return getDummyUserInfo(token);
//     },
//   };
// }

function getDummyUserInfo(token) {
  let userInfo = tokenUserMap.get(token);
  if (!userInfo) {
    userInfo = {
      email: extractDummyEmail(),
    };
    tokenUserMap.set(token, userInfo);
  }
  return userInfo;
}

function extractDummyEmail() {
  if (dummyEmailList.length === 0) {
    // We ran out of dummy emails. Fuck.
    throw new Error('Ran out of emails to generate.');
  }
  // Get a dummy email address.
  const randomId = Math.floor(Math.random() * dummyEmailList.length);
  const dummyEmail = dummyEmailList[randomId];
  // Remove the email from the list so that it can't be used again.
  dummyEmailList.splice(randomId, 1);

  return dummyEmail;
}

const dummyEmailList = [
  'ryan.lawson@gmail.com',
  'chelsey.williamson@gmail.com',
  'kim.lambert@gmail.com',
  'destiny.willis@gmail.com',
  'robert.walker@gmail.com',
  'joseph.oliver@gmail.com',
  'christopher.adams@gmail.com',
  'brian.malone@gmail.com',
  'heather.haynes@gmail.com',
  'cynthia.hartman@gmail.com',
  'tyler.barr@gmail.com',
  'eric.mccarthy@gmail.com',
  'kelli.strong@gmail.com',
  'anthony.clark@gmail.com',
  'amanda.hudson@gmail.com',
  'carlos.williams@gmail.com',
  'larry.parker@gmail.com',
  'leah.patterson@gmail.com',
  'wendy.gonzalez@gmail.com',
  'john.edwards@gmail.com',
  'richard.bean.dds@gmail.com',
  'juan.ford@gmail.com',
  'ashley.lopez@gmail.com',
  'shannon.walton@gmail.com',
  'jonathan.jimenez@gmail.com',
  'henry.black@gmail.com',
  'joseph.rhodes@gmail.com',
  'brittany.harrington@gmail.com',
  'travis.long@gmail.com',
  'jeffrey.rodriguez@gmail.com',
  'ashlee.delacruz.md@gmail.com',
  'matthew.graham@gmail.com',
  'christina.brown@gmail.com',
  'kathleen.cooper@gmail.com',
  'jessica.johnson@gmail.com',
  'jennifer.davis@gmail.com',
  'sabrina.holmes@gmail.com',
  'mary.mendoza@gmail.com',
  'chad.miller@gmail.com',
  'matthew.stewart@gmail.com',
  'charles.white@gmail.com',
  'tara.robles@gmail.com',
  'natalie.garcia@gmail.com',
  'sherri.tapia@gmail.com',
  'michelle.jones@gmail.com',
  'ernest.terrell@gmail.com',
  'andrea.anderson@gmail.com',
  'paul.diaz@gmail.com',
  'monica.logan@gmail.com',
  'james.chapman@gmail.com',
];
