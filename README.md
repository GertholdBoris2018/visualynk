ANNE-stack
==========

ANNE Stack - Angular JS, Node, Neo4J and Express stack. Demo application with ANNE stack

Clone Repo and run
 
$ npm install

followed by

$ node server.js

MailServer account config file
==========
Make the json file named "mailconfig.json" like as below

{
  "username":"yourgmail",
  "password":"yourgmailpassowrd"
}

replace the username and password with your gmail account.

$ node server.js

if the account need to be changed, update the json file with new account and restart the node server

==========
Run the Neo4j database
Download the Neo4j latest version for community and run.
https://neo4j.com/download/

==========
Bim server
Run the terminal, and "java -jar bimserverjar-1.5.73.jar"
You can see it in the bimserverjar directory