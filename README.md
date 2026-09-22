# SUND-IBTA-G2

For this project, in addition to Typescript and Express, we also need to install npm the @inquirer/prompts package.
Use: "npm install @inquirer/prompts" in your terminal.
To demonstrate how data is processed at the endpoints, we opened 2 Terminal windows, one for the server and one for the CLI (The part that simuates our interaction with a banking terminal, using a simple menu system).

Start the Express server using the command: "npx tsx src/server.ts", or feel free to start it in whatever way that works for you.
server.ts is the name of our typescript file that handles the server interactions (with all the API needed for CRUD operations)
When the server starts successfully, your VSCode terminal will display a message similar with "Server running at http://localhost:3000" (the port number might be different depending on your choices).

In a separate VSCode terminal, start the "banking CLI simulation" using the command: npx tsx src/cli.ts (where cli.ts is the name of our typescript file that handles the banking terminal simulation).

The first thing that appears once the banking terminal starts is the main menu (see image below):
![Banking terminal - main menu](images/mainmenu.png "Main menu")

Use the arrow keys to navigate through the menu choices and press Enter to select the current (highlighted) choice.
Wiew transactions is the first menu option. It will display all the transactions in a table format (see image below):
![Banking terminal - View transactions](images/view-transactions.png "View transactions")

And so on...
