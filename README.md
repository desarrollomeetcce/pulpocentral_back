# pulpocrm_back

crear una base de datos llamada pulpocrm.

create database pulpocrm

En la carpeta del proyecto ejecutar lo siguiente:


npm install

npm i -g sequelize-cli

sequelize db:migrate

sequelize db:seed:all

npm start 

Cuando este corriendo el proyecto saldrá un códgio QR que deben escanear con su teléfono


Para entrar en el frontend el usuario por default es:

 password: password
 email: test@test.com

En caso de roolback

sequelize db:migrate:undo:all



Si después de leer el QR e inciar el backend (npm start) no recupera la sesión, detener el backend y borrar la carpeta .wwebjs_auth
