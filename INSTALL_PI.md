# Setup Film backend for Raspberry Pi

- Required programs:
    * python3 
    * pip3

## PART 1: Install Node JS and NPM

1. Check the version of the CPU (ARM 6/ARM 7 etc):

    `$ cat /proc/cpuinfo`

2. Go to [node js download page](https://nodejs.org/en/download/) and copy Linux Binaries (ARM) link with the right ARM version
3. Download that link using wget:

    `$ wget <LINK>`

4. Extract the archive:

    `$ tar -xf <ARCHIVE-NAME>`

5. cd into the unzipped downloaded directory:

    `$ cd <UNZIPPED-ARCHIVE-FOLDER>`

6. Move all the unpacked files into **/urs/local**:

    `$ sudo cp -R * /usr/local/`

7. Check if everything is installed:

    `$ node -v`</br>
    `$ npm -v`

8. Install Typescript and TS-node:

    `$ sudo npm install -g typescript` </br>
    `$ sudo npm install -g ts-node`

## PART 2: Install PostgreSQL

1. install postgres:

    `$ sudo apt install postgresql`

2. Switch to the postgres user:
        
    `$ sudo -u postgres -i`

3. Run psql and create a database:

    `$ psql` </br>
    `=# CREATE DATABASE film;`

4. Create user with a password:

    `=# CREATE ROLE michelbalamou WITH SUPERUSER CREATEDB CREATEROLE LOGIN ENCRYPTED PASSWORD 'test';`

5. Exit postgres user (Ctrl+C and Ctrl+D) and connect to psql:

    `$ psql -U <USERNAME> -d <DATABASE> -h 127.0.0.1` </br>
    `$ psql -U michelbalamou -d film -h 127.0.0.1`

## PART 3: Clone the repo

1. Clone the repo:

    `$ git clone <URL>`

2. Cd into repo and install dependencies:

    `$ npm install`
