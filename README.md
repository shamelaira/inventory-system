>>>>Inventory System

A simple inventory management system developed using ReactJS, Ant Design, ExpressJS, and Microsoft SQL Server.

How to Run
1. Clone the Repository
git clone (https://github.com/shamelaira/inventory-system.git)
cd "Inventory System"

2. Set Up the Database
Open SQL Server Management Studio (SSMS).
Open the SQL script located at:
>>database/InventoryDB.sql
Execute the script.

Make sure the database is created as:
>>InventoryDB
Make sure SQL Server is running.

3. Install Backend Dependencies

Open a terminal in the project folder:

cd server
npm install

4. Configure the Backend

Make sure the database connection settings in the backend match the SQL Server installation.
If the project uses environment variables, create the required >>>.env file inside the server folder.

>The .env file is not included in the repository for security reasons.

5. Run the Backend

Inside the server folder, run:
>node index.js

The backend will run on:

http://localhost:5000

6. Install Frontend Dependencies

Open another terminal:

cd client
npm install

7. Run the Frontend
>npm run dev

Open the local URL shown in the terminal.

8. Test Login

Use the following account to test the application:

Username: admin
Password: admin123

9. How to Test
Login
Open the application.
Enter the test username and password.
Click Sign In.

10. Challenges Encountered
During development, I encountered challenges connecting the ExpressJS backend to Microsoft SQL Server and troubleshooting Node.js dependencies and Windows security restrictions. I also worked through integrating the React frontend with the RESTful API and implementing the CRUD functions and inventory reports.