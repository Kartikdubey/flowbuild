var orm = require('../../../dbbs'),
    Seq = orm.Seq();

module.exports = {
	model:{
    key: Seq.UUIDV4,
	  // begin_time: Seq.DATE,
    timeout: Seq.BIGINT
    // ip: Seq.STRING,
    // status: Seq.STRING    
	},
	relations:{
		belongsTo:"subscriber"
	}
}
