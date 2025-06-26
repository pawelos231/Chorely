import { Pool } from 'pg';

const pool = new Pool({
  user: 'user',
  host: 'localhost',
  database: 'chorely',
  password: 'password',
  port: 5432,
});

export default pool; 