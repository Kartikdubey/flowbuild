
function invalidPacket(data){
	if(!data.name) return true;
	else if(data.name.length === 0) return true;
	else return false;
}

exports.invalidPacket = invalidPacket;
