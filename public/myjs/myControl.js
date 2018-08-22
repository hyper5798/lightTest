var host = window.location.hostname;
var port = window.location.port;
var data,options,data2,options2;
var chart,chart2;
var debug = false;
var lastCMD = '';

$("[name='my-checkbox']").bootstrapSwitch();
$("[name='my-checkbox2']").bootstrapSwitch();


if(debug === false){
  $("#status").hide();
}

if(location.protocol=="https:"){
  var wsUri="wss:///"+host+":"+port+"ws/control";
} else {
  var wsUri="ws://"+host+":"+port+"/ws/control";
}
console.log(wsUri);
var ws=null;

function wsConn() {
  ws = new WebSocket(wsUri);
  ws.onmessage = function(m) {
    console.log('< from-node-red:',m.data);
    if (typeof(m.data) === "string" && m. data !== null){
      var msg =JSON.parse(m.data);
      console.log("from-node-red : id:"+msg.id);
      var v = msg.v;

      if(msg.id === 'update_gauge' ){
          //Update gauge
          //showDialog('更新');
          changGaugeData(v);
          checkOverLimit(v);
          waitingDialog.hide();
      } else  if(msg.id === 'setting_finish' ){
        waitingDialog.hide();
      }
    }
  }
  ws.onopen = function() {
    var obj = {"id":"init"};
    document.getElementById("status").innerHTML = 'init';
    sendWSCmd(obj);
    //deayQaueyMode2();
  }
  ws.onclose   = function()  {
    console.log('Node-RED connection closed: '+new Date().toUTCString());
    connected = false;
    ws = null;
  }
  ws.onerror  = function(){
    console.log("connection error");
  }
}
wsConn();

$(document).ready(function(){
  $( "#rpmAlert" ).hide();
  // showDialog('Connecting');
     init();
});

function drawChart() {
  var temperature = Number(document.getElementById('temperature').value);
  var humidity = Number(document.getElementById('humidity').value);
  // alert(temperature);
  data = google.visualization.arrayToDataTable([
    ['Label', 'Value'],
    ['溫度', Math.round(temperature)]
  ]);

  data2 = google.visualization.arrayToDataTable([
    ['Label', 'Value'],
    ['濕度', Math.round(humidity)]
  ]);

  options = {
    width: 250, height: 250,
    redFrom: 30, redTo: 40,
    yellowFrom:25, yellowTo: 30,
    minorTicks: 5,
    max:40
  };

  options2 = {
    width: 250, height: 250,
    redFrom: 80, redTo: 100,
    yellowFrom:60, yellowTo: 80,
    minorTicks: 5,
    max:100
  };

  chart = new google.visualization.Gauge(document.getElementById('chart_div'));
  chart.draw(data, options);
  chart2 = new google.visualization.Gauge(document.getElementById('chart_div2'));
  chart2.draw(data2, options2);
}

function changGaugeData(obj){
  data.setValue(0, 1, Math.round(Number(obj.temperature)));
  chart.draw(data, options);
  data2.setValue(0, 1, Math.round(Number(obj.humidity)));
  chart2.draw(data2, options2);
  waitingDialog.hide();
}

