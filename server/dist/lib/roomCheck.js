const knex = require('../config/knex');
const dayjs = require("dayjs");
module.exports = {
    async validateRoom(roomId) {
        console.log(roomId, "roomId");
        const validRoom = await knex("room").where("Id", roomId);
        console.log("validRoom", validRoom);
        return validRoom;
    },
    async validateMeeting(roomId) {
        let status = 'valid';
        const room = await knex("room").where("Id", roomId);
        console.log("Validating Room", room);
        const startTime = dayjs(room[0].start);
        const endTime = dayjs(room[0].end);
        const currentTime = dayjs();
        console.log("start", startTime);
        console.log("end", endTime);
        console.log('curr time', currentTime);
        console.log("diff", endTime.diff(currentTime, 'seconds'));
        if (currentTime.isBefore(startTime)) {
            status = 'before_meeting';
        }
        else if (currentTime.isAfter(endTime)) {
            status = "after_meeting";
        }
        else {
            status = 'valid';
        }
        return status;
    }
};
//# sourceMappingURL=roomCheck.js.map