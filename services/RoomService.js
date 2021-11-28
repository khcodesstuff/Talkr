const RoomDal = require('../dal/Room');
const roomDal = new RoomDal();

module.exports = class RoomService{
    constructor(){
    }

    async check_room_avail(room_name, user_name){
        var room = await roomDal.get_room(room_name);

        if(room !== undefined){
            // Is username available
            if (JSON.parse(room.users_connected).includes(user_name)){
                return 'name_busy';
            }
            else{
                return 'exists';
            }
        }
        else{
            return 'nonexistent';
        }
    }

    create_room(room_name, user_name){
        return roomDal.create_room(room_name, user_name);
    }

    join_room(room_name, user_name){
        return roomDal.add_username(room_name, user_name);
    }

    async update_on_disconnect(room_name, user_name){
        var room =  await roomDal.get_room(room_name);

        let users_connected = JSON.parse(room.users_connected);

        // If there are other users in the room - remove disconnected user from DB
        if (users_connected.length > 1){
            // remove user that disconnected
            let index = users_connected.indexOf(user_name);
            if (index > -1){
                users_connected = users_connected.splice(index, 1);
            }

            roomDal.update_users_connected(room_name, users_connected);
        }
        // If last user disconnected - remove room || reset table
        else if (users_connected.length == 1){
            let n_rooms = await roomDal.count_rooms();

            // If last room - reset table
            if (n_rooms == 1){
                roomDal.reset_rooms_table();
            }
            // If there are other rooms - just delete the room
            else if (n_rooms > 1){
                roomDal.delete_room(room_name);
            }
        }
    }
}