function checkOverLimit(obj) {
  var temp_max = document.getElementById('temp_max').value;
  var hum_max = document.getElementById('hum_max').value;
  var temp = Math.round(Number(obj.temperature));
  var hum = Math.round(Number(obj.humidity));
  console.log('temperature : ' + obj.temperature + ', max : ' + temp_max);
  console.log('humidity : ' + obj.humidity + ', max : ' + hum_max);
  var str2 = temp.toString(16);
  var str3 = hum.toString(16);
  var str = '', sendCode = '';
  var isTempOver = false, isHumOver = false;
  var sum = 1;//Set init value
  if (temp_max !== '') {
    if(temp > Number(temp_max)) {
      // alert('測得溫度大於設定值');
      isTempOver = true;
    } else {
      // alert('測得溫度小於等於設定值');
    }
  }
  if (hum_max !== '') {
    if(hum > Number(hum_max)) {
      // alert('測得濕度大於設定值');
      isHumOver = true;
    } else {
      // alert('測得濕度小於等於設定值');
    }
  }
  // alert(isSend);
  if (isTempOver === false && isHumOver === false) {
    sendCode = 'a200';
    str = '現在溫度 : ' + temp + ',' + '現在濕度 : ' + hum;
    $("[name='my-checkbox']").bootstrapSwitch('state', false);
    $("[name='my-checkbox2']").bootstrapSwitch('state', false);
    // alert("send_commend" + str);
  } else  if (isTempOver === true && isHumOver === false) {
    sendCode = 'a001';
    str = '溫度過高 : ' + temp + ',' + '現在濕度 : ' + hum;
    $("[name='my-checkbox']").bootstrapSwitch('state', true);
    $("[name='my-checkbox2']").bootstrapSwitch('state', false);
  } else  if (isTempOver === false && isHumOver === true) {
    sendCode = 'a101';
    str = '現在溫度 : ' + temp + ',' +'濕度過高 : ' + hum;
    $("[name='my-checkbox']").bootstrapSwitch('state', false);
    $("[name='my-checkbox2']").bootstrapSwitch('state', true);
  } else {
    sendCode = 'a211';
    str = '溫度過高 : ' + temp + ',' + '濕度過高 : ' + hum;
    $("[name='my-checkbox']").bootstrapSwitch('state', true);
    $("[name='my-checkbox2']").bootstrapSwitch('state', true);
  }
  document.getElementById('sendCmd').value = str;
  var obj = {"id":"send_commend","v":sendCode};
  sendWSCmd(obj);
}

function init(){
  google.charts.load('current', {'packages':['gauge']});
  google.charts.setOnLoadCallback(drawChart);
}

function showDialog(message){
    waitingDialog.show(message);
    //waitingDialog.show();
    setTimeout(function () {
      waitingDialog.hide();
      },3000);
}

function showAlert(){
    $( "#rpmAlert" ).show();
    //waitingDialog.show();
    setTimeout(function () {
        $( "#rpmAlert" ).hide();
      },10000);
}

function sendWSCmd(obj){
  var getRequest = JSON.stringify(obj);
  console.log("getRequest : "+ getRequest);
  if(ws === null){
    ws = new WebSocket(wsUri);
  }
  ws.send(getRequest);      // Request ui status from NR
  console.log(getRequest);
}

function setMaxHum() {
  // alert('setMaxHum()');
  var max = document.getElementById('hum_max').value;
  //showDialog('變更濕度最大設定值 : ' + max);
  if (max === '') {
    alert('未輸入濕度最大設定值');
    return;
  }
  var obj = {"id":"set_humidity_max","v":max};
  sendWSCmd(obj);
}

function setMaxTemp() {
  // alert('setMaxTemp()');
  var max = document.getElementById('temp_max').value;
  //showDialog('變更溫度最大設定值 : ' + max);
  if (max === '') {
    alert('未輸入溫度最大設定值');
    return;
  }
  var obj = {"id":"set_temperature_max","v":max};
  sendWSCmd(obj);
}

function onChangeHandler1(cb) {
  console.log("Switch 1 Clicked, new value = " + cb.checked);
  var sendCode = 'a000';
  var str = '開關一 : 關閉';
  if (cb.checked) {
    sendCode = 'a001';
    str = '開關一 : 開啟';
  }
  document.getElementById('sendCmd').value = str;
  var obj = {"id":"send_commend","v":sendCode};
  sendWSCmd(obj);
}

function onChangeHandler2(cb) {
  console.log("Switch 1 Clicked, new value = " + cb.checked);
  var sendCode = 'a100';
  var str = '開關二 : 關閉';
  if (cb.checked) {
    sendCode = 'a101';
    str = '開關二 : 開啟';
  }
  document.getElementById('sendCmd').value = str;
  var obj = {"id":"send_commend","v":sendCode};
  sendWSCmd(obj);

}

