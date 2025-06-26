import bcrypt from 'bcrypt';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter a password to hash: ', (password) => {
  if (!password) {
    console.error('Password cannot be empty.');
    rl.close();
    return;
  }
  
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  
  console.log('\n✅ Password hashed successfully!');
  console.log('Hashed password:', hash);
  
  console.log('\nNext Step: Copy this hash and paste it into the db/seed.sql file for the user you want to be an admin (e.g., Alice).');
  rl.close();
}); 