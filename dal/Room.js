const sqlite3 = require('sqlite3').verbose();

const SqlQueryLoader = require('./SqlQueryLoader');
const sqlQueryLoader = new SqlQueryLoader();

const path = require('path');
const DB_LOCATION = './db/rooms.sqlite3'

// TODO: reset db when last room deleted.

module.exports = class Room{
    constructor(){
        const db = new sqlite3.Database(path.resolve(__dirname, DB_LOCATION));
        
        // Create rooms table if not exists
        db.run(sqlQueryLoader.createRoomsTable, [], (err) => {
            if (err){
                console.log(err.message)
                console.log('ERROR during creating db.')
            }
        });

        db.close();
    }

    async get_room(roomName){
        const res = await new Promise((resolve, reject) =>{    
            const db = new sqlite3.Database(path.resolve(__dirname, DB_LOCATION));
            
            db.get(sqlQueryLoader.getRoomByName(roomName), [], (err, row) => {
                db.close();

                if (err){reject(err);}

                resolve(row);
            });
        }).catch(err => {console.error(err);});

        return res;
    }

    create_room(roomName, userName){
        return new Promise((resolve, reject) =>{
            const db = new sqlite3.Database(path.resolve(__dirname, DB_LOCATION));
            
            db.run(sqlQueryLoader.createRoom(roomName, JSON.stringify([userName])), [], (err) => {
                db.close();
    
                if (err){reject(err)}

                resolve();
            });
        });
    }

    delete_room(room_name){
        const db = new sqlite3.Database(path.resolve(__dirname, DB_LOCATION));
        
        db.run(sqlQueryLoader.deleteRoom(room_name), [], (err) => {
            db.close();

            if (err) {console.log(err)}
        });
    }

    reset_rooms_table(){
        const db = new sqlite3.Database(path.resolve(__dirname, DB_LOCATION));

        db.serialize(() => {
            db.run(sqlQueryLoader.cleanRoomsTable)
              .run(sqlQueryLoader.cleanRoomsSeq, (err) => {
                db.close();
    
                if (err) {console.log(err)}
            });
        });
    }

    async count_rooms(){
        const res = await new Promise((resolve, reject) => {
            const db = new sqlite3.Database(path.resolve(__dirname, DB_LOCATION));

            db.get(sqlQueryLoader.countRooms, [], (err, n_rows) => {
                db.close();

                if (err) {reject(err)}

                resolve(n_rows.N_ROOMS);
            });
        });

        return res;
    }

    async add_username(room_name, user_name){
        const room = await this.get_room(room_name);
        var users_connected = JSON.parse(room.users_connected);

        users_connected.push(user_name);

        return this.update_users_connected(room_name, users_connected);
    }

    update_users_connected(room_name, users_connected){
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(path.resolve(__dirname, DB_LOCATION));

            db.run(sqlQueryLoader.updateUsersConnected(room_name, JSON.stringify(users_connected)), [], (err) => {
                db.close();

                if (err) {reject(err)}

                resolve();
            });
        });
    }
}