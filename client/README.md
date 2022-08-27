# BG Clients Application

The BG Clients Application is allowing to keep track of the clients for the BG Avocats Conseils.

It allows the creation of a private area for clients in order to communicate them useful informations like events and PDF files they can consult and download.

Once an application administrator create a client, an user is created on Supabase with his email and a default password.

The administrator can enter events and files for this clients. When the client connects, he can view these informations on his private area.

Live on Heroku platform : https://bgclients.herokuapp.com

The application is built with three components:

- the database server, with a relational database schema deployed on Supabase PostgreSQL service
- the API Rest server, built with Express.
- the frontend application, built with ReactJS, Redux and Bootstrap5, relaying on the underlying API REST server to communicate with the database

This repository contains the API REST server for the BG Clients application and the React frontend client.
