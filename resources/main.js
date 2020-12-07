
$(function(){

	// header 
	var connect = $("#connect");
	var currentDev = $("#currentDev");
	var refresh = $("#refresh");
	var deviceId = 0;
	var audio = $("#audio");
	var calcuAudio = 0;
	var isAudio = false;



	// Output Section
	var noteoff = $("#noteoff");
	var noteon = $("#noteon");
	var serial = $("#serial");
	var continuity = $("#continuity");

	var setContinue = $("#continue");
	var continueSign = $("#continueSign");
	var setContinueTime = 0;
	var isContinue = false;
	var setLoop = $("#loop");
	var loopSign = $("#loopSign");
	var setLoopTime = 0;
	var isLoop = false;


	var message = $("#message");
	var send = $("#send");
	var sendLoop = $("#sendLoop");
	var messageLoop = $("#messageLoop");
	var outputHeader = $("#outputHeader");
	var outputBody = $("#outputBody");
	var arrow1 = $("#arrow1");
	var outputShow = 0;


	const singleMidi = ["0xF6", "0xF8", "0xFA", "0xFB", "0xFC", "0xFE", "0xFF"];

	// Input Section
	var inputHeader = $("#inputHeader");
	var inputBody = $("#inputBody");
	var arrow2 = $("#arrow2");
	var inputShow = 0;
	var clear = $("#clear");
	var reset = $("#reset");
	var Noteon_show = $("#Noteon_show");
	var Noteoff_show = $("#Noteoff_show");
	var An_show = $("#An_show");
	var Bn_show = $("#Bn_show");
	var Cn_show = $("#Cn_show");
	var Dn_show = $("#Dn_show");
	var En_show = $("#En_show");
	var Sysex_show = $("#Sysex_show");
	var show = $("#show");


	// 计数
	var all_noteoff = 0;
	var all_noteon = 0;
	var all_keyaftertouch = 0;
	var all_controlb = 0;
	var all_programchange = 0;
	var all_channelaftertouch = 0;
	var all_pitchbend = 0;
	var all_sysex = 0;
	var clickTime = 0;
	var stop = "";


	// Loop delay time
	var receiveCheck = [];
	var timeCollection = [];
	var timePrevious = 0;
	var timeNext = 0;
	var timeInterval = 0;
	var timeIntervalMax = 0;
	var timeIntervalMin = 0;

	var temp_loop_setp = 0;
	var temp_loop_flag = 0;
	var temp_loop_vval = 0;
	var temp_Over_flag = 0;
	var temp_Over_step = 0;

	var temp_Over_Val = 90;
	var temp_Over_Count = 4;

	// var fso = new ActiveXObject(Scripting.FileSystemObject);

	// var f_txt = fso.createtextfile("C:\Users\Administrator\Desktop\txt", true);

	// f_txt.writeLine("wo shi di yi hang");
	// f_txt.writeLine("wo shi di yi hang");
	// f_txt.writeLine("wo shi di yi hang");
	// f_txt.writeLine("wo shi di yi hang");

	// show or hide the panel-body  -- Output
	outputHeader.click(function(){
		if (outputShow % 2 == 0) {
			outputBody.css("display", "none");
			arrow1.attr("class", "glyphicon glyphicon-triangle-right");
			show.css("height", "70%");
		} else {
			outputBody.css("display", "block");
			arrow1.attr("class", "glyphicon glyphicon-triangle-bottom");
			show.css("height", "57%");
		}
		outputShow++;
	});


	// show or hide the panel-body  -- Input
	inputHeader.click(function(){
		if (inputShow % 2 == 0) {
			inputBody.css("display", "none");
			arrow2.attr("class", "glyphicon glyphicon-triangle-right");
		} else {
			inputBody.css("display", "block");
			arrow2.attr("class", "glyphicon glyphicon-triangle-bottom");
		}
		inputShow++;
	});


	// Continue switch
	setContinue.click(function(){
		if (!isLoop) {
			if (setContinueTime % 2 == 0) {
				setContinue.attr("class", "btn btn-success col-md-5");
				continueSign.attr("class", "glyphicon glyphicon-ok-sign");
				isContinue = true;
			} else {
				setContinue.attr("class", "btn btn-danger col-md-5");
				continueSign.attr("class", "glyphicon glyphicon-remove-sign");	
				isContinue = false;
			}
			setContinueTime++;			
		} else {
			alert("[Continue] and [Loop] can't be opened at the same time!");
		}
	});

	// Loop switch
	setLoop.click(function(){
		if (!isContinue) {
			if (setLoopTime % 2 == 0) {
				setLoop.attr("class", "btn btn-success col-md-5 col-md-offset-1");
				loopSign.attr("class", "glyphicon glyphicon-ok-sign");
				isLoop = true;
			} else {
				setLoop.attr("class", "btn btn-danger col-md-5 col-md-offset-1");
				loopSign.attr("class", "glyphicon glyphicon-remove-sign");	
				isLoop = false;
			}
			setLoopTime++;
		} else {
			alert("Sorry! [Continue] and [Loop] can't be opened at the same time!");
		}	
	});


	// Audio switch
	audio.click(function(){
		if (calcuAudio % 2 == 0) {
			audio.attr("class", "btn btn-success col-md-1 col-md-offset-6");
			isAudio = true;
		} else {
			audio.attr("class", "btn btn-primary col-md-1 col-md-offset-6");
			isAudio = false;
		}
		calcuAudio++;
	});



	connect.click(function(){

		WebMidi.enable(function (err) {
			if (err) {
				alert("Sorry! Please make sure enable your MIDI or the 'SysEx'!");
			} else {
				console.log(WebMidi.sysexEnabled);

				

				if ($("#devices").children().length == 0) {
					for (var i = 0; i < WebMidi.outputs.length; i++) {

						var $li = $("<li></li>");
						var $btn = $("<button>" + WebMidi.outputs[i].name + "</button>");
						$btn.attr({
							"id": "" + i,
							"class": "btn btn-info col-md-12"
						});
						$li.append($btn);
						$("#devices").append($li);
						$btn.click(function(){
							deviceId = $(this).attr("id");  // this指向绑定的元素

							var output = WebMidi.outputs[deviceId];
							var input = WebMidi.inputs[deviceId];				

							var devName = output.name;
							var current = $("<strong>" + devName + "<strong>");
							current.css("color", "green");
							currentDev.text(" ");
							currentDev.append(current);

							// init timbre.js
							var msec  = timbre.timevalue("bpm300 l8");
							var synth = T("OscGen", {env:T("perc", {r:msec, ar:true})}).play();
							var midicps = T("midicps");


							// Note Off Listener
							input.addListener('noteoff', "all", 
								function (e) {
									all_noteoff++;
									Noteoff_show.text(all_noteoff);

									/* for loop test */
									if (isLoop) {
										output.send(e.data[0], [e.data[1], e.data[2]]); 										
									}

									var color = "#009797";
									var raw = e.data;

									var processed = RawDataProcessing(raw); 
									createElement(devName, processed, color);

									show[0].scrollTop = show[0].scrollHeight;
									AutoClear();
								});

							// Note On Listener
							input.addListener('noteon', "all", 
								function (e) {
									Noteon_show.text(all_noteon);
									
									timeNext = (new Date()).valueOf();
									timeInterval = timeNext - timePrevious;
									timePrevious = timeNext;

									// Audio Play
									if (isAudio) {
										var freq = midicps.at(e.data[1]);
										// Drum machine notes to raise an octave to listen more clearly
										// var freq = midicps.at(e.data[1] + 12);
										synth.noteOnWithFreq(freq, 100);
									}

									/* for Loop test */
									if (isLoop) {
										
										if( all_noteon > 1000 )
										{
											if( timeIntervalMin == 0 ){
												timeIntervalMin = timeInterval;
											}
											else if( timeInterval < timeIntervalMin ){
												timeIntervalMin = timeInterval;
											}
										}

										if( temp_loop_flag )
										{
											temp_loop_setp++;
										}

										if( temp_loop_setp > 3 )
										{
											all_noteon++;

											if( timeInterval > timeIntervalMax && all_noteon > 1000){
												timeIntervalMax = timeInterval;

												temp_loop_vval = timeInterval;
											}

											timeCollection.push(timeInterval);
										}

										if( temp_loop_vval > temp_Over_Val )
										{
											temp_Over_flag = 1;
										}

										if( temp_Over_flag == 1 )
										{
											temp_Over_step++;
										}

										if( temp_Over_step == temp_Over_Count && temp_loop_setp > 3 && all_noteon > 1000 )
										{
											if (!isContinue) {		
												
												setLoop.attr("class", "btn btn-danger col-md-5 col-md-offset-1");
												loopSign.attr("class", "glyphicon glyphicon-remove-sign");	
												isLoop = false;
												setLoopTime++;
												temp_loop_setp = 0;
												temp_loop_flag = 0;
												temp_loop_vval = 0;
												temp_Over_flag = 0;
												temp_Over_step = 0;
											
											} else {
												alert("Sorry! [Continue] and [Loop] can't be opened at the same time!");
											}	
										}

										output.send(e.data[0], [e.data[1], e.data[2]]); 

										if (all_noteon == 11001){
											timeCollection.splice(0, 1001);
											var avgTime = avgFun(timeCollection);
											alert("平均延时时间: " + avgTime.toString() + "ms" + "\n" + "最大延时时间: " + timeIntervalMax.toString() + "ms" + "\n" + "最小延时时间: " + timeIntervalMin.toString() + "ms");
											isLoop = false;
										}
									}

									var color = "#06ff06";
									var raw = e.data;

									var processed = RawDataProcessing(raw); 									  
									createElement(devName, processed, color);

									show[0].scrollTop = show[0].scrollHeight;
									AutoClear();
								});

							// Key After Touch Listener
							input.addListener('keyaftertouch', "all", 
								function (e) {
									all_keyaftertouch++;
									An_show.text(all_keyaftertouch);

									/* for loop test */
									if (isLoop) {
										output.send(e.data[0], [e.data[1], e.data[2]]); 
									}

									var color = "#32D6DA";
									var raw = e.data;

									var processed = RawDataProcessing(raw); 					  
									createElement(devName, processed, color);

									show[0].scrollTop = show[0].scrollHeight;
									AutoClear();
								});


							// Controller Listener
							input.addListener('controlchange', "all", 
								function (e) {
									all_controlb++;
									Bn_show.text(all_controlb);

									/* for loop test */
									if (isLoop) {
										output.send(e.data[0], [e.data[1], e.data[2]]); 										
									}

									var color = "#0BA4FF";
									var raw = e.data;

									var processed = RawDataProcessing(raw);   
									createElement(devName, processed, color);

									show[0].scrollTop = show[0].scrollHeight;
									AutoClear();
								});

							// Controller Listener
							input.addListener('channelmode', "all", 
								function (e) {
									all_controlb++;
									Bn_show.text(all_controlb);

									/* for loop test */
									if (isLoop) {
										output.send(e.data[0], [e.data[1], e.data[2]]); 										
									}

									var color = "#0BA4FF";
									var raw = e.data;

									var processed = RawDataProcessing(raw);   
									createElement(devName, processed, color);

									show[0].scrollTop = show[0].scrollHeight;
									AutoClear();
								});

							// Program Change Listener
							input.addListener('programchange', "all", 
								function (e) {
									all_programchange++;
									Cn_show.text(all_programchange);

									/* for loop test */
									if (isLoop) {
										output.send(e.data[0], [e.data[1]]); 										
									}

									var color = "#B543CC";
									var raw = e.data;

									var processed = RawDataProcessing(raw);   
									createElement(devName, processed, color);

									show[0].scrollTop = show[0].scrollHeight;
									AutoClear();
								});

							// Channel After Listener
							input.addListener('channelaftertouch', "all", 
								function (e) {
									all_channelaftertouch++;
									Dn_show.text(all_channelaftertouch);

									/* for loop test */
									if (isLoop) {
										output.send(e.data[0], [e.data[1]]); 										
									}

									var color = "#32D6DA";
									var raw = e.data;

									var processed = RawDataProcessing(raw);   
									createElement(devName, processed, color);

									show[0].scrollTop = show[0].scrollHeight;
									AutoClear();
								});

							// Pitchbend Listener
							input.addListener('pitchbend', "all", 
								function (e) {
									all_pitchbend++;
									En_show.text(all_pitchbend);

									/* for loop test */
									if (isLoop) {
										output.send(e.data[0], [e.data[1], e.data[2]]); 										
									}

									var color = "#FF0683";
									var raw = e.data;

									var processed = RawDataProcessing(raw);   
									createElement(devName, processed, color);

									show[0].scrollTop = show[0].scrollHeight;
									AutoClear();
								});

							// Sysex Listener
							input.addListener('sysex', "all", 
								function (e) {
									all_sysex++;
									Sysex_show.text(all_sysex);

									console.log(e.data.length);


									/* for loop test */
									if (isLoop) {
										var tempArr = [];
										var sendArr = [];
										for (var i = 0; i < e.data.length; i++) {
											sendArr.push(e.data[i]);
											var tempStr = e.data[i].toString(16);
											if (tempStr.length < 2) {
												tempStr = "0" + tempStr;
												tempArr.push(tempStr);
											}else {
												tempArr.push(tempStr);
											}
										};
										sendArr.shift();
										sendArr.pop();
										output.sendSysex([], sendArr);
									}

									var color = "#FFFF8E";
									var raw = e.data;

									var processed = RawDataProcessing(raw);   
									createElement(devName, processed, color);

									show[0].scrollTop = show[0].scrollHeight;
									AutoClear();
								});

							// F1 Listener
							input.addListener('timecode', "all", 
								function (e) {

									var color = "red";
									var raw = e.data;

									var processed = RawDataProcessing(raw);   
									createElement(devName, processed, color);

									show[0].scrollTop = show[0].scrollHeight;
									AutoClear();
								});

							// F2 Listener
							input.addListener('songposition', "all", 
								function (e) {

									var color = "red";
									var raw = e.data;

									var processed = RawDataProcessing(raw);   
									createElement(devName, processed, color);

									show[0].scrollTop = show[0].scrollHeight;
									AutoClear();
								});

							// F3 Listener
							input.addListener('songselect', "all", 
								function (e) {

									var color = "red";
									var raw = e.data;

									var processed = RawDataProcessing(raw);   
									createElement(devName, processed, color);

									show[0].scrollTop = show[0].scrollHeight;
									AutoClear();
								});

							// F6 Listener
							input.addListener("tuningrequest", "all", 
								function (e) {

									var color = "red";
									var raw = e.data;

									var processed = RawDataProcessing(raw);   
									createElement(devName, processed, color);

									show[0].scrollTop = show[0].scrollHeight;
									AutoClear();
								});

							// F8 Listener
							// input.addListener('clock', "all", 
							// 	function (e) {

							// 		var color = "red";
							// 		var raw = e.data;

							// 		var processed = RawDataProcessing(raw);   
							// 		createElement(devName, processed, color);

							// 		show[0].scrollTop = show[0].scrollHeight;
							// 		AutoClear();
							// 	});

							// FA Listener
							input.addListener('start', "all", 
								function (e) {

									var color = "red";
									var raw = e.data;

									var processed = RawDataProcessing(raw);   
									createElement(devName, processed, color);
									show[0].scrollTop = show[0].scrollHeight;

									AutoClear();
								});

							// FB Listener
							input.addListener('continue', "all", 
								function (e) {

									var color = "red";
									var raw = e.data;

									var processed = RawDataProcessing(raw);   
									createElement(devName, processed, color);

									show[0].scrollTop = show[0].scrollHeight;
									AutoClear();
								});

							// FC Listener
							input.addListener('stop', "all", 
								function (e) {

									var color = "red";
									var raw = e.data;

									var processed = RawDataProcessing(raw);   
									createElement(devName, processed, color);

									show[0].scrollTop = show[0].scrollHeight;
									AutoClear();
								});

							// FE Listener
							// input.addListener('activesensing', "all", 
							// 	function (e) {

							// 		var color = "red";
							// 		var raw = e.data;

							// 		var processed = RawDataProcessing(raw);   
							// 		createElement(devName, processed, color);

							// 		show[0].scrollTop = show[0].scrollHeight;
							// 		AutoClear();
							// 	});

							// FF Listener
							input.addListener('reset', "all", 
								function (e) {

									var color = "red";
									var raw = e.data;

									var processed = RawDataProcessing(raw);   
									createElement(devName, processed, color);

									show[0].scrollTop = show[0].scrollHeight;
									AutoClear();
								});




							/********* Output Section ********/

							// Note On C3
							noteon.click(function(){
								output.playNote("C3", 1, {velocity: 1});

								if( isLoop )
								{
									temp_loop_flag = 1;
								}
							});	

							// Note Off C3
							noteoff.click(function(){
								output.stopNote("C3", 1, {velocity: 1});
							});	

							// Serial Number Query
							serial.click(function(e){
								output.sendSysex([],[0x00,0x20,0x2b,0x69,0x01,0x02]);
							});

							// Note On C3 continuity 200ms/time
							continuity.click(function(){
								if (clickTime % 2 === 0) {
									clickTime++;
									continuity.html("<strong>Stop</strong>");
									continuity.css("color", "red");
									stop = setInterval(function(){
										output.playNote("C3", 1, {velocity: 1});
									}, 200);
								} else {
									clickTime++;
									clearInterval(stop);
									continuity.html("<strong>Noto On C3 Continuity</strong>");
									continuity.css("color", "black");
								}
							});

							// Just send
							send.click(function(){

								var data = message.val();
								if (data === "") {
									alert("The input value can not be empty!");
								} else {
									var dataArr = data.split(" ");
									// console.log(dataArr);
									var statusArr = [];
									var midiData = [];
									var status = "";

									// dataArr.forEach(function(value, index, array){
									dataArr.forEach(function(value, index, array){
										var item = "0x" + value.toUpperCase();

										if (singleMidi.indexOf(item) >= 0){
											statusArr.push(item);
											status = statusArr.shift();
											// console.log(status);
											// console.log(midiData);
											output.send(status, midiData);    // empty midiData
											midiData.splice(0,midiData.length);
											} else if (item > 127 && item < 256 && item != 247) {
												statusArr.push(item);
												if (statusArr.length > 1 || index == (array.length-1)) {
													status = statusArr.shift();
													// console.log(status);
													// console.log(midiData);
													output.send(status, midiData);
													midiData.splice(0,midiData.length);    // empty midiData
												}
											} else if (item < 128 || item == 247) {
												midiData.push(item);									
												if (index == (array.length-1)) {      // is the last element of array
													status = statusArr.shift();
													// console.log(status);
													// console.log(midiData);	
													output.send(status, midiData);
												}
											}
										});
								}
							});
							















						});
					}
				}
			}
		}, true);		
	});



	


	// return Array
	function RawDataProcessing(data) {
		var tempArr = [];
		for (var i = 0; i < data.length; i++) {
			var str = data[i].toString(16).toUpperCase();
			if (str.length < 2) {
				str = "0" + str;
				tempArr.push(str);
			} else {
				tempArr.push(str);
			}
		}
		return tempArr;
	}

	// return none
	function createElement(name, arr, color){

		// Customary
		var timestamp = (new Date()).valueOf().toString();
		// &ensp; -- An English space placeholder
		var message = (timestamp + "&emsp;&emsp;&emsp;" + name + "&emsp;&emsp;&emsp;" + arr.join("&ensp;"));


		// Modified
		// var timestamp = (new Date()).valueOf().toString();
		// &ensp; -- An English space placeholder
		// var message = ("&emsp;&emsp;&emsp;" + name + "&emsp;&emsp;&emsp;" + arr.join("&ensp;"));


		var elemet = $("<span>" + message + "</span>");
		elemet.css("color", color);
		var br = $("<br>");
		show.append(elemet);
		show.append(br);
	}

	// MIDI Message > 200 and SysEx Message will auto clear the Input Section
	function AutoClear() {
		var sum = all_noteon + all_noteoff + all_keyaftertouch + all_controlb + all_pitchbend + all_channelaftertouch + all_programchange;
		if ((sum+2)%302 == 0 || (all_sysex+1)%200 == 0) {
			Clear();
		}
	}

	// Refresh current page
	refresh.click(function(){
		window.location.reload();
	});

	// Reset calculation
	reset.click(function(){		
		all_noteoff = 0;
		all_noteon = 0;	
		all_keyaftertouch = 0;	
		all_controlb = 0;	
		all_programchange = 0;	
		all_channelaftertouch = 0;	
		all_pitchbend = 0;		
		all_sysex = 0;	

		timeIntervalMax = 0;

		Noteoff_show.text(0);
		Noteon_show.text(0);
		An_show.text(0);
		Bn_show.text(0);
		Cn_show.text(0);
		Dn_show.text(0);
		En_show.text(0);
		Sysex_show.text(0);
	});

	// Clear Input Section
	clear.click(function(){
		Clear();
	});	

	// Clear shown message
	function Clear(){
		show.text(" ");
	}

	// Avg for Looptime delay
	function avgFun(arr) {
		var sum = 0;
		var avg = 0;
		for (var i=0; i<arr.length; i++){
			sum += arr[i]; 
		}
		avg = (sum / arr.length).toFixed(1);
		return avg;
	}

	function SetLoopFalse(){
		setLoop.attr("class", "btn btn-danger col-md-5 col-md-offset-1");
		loopSign.attr("class", "glyphicon glyphicon-remove-sign");	
		isLoop = false;
	}

});

