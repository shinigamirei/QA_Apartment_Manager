  # Deployment
   
  - Open a command window in each of the four folders in the root git repository(apartmentManagement, getApartment, getOccupancy, occupancyManagement)
  - Edit the .env file in each folder to point to the IP address of your server and the IP address of your database(localhost for local deployment)
  <br/> Note: to use a local deployment you must setup a local mongoDB database.
  <br/> Example .env for localhost deployment:
  ```
  APARTMENTS_AWS_IP=localhost
  APARTMENTS_DATABASE_IP=localhost
  ```
  - Run the following commands in each folder:
  ```
  npm install
  node server.js
  ```
