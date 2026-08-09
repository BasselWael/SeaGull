const admin = require('firebase-admin');

// Since we are running outside of Cloud Functions environment without GOOGLE_APPLICATION_CREDENTIALS,
// and we don't have a service account key file, we might not be able to use admin.initializeApp() without args.
// Let's try it, but if it fails we might need another approach.
admin.initializeApp();

const email = 'admin@seagull.com';
const newPassword = 'SeaGullAdmin2026!';

async function run() {
  try {
    let user;
    try {
      user = await admin.auth().getUserByEmail(email);
      console.log('User found. Updating password...');
      await admin.auth().updateUser(user.uid, {
        password: newPassword
      });
      console.log('Password updated successfully!');
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('User not found. Creating user...');
        await admin.auth().createUser({
          email: email,
          password: newPassword,
        });
        console.log('User created successfully!');
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

run();
