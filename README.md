# Dota Heroes Database CLI

Цей проект дозволяє додавати, переглядати, оновлювати та видаляти героїв Dota 2 у базі PostgreSQL через Node.js CLI.

## ⚡ Вимоги

- Node.js ≥ 18  
- PostgreSQL (локально або на сервері)  

---

## 🛠 Установка

-1.Скопіюй та встав код в VScode
-2.В термінал пропиши npm i dotenv  і ще пропиши npm i pg
-3.Створи `.env` з підключенням до твоєї бази:
-4.Готово

## Використання

- Список героїв: `node db.js list`  
- Додати героя: `node db.js add Pudge strength disabler melee 3`  
- Оновити складність: `node db.js update 1 2`  
- Видалити героя: `node db.js delete 1`  
- Допомога: `node db.js help`
