const { Client } = require('pg');

async function createDatabase() {
    const client = new Client({
        host: 'localhost',
        port: 5432,
        user: 'postgres',
        password: '1234',
    });

    try {
        await client.connect();
        await client.query('CREATE DATABASE checkout_db');
        console.log('✅ Database "checkout_db" created successfully');
    } catch (error) {
        if (error.code === '42P04') {
            console.log('ℹ️ Database "checkout_db" already exists');
        } else {
            console.error('❌ Error creating database:', error.message);
        }
    } finally {
        await client.end();
    }
}

createDatabase();
