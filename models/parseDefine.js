var aa00Data = { 'temperature':[6,10,100], 'humidity':[10,14,100], 'voltage':[14,18,1] };
var aa01Data = { 'pressure':[6,10,1],'hight':[10,14,1],'temperature':[14,16,1], 'humidity':[16,18,1], 'light':[18,22,1] };
var aa02Data = {'uv':[6,10,1],'rain':[10,14,1]};
var fa01Data =  { 'temperature': [14, 18, 'data/100'], 'humidity': [18, 22, 'data/100'] , 'co2': [22, 26, 'data']};

exports.getInformation = function (data) { 
    
    var type = data.substring(0,4);
    
    return getTypeData(data,type);

};

function getTypeData(data,type){
    var info = {};
    
    if(type==='aa00'){
        var obj = aa00Data;
    } else if (type==='aa01') {
        var obj = aa01Data;
    } else if (type==='aa02') {
        var obj = aa02Data;
    } else if (type==='fb01') {
        var obj = fa01Data;
    }
    try {
        var info = {};
        var keys = Object.keys(obj);
        var count = keys.length;
        for(var i =0;i<count;i++){
            //console.log( keys[i]+' : '+ obj[keys[i]]);
            let parseData =  getIntData(obj[keys[i]],data);
            info[keys[i]] = parseData.toFixed(2);
            // console.log(keys[i] + ' : ' + info[keys[i]]);
        }
        return info;
    } catch (error) {
        return null;
    }
}

function getIntData(arrRange,initData){
    var ret = {};
    var start = arrRange[0];
    var end = arrRange[1];
    var diff = arrRange[2];
    var data = parseInt(initData.substring(start,end),16);
    // example : 
    // diff = "data/100"
    // data = 2000
    // eval(diff) = 2000/100 = 20
    
    return eval(diff);
}