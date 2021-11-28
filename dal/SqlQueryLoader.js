const fs = require('fs');
const path = require('path');

module.exports = class SqlQueryLoader{
    constructor(){
        this.createRoomsTable = this._readQuery('createRoomsTable.sql');
        // reset rooms table
        this.cleanRoomsTable = 'DELETE FROM rooms;'
        this.cleanRoomsSeq = "DELETE FROM sqlite_sequence where name='rooms';"
        //
        this.countRooms = this._readQuery('countRooms.sql');
    }

    //
    // Dynamic queries
    //

    getRoomByName(room_name){
        return `SELECT * FROM rooms WHERE name = '${room_name}';`;
    }

    createRoom(room_name, user_name){
        return `INSERT INTO rooms (name, users_connected) VALUES ('${room_name}', '${user_name}');`;
    }

    deleteRoom(room_name){
        return `DELETE FROM rooms WHERE name = '${room_name}'`
    }

    updateUsersConnected(room_name, users_connected){
        return `UPDATE rooms SET users_connected = '${users_connected}' WHERE name = '${room_name}';`;
    }
    
    _readQuery(queryName){
        return fs.readFileSync(path.resolve(__dirname, './queries/' + queryName)).toString();
    }
}