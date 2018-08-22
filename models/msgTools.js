var moment = require('moment');
var JsonFileTools =  require('./jsonFileTools.js');
var settings =  require('../settings.js');
var debug = settings.debug;
var mData,mMac,mRecv,mDate,mTimestamp,mType,mExtra,mMode ;
var obj;
//Save data to file path
var infosPath  = './public/data/infos.json';
var limitPath  = './public/data/limit_setting.json';
//Jason add for parse define on 2017.11.13
var ParseDefine =  require('./parseDefine.js');

//Save data
var finalList = {};
var type_tag_map = {};//For filter repeater message key:mac+type value:tag

//Jason add for test
exports.parseMotorMsg = function (obj) {
    console.log('MQTT message :\n'+JSON.stringify(obj));
    
    mData = obj.data;
    mType = (obj.data).substring(0,4);
    mRecv = obj.time;

    mTimestamp = new Date(obj.time).getTime();
    //mMac  = (obj.macAddr).substring(8,16);
    mMac = obj.macAddr;
    if (mMac !== '0000000005010c00') {
        return null;
    }

    mInfo = ParseDefine.getInformation(obj.data);
    mDate = moment(obj.time).format('YYYY/MM/DD HH:mm:ss');
        
    var msg = {mac:mMac,type:mType,data:mData,recv:mRecv,date:mDate,timestamp:mTimestamp};

    if(mInfo){
        console.log('**** '+msg.date +' mac:'+msg.mac+' => data:'+msg.data+'\ninfo:'+JSON.stringify(mInfo));
        msg.information=mInfo;
    }

    if( mInfo ){
        JsonFileTools.saveJsonToFile(infosPath , mInfo); 
    }
    return msg;
}

function getType(p) {
    if (Array.isArray(p)) return 'array';
    else if (typeof p == 'string') return 'string';
    else if (p != null && typeof p == 'object') return 'object';
    else return 'other';
}

//type_tag_map is local JSON object
function isSameTagCheck(type,mac,recv){
	var time =  moment(recv).format('mm');

	//Get number of tag
	var tmp = mData.substring(4,6);
	var mTag = parseInt(tmp,16)*100;//流水號:百位
        mTag = mTag + parseInt(time,10);//分鐘:10位及個位
	var key = mac.concat(type);
	var tag = type_tag_map[key];

	if(tag === undefined){
		tag = 0;
	}

	/* Fix 時間進位問題
		example : time 由59分進到00分時絕對值差為59
	*/
	if (Math.abs(tag - mTag)<2 || Math.abs(tag - mTag)==59){
		console.log('mTag=' +mTag+'(key:' +key + '):tag='+tag+' #### drop');
		return true;
	}else{
		type_tag_map[key] = mTag;
		console.log('**** mTag=' +mTag+'(key:' +key + '):tag='+tag +'=>'+mTag+' @@@@ save' );
		return false;
	}
}

exports.getLoraMac = function () {
    return settings.loraMac;
}

exports.setHumidityLimit = function (value) {
    var limit = null;
    try {
        limit = JsonFileTools.getJsonFromFile(limitPath);
    } catch(err) {
        limit = {};
    }
    
    limit.humidity = value;
    JsonFileTools.saveJsonToFile(limitPath , limit);
    return ;
}

exports.setTemperatureLimit = function (value) {
    var limit = null;
    try {
        limit = JsonFileTools.getJsonFromFile(limitPath);
    } catch(err) {
        limit = {};
    }
    
    limit.temperature = value;
    JsonFileTools.saveJsonToFile(limitPath , limit);
    return ;
}