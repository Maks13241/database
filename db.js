import dotenv from 'dotenv'
import pg from 'pg';
dotenv.config()

const { Pool } = pg;
const pool = new Pool({
   connectionString: `${process.env.DB_URL}`,
   ssl: {
      rejectUnauthorized: false
   }
});

const initializeDatabase = async () => {
   console.log('Initializing dota database...');

  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS heroes (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,              
    primary_attribute TEXT,        
    role TEXT,       
    attack_type TEXT,           
    difficulty INTEGER,                
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
   `;

   try {
      const client = await pool.connect();
      await pool.query(createTableQuery);
      console.log('The hero table is ready to go.');
   } catch (error) {
      console.error('Error initializing database:', error.message);
      console.error('Full error:', error);
      throw error;
   }
};

// INSERT
async function addHero(name, primaryAttribute, role, attackType, difficulty) {

   const validAttributes = ['strength', 'agility', 'intellect'];
   if (!validAttributes.includes(primaryAttribute.toLowerCase())) {
      console.error(`Помилка: primary_attribute має бути одним з: ${validAttributes.join(', ')}`);
      return;
   }

   const validAttackTypes = ['melee', 'ranged'];
   if (!validAttackTypes.includes(attackType.toLowerCase())) {
      console.error(`Помилка: attack_type має бути одним з: ${validAttackTypes.join(', ')}`);
      return;
   }

   if (difficulty < 1 || difficulty > 3) {
      console.error('Помилка: difficulty має бути від 1 до 3');
      return;
   }

   const query = `
        INSERT INTO heroes (
            name, primary_attribute, role, attack_type, difficulty
        ) 
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING *`;

   const values = [name, primaryAttribute, role, attackType, difficulty];

   try {
      const res = await pool.query(query, values);
      console.log('героя додано:', res.rows[0]);
   } catch (err) {
      console.error('Error:', err.message);
   }

}

// SELECT
async function getAllHeroes() {

   const res = await pool.query('SELECT * FROM heroes');

   console.table(res.rows);

}

// Перевірка чи існує герой
async function heroExists(id) {
   const res = await pool.query('SELECT * FROM heroes WHERE id = $1', [id]);
   return res.rows.length > 0;
}

// UPDATE
async function updateHeroDifficulty(id, newDifficulty) {

   if (isNaN(id) || id <= 0) {
      console.error('Помилка: ID має бути додатним числом');
      return;
   }

   if (!(await heroExists(id))) {
      console.error(`Помилка: Героя з ID ${id} не знайдено`);
      return;
   }

   if (newDifficulty < 1 || newDifficulty > 3) {
      console.error('Помилка: difficulty має бути від 1 до 3');
      return;
   }

   const query = 'UPDATE heroes SET difficulty = $1 WHERE id = $2 RETURNING *';
   const res = await pool.query(query, [newDifficulty, id]);
   console.log('геройська дата-база оновлена:', res.rows[0]);
}

// DELETE
//AI
async function deleteHero(id) {

   if (isNaN(id) || id <= 0) {
      console.error('Помилка: ID має бути додатним числом');
      return;
   }

   if (!(await heroExists(id))) {
      console.error(`Помилка: Героя з ID ${id} не знайдено`);
      return;
   }

   await pool.query('DELETE FROM heroes WHERE id = $1', [id]);
   console.log(`Героя з ID ${id} було видалено з бази даних..`);
}
//END
(async () => {
   try {
      await initializeDatabase();

      switch(process.argv[2]) { 

         case "list": {
            await getAllHeroes();
            break;
         }

         case "add": {

            if (process.argv.length < 8) {
               console.log("Usage: node db.js add <name> <primary_attribute> <role> <attack_type> <difficulty>");
               console.log("Example: node db.js add Pudge strength disabler melee 3");
               break;
            }
//AI
             await addHero(
               process.argv[3],
               process.argv[4],
               process.argv[5],
               process.argv[6],
               parseInt(process.argv[7])
            );
            break;
         }
//END
         case "update": {

            if (process.argv.length < 5) {
               console.log("Usage: node db.js update <id> <difficulty>");
               break;
            }
//AI
            const id = parseInt(process.argv[3]);
            const difficulty = parseInt(process.argv[4]);

            if (isNaN(id) || isNaN(difficulty)) {
               console.log("Помилка: ID та difficulty мають бути числами");
               break;
            }
            //END


            await updateHeroDifficulty(id, difficulty);
            break;
         }

         case "delete": {

            if (process.argv.length < 4) {
               console.log("Usage: node db.js delete <id>");
               break;
            }

            const id = parseInt(process.argv[3]);

            if (isNaN(id)) {
               console.log("Помилка: ID має бути числом");
               break;
            }

            await deleteHero(id);
            break;
         }

         case "help": {
            console.log("Доступні команди:");
            console.log("node db.js list - показати всіх героїв");
            console.log("node db.js add <імя> <атрибут> <роль> <тип> <difficulty>");
            console.log("node db.js update <id> <складність> - оновити складність героя");
            console.log("node db.js delete <id>");
            break;
         }

         default: {
            console.log("Usage: node db.js [list|add|update|delete|help]");
            console.log("Type 'node db.js help' for more information");
            break;
         }
      }

   } catch (err) {
      console.error("Error:", err.message);
   } finally {
      console.log('Завершення роботи з базою даних...');
     // await pool.query('DROP TABLE heroes'); - якщо ламається база то цією штукою я фікшу її
      process.exit();
   }

})();

// Натисніть Ctrl+F та напишіть `AI` щоб побачити де я користувався його допомогою `END` - це кінець допомоги від нього. Я не видаляю його код, а просто позначаю де він допомагав мені.

//Дещо було взято з чужих кодів, але я їх адаптував під свої потреби. Деякі назви писав для константів чи змінних допомагав гпт , але більшість сам
import dotenv from 'dotenv'
import pg from 'pg';
dotenv.config()

const { Pool } = pg;
const pool = new Pool({
   connectionString: `${process.env.DB_URL}`,
   ssl: {
      rejectUnauthorized: false
   }
});

const initializeDatabase = async () => {
   console.log('Initializing cat database...');

   const createTableQuery = `
    CREATE TABLE IF NOT EXISTS cats (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,              
    breed TEXT DEFAULT 'Метис',        
    age_years INTEGER NOT NULL,       
    weight_kg NUMERIC(4, 2),           
    favorite_food TEXT,                
    has_microchip BOOLEAN DEFAULT FALSE, 
    owner_contact TEXT,                
    character_notes TEXT,              
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
  `;
   try {
      await pool.query(createTableQuery);
      console.log('The cat table is ready to go.');
   } catch (error) {
      console.error('Error initializing database:', error.message);
      console.error('Full error:', error);
      throw error;
   }
};
// 2. INSERT — Додавання нового котика
async function addCat(name, age, breed, weight, food, chip, contact, notes) {
   const query = `
        INSERT INTO cats (
            name, age_years, breed, weight_kg, favorite_food, 
            has_microchip, owner_contact, character_notes
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        RETURNING *`;

   const values = [name, age, breed, weight, food, chip, contact, notes];

   try {
      const res = await pool.query(query, values);
      console.log('The cat has been added with all the details:', res.rows[0]);
   } catch (err) {
      console.error('Error:', err.message);
   }

}
// 3. SELECT — Перегляд усіх котиків
async function getAllCats() {
   const res = await pool.query('SELECT id, name, age_years FROM cats');
   console.table(res.rows);
}
// 4. UPDATE — Оновлення даних (наприклад, віку)
async function updateCatAge(id, newAge) {
   const query = 'UPDATE cats SET age_years = $1 WHERE id = $2 RETURNING *';
   const res = await pool.query(query, [newAge, id]);
   console.log('Cat data updated:', res.rows[0]);
}
// 5. DELETE — Видалення котика за ID
async function deleteCat(id) {
   await pool.query('DELETE FROM cats WHERE id = $1', [id]);
   console.log(`The cat with ID ${id} has been removed from the database..`);
}

// (async () => {
//    try {
//       await initializeDatabase();
//       console.log("Application is running...");

//       console.log("Adding new cats...");
//       // await addCat('Рижуля', 8, 'Домашня', 4, "Будь який дорогий корм ");


//       await getAllCats();
//    } catch (err) {
//       console.error("Failed to start application:", err);
//    } finally {
//       await pool.end()
//    }
// })();

//node db.js help
//node db.js list
//node db.js add 
//node db.js update
//node db.js delete



switch(process.argv[2]) {
   case "list": {
      await getAllCats();
      break;
   }
   case "add": {break}
   case "update":  {
      console.log(process.argv)
      // await updateCatAge(process.argv[3], process.argv[4]);
      break;
   }
   case "delete": {
      await deleteCat(process.argv[3]);
      break;
   }
   default: {
      console.log("Usage:    1.node db.js list - khdghjfjhf; 2. node db.js add - pokgfopkhfgpohk; 3. node db.js update - ofkhpgkjh; 4.node db.js delete - [pglkhgfokhfokh.  All commands: help, list, add, update, delete.");
      break;
   }
}

 process.exit()
