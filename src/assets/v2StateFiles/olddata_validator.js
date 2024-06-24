/*
 * jQuery Data Validator Plugin for old datastring
 */

(function($){

		var settings = {			
				
		};
		var version = 2000;
		/*
    	 * CLS-OTM is not working, the preview is not showing correct answers : 
    	 * This is happening for a special type of question where CSO is none but 
    	 * version is 2010. As CSO is not present version in olddata_validator is 
    	 * changed to 2000 and class_set is set to class name. Hence this 'status'
    	 * flag is added for checking 
    	 */
		var status = false;
		var methods = {
				init : function( inputStr,callbackFun,callbackData ) { 
					try{	
						this.image_list = [];
						var tempDataMap = null; 	
						tempDataMap = new Object();	
						
						var dataMap = null; 	
						dataMap = {};	
						
						inputStr = inputStr.replace(/;deviceMode=design/g, "");
						
						if(isEncoded(inputStr)) {
							var unescapedString =  unescape(inputStr);
							status = true;
						} else {
							var unescapedString =  inputStr;
						}
						
						var params = unescapedString.split(";");
						for (var counter = 0;counter < params.length; counter++) {
							var key = params[counter].substr(0, params[counter].indexOf("="));
							var value = params[counter].substr(params[counter].indexOf("=") + 1);
							tempDataMap[key]=value;
						}	
						
						if(unescapedString.match(/CSO=/ig)){
							version = 2010;
							if(unescapedString.match(/ICS=/ig)){
								version = 2011;
							}
						}
						
						dataMap = this.fixCommonData(tempDataMap,dataMap,callbackData);						
						dataMap = this.fixFrameData(tempDataMap,dataMap);
						dataMap = this.changeFrameElmToCanvasElm(dataMap);//for dragbound issue in frame ELement, all the frame element beyond the frame position and frame height width is now in canvas through this method.
						dataMap = this.fixExerciseData(tempDataMap,dataMap);
						dataMap.adminData.version = version;
						this.image_list = unescapedString.match(/([^,|%]+)\.(jpg|png|gif)/ig);						
						dataMap.adminData.imageList = this.image_list;
						
						if(mode == MODE_DESIGN){
							//var mediaFlag = this.checkImageExists(this.image_list);
							//if(mediaFlag)
							return dataMap;
						}else{						
							ClickDrag.GlobalVars.originalValue = dataMap;
							ClickDrag.GlobalVars.shellData.dataMap = dataMap;
							callbackData.shellInput = dataMap;
							callbackFun(callbackData);
							
						}
					}catch(err){
						console.info('****** Error in olddata_validator :: init ****** :'+err.message);
					}
					
					
					function isEncoded(str) {
						try{
							if(str.match(/ET%3D/)) {
								return true;
							} else if(str.match(/ET=/)) {
								return false;
							}
						}
						catch(err){
							console.info('****** Error in olddata_validator :: isEncoded ****** :'+err.message);
						}
					}
						
		},
		checkImageExists: function(imageArray){
			try{
				var mediaNotFoundStr ="";
				var mediaValueArray = window.CD.mediaValue;				
				for(var eachimg in imageArray){
					var imageIndex = $.inArray(imageArray[eachimg],mediaValueArray); 
					if(imageIndex == -1){
						mediaNotFoundStr = mediaNotFoundStr +" " + imageArray[eachimg];
					}
				}
				
				if(mediaNotFoundStr != ""){
					removeModalWindow();								
					createModalWindow("Sorry could not process the string as :"+mediaNotFoundStr + " are missing.");
					return false;
				}
				return true;
				
			}catch(e){
				console.info('****** Error in check Image Exists ****** :'+error.message);
			}
		},
		getEachSubscriptChar : function(char0){
			var textSbSpScript=new TextSuperSubScript();
			console.log("@frame_component.getEachSubscriptChar");
			var subCharArr = textSbSpScript.getSubscriptCharecterList();
			//char0=char0.toLowerCase();
			if(subCharArr[char0.toLowerCase()]){
				return subCharArr[char0.toLowerCase()];//will be lower case if and only if its subscript is available
			}else{
				return char0;
			}
		},
		getEachSuperscriptChar : function(char0){
			var textSbSpScript=new TextSuperSubScript();
			console.log("@frame_component.getEachSubscriptChar");
			var superCharArr = textSbSpScript.getSuperscriptCharecter();
			//char0=char0.toLowerCase();
			if(superCharArr[char0]){
				return superCharArr[char0];//will be lower case if and only if its superscript is available
			}else{
				return char0;
			}
		},
		checkSubTagExist : function(value){
			console.log("@frame_component.checkSubTagExist");
			if(value.match(/<sb>[a-zA-Z0-9\+-=\(\)\<\>\.\^ ]+<\/sb>/g)){
				return true;
			}
		},
		checkSupTagExist : function(value){
			 if(value.match(/<sp>[a-zA-Z0-9\+-=\(\)\<\>\.\^ ]+<\/sp>/g)){
					return true;
				}
		},
		_convertSbSpscript : function(value){
			try{
				var returnValue=value.replace(/<\/sb><sb>/g,'').replace(/<\/sp><sp>/g,'');
				var converTedArr=[];
				var frameObj=this;
				var returnFalse=true;
				
				//subscript
				if(methods.checkSubTagExist(returnValue)){
					//var matchArr=returnValue.match(/<sb>[a-zA-Z0-9\+-=\(\)\<\>\.\^ ]+<\/sb>/g);
					var matchArr=returnValue.match(/<sb>[a-zA-Z0-9\+-=\(\)\.\^\<\>\\ ]+<\/sb>/g);
					$.each(matchArr,function(index,vals){
						var sbReplace=vals.replace(/<sb>/g,'').replace(/<\/sb>/g,'');
						var finalreplace='';
						for(var strt=0;strt<sbReplace.length;strt++){
							if(typeof sbReplace[strt]!=="undefined"){
								if(methods.getEachSubscriptChar(sbReplace[strt])===sbReplace[strt] && sbReplace[strt]!== ' '){//checking added for ' '
									returnFalse=false;
									return sbReplace[strt];
								}else{
									finalreplace=finalreplace+frameObj.getEachSubscriptChar(sbReplace[strt]);
								}
							}
						
						}
						//converTedArr[index]=finalreplace;
						returnValue=returnValue.replace(matchArr[index],finalreplace);	
					});
				}
				//superscript
				if(methods.checkSupTagExist(returnValue)){
					//var matchArr1=returnValue.match(/<sp>[a-zA-Z0-9\+-=\(\)\<\>\.\^ ]+<\/sp>/g);
					var matchArr1=returnValue.match(/<sp>[a-zA-Z0-9\+-=\(\)\.\^\<\>\\ ]+<\/sp>/g);
					$.each(matchArr1,function(index1,vals1){
						try{
							var sbReplace1=vals1.replace(/<sp>/g,'').replace(/<\/sp>/g,'');
							var finalreplace1='';
							for(var strt1=0;strt1<sbReplace1.length;strt1++){
								if(typeof sbReplace1[strt1]!=="undefined"){
									if(methods.getEachSuperscriptChar(sbReplace1[strt1])===sbReplace1[strt1] && sbReplace1[strt1]!== ' '){//checking added for ' '
										returnFalse=false;
										return false;
									}else{
									finalreplace1=finalreplace1+frameObj.getEachSuperscriptChar(sbReplace1[strt1]);
									}
								}
							
							}
							//converTedArr[index]=finalreplace;
							returnValue=returnValue.replace(matchArr1[index1],finalreplace1);
						}catch(err){
							console.info("Error inside olddata_validator._converSbSpscript.each::"+err.message);
						}
							
					});
				}
				if(returnFalse){
					return returnValue;
				}else{
					return value;
				}				
			}catch(err){
				console.info("Error in olddata_validator._convertSbSpscript::"+err.message);
			}
		},
		/**
		 * This is used for converting text with html tags, coming from Old BECB string.
		 */
		prepareTextData : function(textData){
			try{
				textData = textData.replace(/%c%/g,',').replace(/%s%/g,';').replace(/(<(p|div|span)([^>]+)>)/g,"").replace(/<\/(p|div|span)>/g,"");//Modified to escape character like < and > :: DEfect id : 4484
				textData = textData.replace(/<br>/g,'\n');	
				textData = textData.replace(/%s%/g,';');
				textData = methods._convertSbSpscript(textData);
				
				return textData;
			}catch(err){
				console.log("Error @olddata_validator.prepareTextData::"+err.message);
			}
				
		},

		/**
		 * This is used for preparing frame data for old data string
		 * called from : init()
		 * @param : frameIndexId(frame id viz: 0,1 etc ..) & dataVal (CFO,CF1..)
		 * @returns : frame data as object
		 * @author 552756(Nabonita Bhattacharyya)
		 */
		prepareFrameData : function(frameIndexId,dataVal,dataMap){
			try{
				var dataArr = dataVal;
				var frameData = {};
				/**
				 *For frame '0' from old data string frameX and frameY are made '0'
				 *and there values are kept in originalX and originalY respectively
				 *this is adjusted when required
				 */
				if(frameIndexId === '0'){
					frameData.frameX = 0;
					frameData.frameY = 0;
					frameData.frameOriginalX = dataArr[0];
					frameData.frameOriginalY = dataArr[1];
					frameData.frameHeight = dataMap.adminData.AH;
					frameData.frameWidth = dataMap.adminData.AW;
				}else{
					frameData.frameX = dataArr[0];
					frameData.frameY = dataArr[1];
					frameData.frameOriginalX = dataArr[0];
					frameData.frameOriginalY = dataArr[1];
					frameData.frameWidth = dataArr[2];
					frameData.frameHeight = dataArr[3];
				}
				
				
				
				/** **** For image list **** **/
				var frameImageList = {};
				if(dataArr[4].indexOf('%d%')>-1){
					var imageArr = dataArr[4].split('%d%');
					for(var eachImage in imageArr){
						var singleImageArr = imageArr[eachImage].split('|');
						var imageId = 'img_'+frameIndexId+'_'+eachImage;
						frameImageList[imageId] = {
								'src':singleImageArr[0],
								'imageScaleFactor':singleImageArr[1],
								'imageX':singleImageArr[2],
								'imageY':singleImageArr[3]
						};
						if(frameIndexId === '0' && mode != 'design'){
							frameImageList[imageId].imageX = parseInt(frameImageList[imageId].imageX)+parseInt(frameData.frameOriginalX);
							frameImageList[imageId].imageY = parseInt(frameImageList[imageId].imageY)+parseInt(frameData.frameOriginalY);
						}
						this.image_list.push(singleImageArr[0]);
						if(frameData.frameX !== parseInt(frameData.frameOriginalX) || frameData.frameY !== parseInt(frameData.frameOriginalY)){
							frameImageList[imageId].imageX = parseInt(frameImageList[imageId].imageX);
							frameImageList[imageId].imageY = parseInt(frameImageList[imageId].imageY);
						}
						/** --- this is done for authoring side, as there was no checking for frameY difference ---- **/
						if((frameData.frameX == parseInt(frameData.frameOriginalX)) && (frameData.frameY !== parseInt(frameData.frameOriginalY))){
							frameData.frameOriginalX = parseInt(frameData.frameOriginalX)-1;
						}
					}
				}else{
					if(dataArr[4]!==''){
						var singleImageArr = dataArr[4].split('|');
						var imageId = 'img_'+frameIndexId+'_0';
						frameImageList[imageId] = {
								'src':singleImageArr[0],
								'imageScaleFactor':singleImageArr[1],
								'imageX':singleImageArr[2],
								'imageY':singleImageArr[3]
						};
						if(frameIndexId == '0' && mode != 'design'){
							frameImageList[imageId].imageX = parseInt(frameImageList[imageId].imageX)+parseInt(frameData.frameOriginalX);
							frameImageList[imageId].imageY = parseInt(frameImageList[imageId].imageY)+parseInt(frameData.frameOriginalY);
						}
						this.image_list.push(singleImageArr[0]);
						if(frameData.frameX !== parseInt(frameData.frameOriginalX) || frameData.frameY !== parseInt(frameData.frameOriginalY)){
							frameImageList[imageId].imageX = parseInt(frameImageList[imageId].imageX);
							frameImageList[imageId].imageY = parseInt(frameImageList[imageId].imageY);
						}
					}
				}
				
				frameData.frameImageList = frameImageList;
				
				/** **** For text list **** **/
				var frameFinalTextList = [];
				//if(dataArr[5].indexOf('%d%')>-1){
				var textArr = dataArr[5].split('%d%');
				/** --- this is done for setting frame text default values if no frame text is there --- **/
				if(textArr != ''){
					for(var eachText in textArr){
						var singleTextArr = textArr[eachText].split('|');
						//Added 2010 check to increase 1px frame text font size by SS for CTCD-131
						if(version == 2010 || version == 2011){
							singleTextArr[2] = (singleTextArr[2])*1 + 1;
						}
						frameTextList = {
								'textValue':methods.prepareTextData(singleTextArr[0]),
								'maxWidth':singleTextArr[1],
								'fontSize':singleTextArr[2],
								'border':singleTextArr[3],
								'textX':singleTextArr[4],
								'textY':singleTextArr[5],
								'textGroupObjID':'txt_'+eachText+'_'+frameIndexId
						};
						
						/*if(parseInt(frameTextList.textX) < 0){
							frameTextList.textX = parseInt(frameTextList.textX)-parseInt(frameTextList.textX);
						}*/
						
						if(frameIndexId == '0'/* && mode == 'test'*/){
							//frameTextList.textX = parseInt(frameTextList.textX)+parseInt(frameData.frameOriginalX)+15;
							//frameTextList.textY = parseInt(frameTextList.textY)+parseInt(frameData.frameOriginalY)+15;
						//}else if(frameIndexId == '0' && mode == 'design'){
							frameTextList.textX = parseInt(frameTextList.textX)+parseInt(frameData.frameOriginalX)+16;
							frameTextList.textY = parseInt(frameTextList.textY)+parseInt(frameData.frameOriginalY)+16;
						}
						
						if(frameIndexId != '0' /*&& mode == 'design'*/){
							frameTextList.textX = parseInt(frameTextList.textX);
							frameTextList.textY = parseInt(frameTextList.textY);
						}
						/** ---- For old string, id border is on fill becomes on ---- **/
						if(frameTextList.border == 'T'){
							frameTextList.fill = 'T';
						}else{
							if(frameTextList.border == 'F'){
								frameTextList.fill = 'F'
							}
						}
						var align=undefined;
						if(singleTextArr[0].match(/<p align="(left|right|center)">([\W\w\r\n]*)<\/p>([\W\w\r\n]*)/g) != null){
							align = singleTextArr[0].replace(/<p align="(left|right|center)">([\W\w\r\n]*)<\/p>([\W\w\r\n]*)/g,'$1');
						}
											
						frameTextList.textAlign = align ? align : 'center';
						//frameTextList.textAlign = 'center';
						frameTextList.fontType = 'normal';
						frameTextList.underlineVal = 'F';
						frameFinalTextList.push(frameTextList);
					}
				}else{
					frameTextList = {
							'textValue':'',
							'maxWidth':'',
							'fontSize':dataMap.adminData.GFS,
							'border':'F',
							'textX':'',
							'textY':'',
							'textAlign' : 'center',
							'fontType' :'normal',
							'underlineVal':'F'
					};
				}			
				
				frameData.frameTextList = frameFinalTextList;
				
				/** **** For frame student gui **** **/
				var frameStudentGUI = [
				    {
						'Component' : 'R', 
						'x' : '',
						'y' : '',
						'visible':false
					},
					{
						'Component' : 'Z', 
						'x' : '',
						'y' : '',
						'visible':false
					}
				];
				
				var studentGui = dataArr[6].split('%d%');
				for(var eachGui in studentGui){
					var singleGUIArr = studentGui[eachGui].split('|');
					
					var buffer = 0;
					if(eachGui == '0'){
						buffer = 60;
					}else{
						buffer = 120;
					}
					
					if(singleGUIArr[0] == 'R'){
						if(parseInt(frameIndexId) == 0){
							frameStudentGUI[0].x = singleGUIArr[1] != '' ? parseInt(singleGUIArr[1])+parseInt(frameData.frameOriginalX)+12 : parseInt(dataMap.adminData.AW) - buffer ;
							frameStudentGUI[0].y = singleGUIArr[2] != '' ? parseInt(singleGUIArr[2])+parseInt(frameData.frameOriginalY)+23 :  parseInt(dataMap.adminData.AH) - 30;
							frameStudentGUI[0].visible = true;
						} else {
							dataMap.FrameData[0].frameStudentGUI[0].x = '' ? parseInt(dataMap.adminData.AW) - buffer : parseInt(singleGUIArr[1]) + parseInt(frameData.frameX) + 12;
							dataMap.FrameData[0].frameStudentGUI[0].y = '' ? parseInt(dataMap.adminData.AH) - 30 : parseInt(singleGUIArr[2]) + parseInt(frameData.frameY) + 13;
							dataMap.FrameData[0].frameStudentGUI[0].visible = true;
						}
					}else{
						if(singleGUIArr[0] == 'Z'){
							if(parseInt(frameIndexId) == 0){
								frameStudentGUI[1].x = singleGUIArr[1] != '' ? parseInt(singleGUIArr[1])+parseInt(frameData.frameOriginalX)+12 : parseInt(dataMap.adminData.AW) - buffer ;
								frameStudentGUI[1].y = singleGUIArr[2] != '' ? parseInt(singleGUIArr[2])+parseInt(frameData.frameOriginalY)+23 :  parseInt(dataMap.adminData.AH) - 30;
								frameStudentGUI[1].visible = true;
							} else {
								dataMap.FrameData[0].frameStudentGUI[1].x = '' ? parseInt(dataMap.adminData.AW) - buffer : parseInt(singleGUIArr[1]) + parseInt(frameData.frameX) + 12;
								dataMap.FrameData[0].frameStudentGUI[1].y = '' ? parseInt(dataMap.adminData.AH) - 30 : parseInt(singleGUIArr[2]) + parseInt(frameData.frameY) + 13;
								dataMap.FrameData[0].frameStudentGUI[1].visible = true;
							}
						}
					}
					/** commented for reset,zoom position issue **/
					/*if((version == 2000 || version == 2010 || version == 2011) && mode != 'design'){
						frameData.frameBGVisible = 't';
						if(singleGUIArr[0] == 'R'){
							frameStudentGUI[0].x = parseInt(singleGUIArr[1]);
							frameStudentGUI[0].y = parseInt(singleGUIArr[2]);
						}else{
							if(singleGUIArr[0] == 'Z'){
								frameStudentGUI[1].x = parseInt(singleGUIArr[1]);
								frameStudentGUI[1].y = parseInt(singleGUIArr[2]);
							}
						}
					}*/
					
					
				}
					
				frameData.frameStudentGUI = frameStudentGUI;
				
				frameData.frameBGVisible = dataArr[7];
				frameData.frameFlag = dataArr[8];
				frameData.frameMediaList = dataArr[9];
				if(version == 2000 || version == 2010 || version == 2011){
					frameData.frameBGVisible = 't';
				}
				
				/** **** For frame media x and y **** **/
				var frameMediaXY = {};
				frameMediaXY.x = dataArr[10].split('|')[0];
				frameMediaXY.y = dataArr[10].split('|')[1];
				
				if(frameData.frameX !== frameData.frameOriginalX || frameData.frameY !== frameData.frameOriginalY){
					frameMediaXY.x = parseInt(frameMediaXY.x)+parseInt(frameData.frameOriginalX);
					frameMediaXY.y = parseInt(frameMediaXY.y)+parseInt(frameData.frameOriginalY);
				}
				frameMediaXY.y = parseInt(frameMediaXY.y) + 4;
				frameData.frameMediaXY = frameMediaXY;
				
				frameData.frameOptionX = dataArr[11];
				
				frameData.frameOptionY = dataArr[12];
				
				frameData.frameLabelObj = dataArr[13];
				
				frameData.frameFIBOutput = dataArr[14];
				frameData.frameFIBButtonX = dataArr[15];
				frameData.frameFIBButtonY = dataArr[16];
				return frameData;
			}
			catch(error){
				console.info('****** Error in olddata_validator :: prepareFrameData ****** :'+error.message);
			}
		},
		fixCommonData : function(tempDataMap,dataMap,callbackData) {
			dataMap.adminData = {};
			var defaults = {
					'AH' 	: '600',
					'AVP' 	: '233,359',
					'AW'	: '800',
					'CSO'	: 'none',
					'GFS'	: '14',
					'HGL'	: '',
					'HRO': 'D',
					'FRO':'D',
					'ICS'	: false,
					'OTM' 	: false,
					'OTO'	: true,
					'RLO'	: 'T',
					'TYPE'	: false,
					'HGL': [],		//horizontal Guide Line, converted to array from a comma separated value
					'VGL': [],		//vertical Guide Line, converted to array from a comma separated value
					'VST'	: '0',
					'ZHP'	: '200,200,425,75,3,200,100,425,375',
					'feedbackHeight':'70',//Added on 23rd July,2013 for feedback
					'feedbackWidth':'120',//Added on 23rd July,2013 for feedback
					'audioList':[],
					'imageList':[],
					'showHintOrFeedbackInAuthoring' : 'none', //Added on 22nd July,2013 for hint-feedback
					'ET':'',
					'SLELD':'120,70',
					'magnificationData':'local'
			};
			
			var adminDataParams = jQuery.extend(true, {}, defaults);
			$.extend(defaults, tempDataMap);
			
			/** for BECB feedback box has same height and width as hint box **/
			
			var ZHP = defaults.ZHP.split(',');
			defaults.feedbackWidth = ZHP[5];
			defaults.feedbackHeight = ZHP[6];
			
			if(defaults['OTO'] == 'true'){
				defaults['OTO'] = true;
			}
			
			if(defaults['OTM'] == 'true'){
				defaults['OTM'] = true;
			}
			
			if(defaults['OTO'] == 'false'){
				defaults['OTO'] = false;
			}
			
			if(defaults['OTM'] == 'false'){
				defaults['OTM'] = false;
			}			
			
			if(defaults['ICS'] == 'true'){
				defaults['ICS'] = true;
			}
			
			if(defaults['TYPE'] == 'true'){
				defaults['TYPE'] = true;
			}
			
			if(defaults['ICS'] == 'false'){
				defaults['ICS'] = false;
			}
			
			if(defaults['TYPE'] == 'false'){
				defaults['TYPE'] = false;
			}
			
			//Checking boolean value for OTO and OTM instead of string by SS for CTCD-121
			if(defaults['OTO'] == true && defaults['OTM'] == true) {
				defaults['OTO'] = false;
			}
			for(var each in adminDataParams){
				dataMap.adminData[each] = defaults[each];
			}
			if(callbackData){		//Checked undefined as authoring mode doesn't pass callbackData
				dataMap.adminData.AH = callbackData.contentHeight;
				dataMap.adminData.AW = callbackData.contentWidth;	
			}
			
			return dataMap;
		},
		
		
		fixFrameData : function(tempDataMap,dataMap) {
			var cfData = new Array();
			var cfCount = 0;			
			var counter = 0;
			dataMap.FrameData = [];
			for(key in tempDataMap) {				
				if(key.match(/CF[0-9]+/)){
					cfCount++;
					var cfData = {};
					cfData = tempDataMap[key].split(",");
					var tmpDefaults = getCFDefaults();
					$.extend(tmpDefaults, cfData);

					var frameIndexId = key.substr(2,3);
					var frameData = this.prepareFrameData(frameIndexId,tmpDefaults,dataMap);
					dataMap.FrameData[frameIndexId] = frameData;
					delete dataMap[key];
				}
			}
			if(cfCount == 0){
				var tmpDefaults = getCFDefaults();

				var frameIndexId = '0';
				var frameData = this.prepareFrameData(frameIndexId,tmpDefaults,dataMap);
				dataMap.FrameData[0] = frameData;
			}
			
			function getCFDefaults() {
				try{
					var cfdefaults = {
							'0'	: '0',
							'1'	: '0',
							'2'	: window.CD.width,
							'3'	: window.CD.height,
							'4'	: '',
							'5'	: '',
							'6'	: '',
							'7'	: 'f',
							'8'	: '1',						
							'9'	: 'N',
							'10': '0|0',
							'11': '233',
							'12': '259',
							'13': '',
							'14': '',
							'15': '',
							'16': ''						
					};
					
					return cfdefaults;
				}
				catch(err){
					console.info('****** Error in olddata_validator :: getCFDefaults ****** :'+err.message);
				}
			}
			return dataMap;
		},
		changeFrameElmToCanvasElm : function(dataMap) {
			var frameData = dataMap.FrameData;
			for(var each in frameData){
				if(each != 0){
					var frameTextToDeleteFromFrame = [];
					var frameOriginalX = frameData[each].frameOriginalX;
					var frameOriginalY = frameData[each].frameOriginalY;
					var frameWidth = frameData[each].frameWidth;
					var frameHeight = frameData[each].frameHeight;
					var frameTextList = frameData[each].frameTextList;
					
					for(var eachText in frameTextList){
						var flag = false;
						var textXFlag = false;
						if(parseInt(frameTextList[eachText].textX) < 0 || (parseInt(frameTextList[eachText].textX) + parseInt(frameTextList[eachText].maxWidth))>parseInt(frameWidth) ){
							frameTextList[eachText].textX = parseInt(frameTextList[eachText].textX)+parseInt(frameOriginalX)+16;
							flag = true;
							textXFlag = true;
						}
						if(parseInt(frameTextList[eachText].textY) < 0 || (parseInt(frameTextList[eachText].textY))>parseInt(frameHeight) || flag == true){
							frameTextList[eachText].textY = parseInt(frameTextList[eachText].textY)+parseInt(frameOriginalY)+16;
							flag = true;
						}
						if(flag == true && textXFlag == false){
							frameTextList[eachText].textX = parseInt(frameTextList[eachText].textX)+parseInt(frameOriginalX)+16;
						}
						if(flag == true ){
							frameTextToDeleteFromFrame.push(frameTextList[eachText]);
						}
					}
					if(frameTextToDeleteFromFrame.length>0){
						frameTextList = jQuery.grep(frameTextList,function (item) {
						    return jQuery.inArray(item, frameTextToDeleteFromFrame) < 0;
						});
						for(var key in frameTextList){
							frameTextList[key].textGroupObjID = "txt_" +key+"_"+each;
						}
						frameData[each].frameTextList = frameTextList;
						var lastTextGrpId = (frameData[0].frameTextList.length);
						for(var i=0;i<frameTextToDeleteFromFrame.length;i++){
							frameTextToDeleteFromFrame[i].textGroupObjID = "txt_" +lastTextGrpId+"_0";
							frameData[0].frameTextList.push(frameTextToDeleteFromFrame[i]);
							lastTextGrpId++;
						}
						
						
					}
				}
			}
			return dataMap;
		},
		
		
		fixExerciseData : function(tempDataMap,dataMap) {
			var et = tempDataMap['ET'];
			switch(et){
			case 'SLE':			
				return this.fixSLEData(tempDataMap,dataMap);
				break;
			case  'SEQ':
				return this.fixSEQData(tempDataMap,dataMap);			
				break;
			case 'CLS':
				return this.fixCLSData(tempDataMap,dataMap);	
				break;
			case 'COI':
				return this.fixCOIData(tempDataMap,dataMap);	
				break;
			case 'PRG':
				return this.fixPRGData(tempDataMap,dataMap);	
				break;	
			}
		},
		/***
		 * description : this is used for preparing exercise data for SLE
		 * @param : tempDataMap and dataMap
		 * @returns : dataMap
		 * @author 552756(Nabonita Bhattacharyya)
		 */
		fixSLEData : function(tempDataMap,dataMap) {
			var sleData = new Array();
			var sleCount = 0;
			var totalDistractorCnt = 0;
			var slern = '';
			var counter = 0;
			dataMap.SLEData = {};
			var tempTransparency;
			var tempTransparencyBorder;
			var docTempTransparency = "F";
			if(mode == 'design'){
				for(key in tempDataMap) {				
					if(key.match(/SLE[0-9]+/)){
						var sleData1 = {};
						sleTmpData = tempDataMap[key].split(",");
						$.extend(sleData1, sleTmpData);
						if(sleData1["16"]=="F"){
							tempTransparencyBorder = "T";
						}
						if(sleData1["17"]=="T"){
							tempTransparency = "T";
						}
						if(sleData1["20"] == "T"){
							docTempTransparency = "T";
							if(version == 2011){
								tempTransparencyBorder = "T";
							}
						}
					}
				}	
			}
			
			
			for(key in tempDataMap) {				
				if(key.match(/SLE[0-9]+/)){
					slern += sleCount + ',';
					sleCount++;
					var sleData = {};
					sleData = tempDataMap[key].split(",");
					var tmpDefaults = getSLEDefaults();
					$.extend(tmpDefaults, sleData);
					var labelId = 'label_'+key.substr(3);
					var sleData = this.prepareSLEData(tmpDefaults,dataMap,labelId,tempTransparencyBorder,tempTransparency,docTempTransparency);//dataMap is passed 'showHintOrFeedbackInAuthoring' in adminData
					dataMap.SLEData[key] = sleData;
					delete dataMap[key];
				}
			}
			this.checkForZoomInAuthoring(dataMap);
			this.fixSleOTM(dataMap);
			
			slern = slern.substr(0, (slern.length-1));
			
			var slecommon = {					
					'SLEGV'	: '',
					'SLELD'	: '120,70',
					'DCKLD' : '120,70',					
					'SLERN' : slern,
					'SLERQ'	: '',
					'SLEDC' : ''
			};
			
			$.extend(slecommon, tempDataMap);
			
			/* this is used to get the distractor count to populate SLEPS.totalRandomDistractors */
			var sleDataLen = Object.keys(dataMap.SLEData).length;
			for(var cnt = 0; cnt < sleDataLen; cnt ++){
				var sleId = 'SLE'+cnt;
				if(dataMap.SLEData[sleId].distractor_label == 'T'){
					totalDistractorCnt++;
				}
			}
			var noOfLabels = 0;
			for(var cnt = 0; cnt < sleDataLen; cnt ++){
				var sleId = 'SLE'+cnt;
				if(dataMap.SLEData[sleId].distractor_label != 'T'){
					noOfLabels++;
				}
			}
			var totalRandomLabel = tempDataMap.SLEPS[0];
			sleCount = noOfLabels;
			if(totalRandomLabel>noOfLabels){
				totalDistractorCnt = totalRandomLabel - noOfLabels;
			}
			var hideFillBorderCheck = false;
			if(version ==2010 || version ==2011){
				for(var key in dataMap.SLEData){
					if(dataMap.SLEData[key].transparent == 'T'){
						hideFillBorderCheck = true;
					}
				}
			}
			
			
			
			
			/** ---------- For SLEPS start -------------- **/
			var SLEPS = {
				'totalRandomLabels': sleCount, 
				'totalRandomDistractors': totalDistractorCnt, 
				'showFeedbackAfter': 'N',
				'showInstantFeedbackAfter': 'N',
				'showHintsAfter': 0,
				'studentGradeFormat': 'P',	
				'discrete':'F'
			};
			
			var slepsArr = tempDataMap.SLEPS.split(',');
			
			//SLEPS.totalRandomLabels = slepsArr[0];
			SLEPS.showFeedbackAfter = slepsArr[1];
			SLEPS.showInstantFeedbackAfter = slepsArr[2];
			SLEPS.showHintsAfter = slepsArr[3];
			SLEPS.studentGradeFormat = slepsArr[4];
			
			dataMap.SLEPS = SLEPS;
			
			/** ---------- For SLEPS end -------------- **/
			
			/** ---------- For SLEGP start -------------- **/
			if(tempDataMap.SLEGP){
				var slegpArr = tempDataMap.SLEGP.split(',');
				
				dataMap.SLEGP = {};
				dataMap.SLEGP.borderGlobal = slegpArr[0];
				dataMap.SLEGP.backGroundGlobal = slegpArr[1];
				dataMap.SLEGP.labelBorderGlobal = slegpArr[2];
				dataMap.SLEGP.labelBGGlobal = slegpArr[3];
				dataMap.SLEGP.dockBGGlobal = slegpArr[4];
			} else {
				dataMap.SLEGP = {};
				dataMap.SLEGP.borderGlobal = 'T';
				dataMap.SLEGP.backGroundGlobal = 'T';
				dataMap.SLEGP.labelBorderGlobal = 'N';
				dataMap.SLEGP.labelBGGlobal = 'N';
				dataMap.SLEGP.dockBGGlobal = 'N';
			}
			/** ---------- For SLEGP end -------------- **/
			
			/** ---------- For other common data start -------------- **/
			var sleCommonData = prepareSLECommonData(tempDataMap,dataMap);
			preparePublishOptions(dataMap);
			dataMap.adminData.DOCSAMEASLABEL = true;//For SLE dock is always same size as label
			if(hideFillBorderCheck == true){
				dataMap.SLEGP.backGroundGlobal = 'F';
				dataMap.SLEGP.borderGlobal = 'F';
			}
			
			
			/***
			 * This is used for preparing common data for SLE
			 * @param tempDataMap
			 * @param dataMap
			 * @author 552756(Nabonita Bhattacharyya)
			 */
			function prepareSLECommonData(tempDataMap,dataMap){
				try{
					dataMap.SLEGV = tempDataMap.SLEGV;
					dataMap.SLELD = tempDataMap.SLELD;
					dataMap.DCKLD = tempDataMap.SLELD;//As for SLE dock and label are of same sizes
					dataMap.SLERN = tempDataMap.SLERN;
					dataMap.SLERQ = tempDataMap.SLERQ;
					dataMap.SLEDC = tempDataMap.SLEDC != undefined ? tempDataMap.SLEDC : '';
				}
				catch(err){
					console.info('****** Error in olddata_validator :: prepareSLECommonData ****** :'+err.message);
				}
			}
			/***
			 * This is used for preparing 'publishingOption' data for SLE
			 * @param dataMap
			 * @author 552756(Nabonita Bhattacharyya)
			 */
			function preparePublishOptions(dataMap){
				try{
					var sleData = dataMap.SLEData;
					/** ----- For making all label standard ----- **/
					for(var labl in sleData){
						updateSLEPublishingOption(dataMap,labl,'S');
					}
					/** ----- For given ----- **/
					var givenArr = dataMap.SLEGV.split(',');
					if(givenArr != "" && givenArr.length > 0){
						var gvnArrLen = givenArr.length;
						for(var i=0;i<gvnArrLen;i++){
							var sleGId = 'SLE'+givenArr[i];
							updateSLEPublishingOption(dataMap,sleGId,'G');
						}
					}
					/**********************************************************/
					/** ----- For required ----- **/
					var reqArr = dataMap.SLERQ.split(',');
					if(reqArr != "" && reqArr.length > 0){
						var reqArrLen = reqArr.length;
						for(var j=0;j<reqArrLen;j++){
							var sleRId = 'SLE'+reqArr[j];
							updateSLEPublishingOption(dataMap,sleRId,'R');
						}
					}
					
					/**********************************************************/
					/** ----- For Distractor with dock ----- **/
					var disArr = dataMap.SLEDC.split(',');			

					if(disArr != "" && disArr.length > 0){
						dataMap.SLEPS.discrete = 'DC';
						var disArrLen = disArr.length;
						for(var k=0;k<disArrLen;k++){
							var sleDId = 'SLE'+disArr[k];
							updateSLEPublishingOption(dataMap,sleDId,'DC');
						}
					}
					
					var newSleDc = disArr;
					var dcArrLen = newSleDc.length;
					if(disArr == "")
						dcArrLen = 0;
					for(var i=0;i<dcArrLen;i++){
						if(disArr[i] == 'N')
							newSleDc[i] = i;
						else
							newSleDc[i] = 'N';
					}
					dataMap.SLEDC = newSleDc.join(',');
				}
				catch(err){
					console.info('****** Error in olddata_validator :: preparePublishOptions ****** :'+err.message);
				}
			}
			
			function updateSLEPublishingOption(dataMap,sleId,val){
				try{
					dataMap.SLEData[sleId].publishingOption = val;
				}
				catch(err){
					console.info('****** Error in olddata_validator :: updateSLEPublishingOption ****** :'+err.message);
				}
			}
			function getSLEDefaults() {
				var sledefaults = {
						'0'	: '',
						'1'	: '%n%',
						'2'	: '0',
						'3'	: '0',
						'4'	: '',
						'5'	: '100',
						'6'	: '100',
						'7'	: 'N',
						'8'	: 'R',
						'9'	: '20',
						'10': '0',
						'11': '40',
						'12': '0',
						'13': 'F|D|T|',
						'14': '',
						'15': '',
						'16': 'T',
						'17': 'F',
						'18': 'F',
						'19': 'F',
						'20': 'F',
						'21': 'N',
						'22': 'N',
						'23': 'N',
						'24': 'N',
						'25': '233',
						'26': '259',
						'27': '233',
						'28': '259',
						'29': 'N',
						'30': 'N',
						'31': 'F',
						'32': 'N',
						'33': '0',
						'34': '5',
						'35': '0',
						'36': '%n%',
						'37': 'N',
						'38': 'F',
						'39': 'true'
				};
				return sledefaults;
			}
			
			prepareSLERQ(dataMap);
			prepareSLEGV(dataMap);
			prepareSLERN(dataMap);
			
			/** For SLEPS arrangement **/
			var sleDataLength = Object.keys(dataMap.SLEData).length;
			var totalRandomLabels = 0;
			for(var p = 0; p < sleDataLength; p ++){
				var sle_id = 'SLE'+p;
				if(dataMap.SLEData[sle_id].distractor_label != 'T' && (dataMap.SLEData[sle_id].visibility == 'true' || dataMap.SLEData[sle_id].visibility == true)){
					totalRandomLabels++;
				}
			}
			
			SLEPS.totalRandomLabels = totalRandomLabels;
			
			function prepareSLERN(dataMap){
				var duplicateLabel = [];
				//var allLabels = $.map(dataMap.SLEData, function(n, i) { return i; }).length;
				var allLabels = dataMap.SLERN.split(',');//Fix for CTCD-230
				var noOfLabel = allLabels.length;
				var visiblelabel = [];
				if(dataMap.adminData.OTM == true && dataMap.adminData.OTO == false && dataMap.adminData.TYPE == false){
					for(var i=0;i<noOfLabel;i++){
						for(var j=i+1;j<noOfLabel;j++){
							if((dataMap.SLEData['SLE'+allLabels[i]].label_value === dataMap.SLEData['SLE'+allLabels[j]].label_value)&&(dataMap.SLEData['SLE'+allLabels[j]].visibility == true)){
								dataMap.SLEData['SLE'+allLabels[j]].visibility = false;
								duplicateLabel.push(''+allLabels[j]+'');
							}
						}
					}
				}
					
				visiblelabel = jQuery.grep(allLabels,function (item) {
				    return jQuery.inArray(item, duplicateLabel) < 0;
				});
				dataMap.SLERN = [];
				var visibleSLERN = visiblelabel;
				var visibleSLERQ = dataMap.SLERQ.split(',');
				var visibleSLEGV = dataMap.SLEGV.split(',');
				visiblelabel = jQuery.grep(visiblelabel,function (item) {
				    return jQuery.inArray(item, visibleSLERQ) < 0;
				});
				visiblelabel = jQuery.grep(visiblelabel,function (item) {
				    return jQuery.inArray(item, visibleSLEGV) < 0;
				});
				
				dataMap.SLERN = visiblelabel.toString();
			}
			function prepareSLERQ(dataMap){
				var duplicateLabel = [];
				var allRequirdLabels = dataMap.SLERQ.split(',');
				var noOfLabel = allRequirdLabels.length;
				var visiblelabel = [];
				if(dataMap.adminData.OTM == true && dataMap.adminData.OTO == false && dataMap.adminData.TYPE == false){
					for(var i=0;i<noOfLabel;i++){
						for(var j=i+1;j<noOfLabel;j++){
							if((dataMap.SLEData['SLE'+allRequirdLabels[i]].label_value === dataMap.SLEData['SLE'+allRequirdLabels[j]].label_value)&&(dataMap.SLEData['SLE'+allRequirdLabels[j]].visibility == true)){
								dataMap.SLEData['SLE'+allRequirdLabels[j]].visibility = false;
								duplicateLabel.push(''+allRequirdLabels[j]+'');
							}
						}
					}
				}
				
					
				visiblelabel = jQuery.grep(allRequirdLabels,function (item) {
				    return jQuery.inArray(item, duplicateLabel) < 0;
				});
				dataMap.SLERQ = [];
				dataMap.SLERQ = visiblelabel.toString();
			}
			function prepareSLEGV(dataMap){
				var duplicateLabel = [];
				var allGivenLabels = dataMap.SLEGV.split(',');
				var noOfLabel = allGivenLabels.length;
				var visiblelabel = [];
				if(dataMap.adminData.OTM == true && dataMap.adminData.OTO == false && dataMap.adminData.TYPE == false){
					for(var i=0;i<noOfLabel;i++){
						for(var j=i+1;j<noOfLabel;j++){
							if((dataMap.SLEData['SLE'+allGivenLabels[i]].label_value === dataMap.SLEData['SLE'+allGivenLabels[j]].label_value)&&(dataMap.SLEData['SLE'+allGivenLabels[j]].visibility == true)){
								dataMap.SLEData['SLE'+allGivenLabels[j]].visibility = false;
								duplicateLabel.push(''+allGivenLabels[j]+'');
							}
						}
					}
				}
				
					
				visiblelabel = jQuery.grep(allGivenLabels,function (item) {
				    return jQuery.inArray(item, duplicateLabel) < 0;
				});
				dataMap.SLEGV = [];
				dataMap.SLEGV = visiblelabel.toString();
			}
			
			return dataMap;
		},
		
		/**
		 * @description :: This method is used for SLE, it sets showZoomInAuth 'T'
		 * if any label from old flash has zoom window value as 'T'
		 * called from :: fixSLEData()
		 * @param : dataMap
		 * @author 552756(Nabonita Bhattacharyya)
		 */
		checkForZoomInAuthoring : function(dataMap){
			try{
				var sleData = dataMap.SLEData;
				var frameImageList = dataMap.FrameData[0].frameImageList;
				
				for(var eachLbl in sleData){
					var showZoomInAuth = sleData[eachLbl].connector_options.showInAuthoring;
					if(showZoomInAuth == 'T' && !$.isEmptyObject(frameImageList)){
						dataMap.adminData.showZoomInAuth = showZoomInAuth;
					}
				}
				/** If magnification is disabled for all labels/docks adminData.showZoomInAuth will be 'F' **/
				if(dataMap.adminData.showZoomInAuth == undefined){
					dataMap.adminData.showZoomInAuth = 'F';
				}
			}
			catch(error){
				console.info("****** Error in olddata_validator :: checkForZoomInAuthoring ******"+ error.message);
			}
		},
		/**
		 * This is used for preparing SLEData from old string
		 * called from fixSLEData()
		 * @param data(containing values for each label),dataMap
		 * @returns SLEData
		 * @author 552756(Nabonita Bhattacharyya)
		 */
		prepareSLEData : function(data,dataMap,labelId,tempTransparencyBorder,tempTransparency,docTempTransparency,tempSeqDockTransparency){
			try{
				var SLEData = {};
				
				SLEData.label_value = methods.prepareTextData(data[0]);
				
				var modifiedText = SLEData.label_value.replace((/__([a-z0-9A-Z\W\s]+)__/g), '__~~$1~~__');			
				var senArr = modifiedText.split(/__([a-z0-9A-Z\W\s]+)__/g);			
				
				for(var i=0;i<senArr.length;i++) {
					if(senArr[i].indexOf("~~") != -1) {
						var fibVal = senArr[i].replace(/__/g,'');
						fibVal = fibVal.replace(/~~/g,'');
					}
				}
				if(fibVal){
					SLEData.FIB_value = fibVal;
				}else{
					SLEData.FIB_value = 'N';
				}
				SLEData.hint_value = methods.prepareTextData(data[1]);
				SLEData.feedback_value = '';
				SLEData.holder_x = data[2];
				SLEData.holder_y = data[3];
				SLEData.labelGroupId = labelId;
			
				SLEData.image_data = data[4];
				if(SLEData.image_data != "N"){
					this.image_list.push(SLEData.image_data);
				}
				SLEData.doc_x = data[5];
				SLEData.doc_y = data[6];
				SLEData.image_data_1 = data[7];
				SLEData.connector_facing = data[8];
				SLEData.connector_mx = data[9];
				SLEData.connector_my = data[10];
				SLEData.connector_lx = data[11];
				SLEData.connector_ly = data[12];
				
				if(SLEData.connector_facing == 'B'){//for connector facing Bottom
					SLEData.connector_mx_authoring = parseInt(SLEData.connector_my);
					SLEData.connector_my_authoring = parseInt(SLEData.connector_mx)*(-1);
					SLEData.connector_lx_authoring = parseInt(SLEData.connector_ly);
					SLEData.connector_ly_authoring = parseInt(SLEData.connector_lx)*(-1);
				}
				if(SLEData.connector_facing == 'R'){//for connector facing Right
					SLEData.connector_mx_authoring = SLEData.connector_mx;
					SLEData.connector_my_authoring = SLEData.connector_my;
					SLEData.connector_lx_authoring = SLEData.connector_lx;
					SLEData.connector_ly_authoring = SLEData.connector_ly;
				}
				
				if(SLEData.connector_facing == 'T'){//for connector facing Top
					SLEData.connector_mx_authoring = parseInt(SLEData.connector_my)*(-1);
					SLEData.connector_my_authoring = parseInt(SLEData.connector_mx);
					SLEData.connector_lx_authoring = parseInt(SLEData.connector_ly)*(-1);
					SLEData.connector_ly_authoring = parseInt(SLEData.connector_lx);
				}
				if(SLEData.connector_facing == 'L'){//for connector facing Left
					SLEData.connector_mx_authoring = parseInt(SLEData.connector_mx)*(-1);
					SLEData.connector_my_authoring = parseInt(SLEData.connector_my)*(-1);
					SLEData.connector_lx_authoring = parseInt(SLEData.connector_lx)*(-1);
					SLEData.connector_ly_authoring = parseInt(SLEData.connector_ly)*(-1);
				}
				/** -------- For connector options ---------- **/
				var connector_options = {};
				var connectorOpt = data[13].split('|');
				connector_options.connectorPresent = connectorOpt[0];
				connector_options.connectorType = connectorOpt[1]!=''?connectorOpt[1]:'D';
				connector_options.showInAuthoring = connectorOpt[2]!=undefined?connectorOpt[2]:'T';
				connector_options.connectorTypeAuthoring = connector_options.connectorType;
				/* this is done for zoom window for old string defect #835 */
				connector_options.zoomingPresent = connectorOpt[2]!=undefined?connectorOpt[2]:'T';
				
				/*In authoring connectorType authoring need to be H for original B and vice-versa for top and bottom facing*/
				var cType = connector_options.connectorType.split('%d%');
				if(SLEData.connector_facing == 'T' || SLEData.connector_facing == 'B'){//for connector facing Top					
					if(cType[0] == 'H'){
						cType[0] = 'B';
					}else if(cType[0] == 'B'){
						cType[0] = 'H';
					}					
				} 
				if(cType[0] == 'H'){
					var topArm = cType[1];
					cType[1] = cType[2];
					cType[2] = topArm;
				}
				connector_options.connectorTypeAuthoring = cType.join('%d%');
				
				SLEData.connector_options = connector_options;
				
				var local_magnification = {};
				if(data[14]){					
					var local_magnification_data = data[14].split('|');					
				} else {
					var local_magnification_data = dataMap.adminData.ZHP.split(',');					
				}
				local_magnification.localMagnificationWidth = local_magnification_data[0];
				local_magnification.localMagnificationHeight = local_magnification_data[1];
				local_magnification.localMagnificationFactor = local_magnification_data[4];
				SLEData.local_magnification = local_magnification;
				
				/** ----- For old 2010 flash, labels are transparent ----- **/
				if(mode == 'design'){
					if(version == 2000){
						if (tempTransparency == undefined) {
							tempTransparency = "T";
						}
					}
					if(tempTransparency){
						SLEData.transparent = tempTransparency;
					}
					else
						SLEData.transparent = "F";
				}
				
				
				/** Not getting the param, hence commented **/
				
				if(data[16] == 'T'){
					SLEData.transparent_border = 'F';
				}else{
					if(data[16] == 'F'){
						SLEData.transparent_border = 'T';
					}
				}
				if(mode == 'design'){
					if(tempTransparencyBorder){
						SLEData.transparent_border = tempTransparencyBorder;
					}
					else
						SLEData.transparent_border = "F";
				}
				/** ----- For old online flash, labels are transparent ----- **/
				if(mode == 'design' && version == 2000){
					//SLEData.transparent = data[17];
					dataMap.adminData.CSO = 'pi_connectstylev2.swf';
				}else{
					if(mode !== 'design'){
						SLEData.transparent = data[17];
					}
				}
				
				SLEData.transparent_hint = data[18];
				SLEData.transparent_border_1 = data[19];
				SLEData.transparent_1 = data[20];
				
				SLEData.media_value = data[21];
				SLEData.media_dock_value = data[22];
				SLEData.media_label_XY = data[23];
				SLEData.media_dock_XY = data[24];
				SLEData.play_option_L0_X = data[25];
				SLEData.play_option_L0_Y = data[26];
				SLEData.play_option_D0_X = data[27];
				SLEData.play_option_D0_Y = data[28];
				SLEData.label_Audio_Value = data[29];
				SLEData.label_play_option_value = data[30];
				SLEData.distractor_label = data[31];
				
				
				SLEData.class_array_SLE = data[33];
				SLEData.edit_button_X = data[34];
				SLEData.edit_button_Y = data[35];
				SLEData.dock_hint_value = data[36]!= '%n%'?data[36] : data[1];
				SLEData.FIB_Dock = data[37];
				SLEData.dock_hint_value = methods.prepareTextData(SLEData.dock_hint_value);
				if(data[38] === 'F'){
					SLEData.doc_transparent_value = 'semitransparent';  //Default is semitransparent
					SLEData.transparent_1 = 'semitransparent';			////Default is semitransparent
				}else{
					if(data[38] === 'T'){
						SLEData.doc_transparent_value = 'transparent';
						SLEData.transparent_1 = 'transparent';
					}
				}
				if(mode == 'design'){
					if(docTempTransparency === 'F'){
						SLEData.doc_transparent_value = 'solid';
						SLEData.transparent_1 = 'solid';
					}else{
						if(docTempTransparency === 'T'){
							SLEData.doc_transparent_value = 'transparent';
							SLEData.transparent_1 = 'transparent';
						}
					}
				}
				if(version == '2000'){
					if(mode == 'design'){
						if(tempSeqDockTransparency === 'T'){
							SLEData.doc_transparent_value = 'transparent';
						}
						else if(tempSeqDockTransparency === 'F'){
							SLEData.doc_transparent_value = 'semitransparent';
						}
					}else{//for other modes of SEQ, docks will be transparent
						if(tempSeqDockTransparency === 'T'){
							SLEData.doc_transparent_value = 'transparent';
							SLEData.transparent_1 = 'transparent';//for test mode, dock transparency is read fromtransparent_1 
						}
						else if(tempSeqDockTransparency === 'F'){
							if(data[20] === 'T'){
								SLEData.doc_transparent_value = 'transparent';
								SLEData.transparent_1 = 'transparent';
							}
							else if(data[20] === 'F'){
								SLEData.doc_transparent_value = 'semitransparent';
								SLEData.transparent_1 = 'semitransparent';
							}
						}
					}
				}
				if(version == '2010'){
					if(mode == 'design'){
						if(tempSeqDockTransparency === 'T'){
							SLEData.doc_transparent_value = 'transparent';
						}
						else if(tempSeqDockTransparency === 'F'){
							SLEData.doc_transparent_value = 'solid';
						}
						/** For SEQ (version 2010), dock solid is similar to semitransparent (defect id : 4486)**/
						if(dataMap.adminData.ET == 'SEQ'){
							SLEData.doc_transparent_value = 'semitransparent';
							SLEData.transparent_1 = 'semitransparent';
						}
					}else{//for other modes 
						if(data[20] === 'T'){
							SLEData.doc_transparent_value = 'transparent';
							SLEData.transparent_1 = 'transparent';
						}
						else if(data[20] === 'F'){
							SLEData.doc_transparent_value = 'semitransparent';//#4517
							SLEData.transparent_1 = 'semitransparent'; //set to semitransparent for SLE/SEQ as default for dock background by SS
						}
					}
				}
				
				if(version == 2011){
					if(mode == 'design'){
						if(tempSeqDockTransparency === 'T'){
							SLEData.doc_transparent_value = 'transparent';
							SLEData.transparent_border_1 = 'T';
						}
						else if(tempSeqDockTransparency === 'F'){
							SLEData.doc_transparent_value = 'solid';
						}
						/** For SEQ (version 2010), dock solid is similar to semitransparent (defect id : 4486)**/
						if(dataMap.adminData.ET == 'SEQ'){
							SLEData.doc_transparent_value = 'semitransparent';
							SLEData.transparent_1 = 'semitransparent';
						}
						
						/** For spanish and music transparent docks has no border **/
						
						if(SLEData.doc_transparent_value == 'transparent'){
							SLEData.transparent_border_1 = 'T';
						}
					}else{//for other modes 
						if(data[20] === 'T'){
							SLEData.doc_transparent_value = 'transparent';
							SLEData.transparent_1 = 'transparent';
							SLEData.transparent_border_1 = 'T';
						}
						/** Changed to semitransparent as solid docks of spanish and music are like semitransparent for new auth **/
						else if(data[20] === 'F'){
							SLEData.doc_transparent_value = 'semitransparent';
							SLEData.transparent_1 = 'semitransparent'; 
						}
					}
				}
				
				
				/** ---- For old BECB docks are only semitransparent ---- **/
//				if(dataMap.adminData.CSO != 'none' && version == 2000){
//					SLEData.doc_transparent_value = 'solid';
//					SLEData.transparent_1 = 'solid';
//				} 
				SLEData.visibility = true;
				
				if(data[39] == 'true'){
					SLEData.infoHideText = "F"; 
				}else{
					if(data[39] == 'false'){
						SLEData.infoHideText = "T"; 
					}
				}
				
				if(data[40] && data[40]!==''){
					//for version 2000 data[40] comes as ''
				}else{//For old string default text formatting is applied
					SLEData.textFormat = {};
					SLEData.textFormat.fontSize = dataMap.adminData.GFS;
					SLEData.textFormat.underline_value = 'F';
					SLEData.textFormat.fontStyle = 'normal';
					var align=undefined;
					if(data[0].match(/<p align="(left|right|center)">([\W\w\r\n]*)<\/p>([\W\w\r\n]*)/g) != null){
						align = data[0].replace(/<p align="(left|right|center)">([\W\w\r\n]*)<\/p>([\W\w\r\n]*)/g,'$1');
					}
										
					SLEData.textFormat.align = align ? align : 'center';
				}
				/** --- for hint feedback option --- **/
				if(SLEData.hint_value && SLEData.hint_value !== '%n%'){
					dataMap.adminData.showHintOrFeedbackInAuthoring = 'hint';
				}
				
				SLEData.lockStatus = false;
				SLEData.dockLockStatus = false;  
				SLEData.labelGroupId = labelId; 
				
				SLEData.underline_value = "F";

				return SLEData;
			}catch(error){
				console.info("****** Error in olddata_validator :: prepareSLEData ******"+ error.message);
			}
		},
		
		prepareSEQData : function(data,dataMap,labelId){
			try{
				var SLEData = {};
				
				SLEData.label_value = methods.prepareTextData(data[0]);
				
				var modifiedText = SLEData.label_value.replace((/__([a-z0-9A-Z\W\s]+)__/g), '__~~$1~~__');			
				var senArr = modifiedText.split(/__([a-z0-9A-Z\W\s]+)__/g);			
				
				for(var i=0;i<senArr.length;i++) {
					if(senArr[i].indexOf("~~") != -1) {
						var fibVal = senArr[i].replace(/__/g,'');
						fibVal = fibVal.replace(/~~/g,'');
					}
				}
				if(fibVal){
					SLEData.FIB_value = fibVal;
				}else{
					SLEData.FIB_value = 'N';
				}
				SLEData.hint_value = methods.prepareTextData(data[1]);
				SLEData.feedback_value = '';
				SLEData.holder_x = data[2];
				SLEData.holder_y = data[3];
				SLEData.labelGroupId = labelId;
			
				SLEData.image_data = data[4];
				if(SLEData.image_data != "N"){
					this.image_list.push(SLEData.image_data);
				}
				SLEData.doc_x = data[5];
				SLEData.doc_y = data[6];
				SLEData.image_data_1 = data[7];
				SLEData.connector_facing = 'R';
				SLEData.connector_mx = 20;
				SLEData.connector_my = 0;
				SLEData.connector_lx = 40;
				SLEData.connector_ly = 0;

				SLEData.connector_mx_authoring = 20;
				SLEData.connector_my_authoring = 0;
				SLEData.connector_lx_authoring = 40;
				SLEData.connector_ly_authoring = 0;
				
				/** -------- SEQ does not has connector. For converting SEQ data to SLE data hardcoded default connector value entered ---------- **/
				var ctrStaticStr = 'F|D|T|';
				var connector_options = {};
				var connectorOpt = ctrStaticStr.split('|');
				connector_options.connectorPresent = 'F';
				connector_options.connectorType = connectorOpt[1]!=undefined?connectorOpt[1]:'';
				connector_options.showInAuthoring = connectorOpt[2]!=undefined?connectorOpt[2]:'';
				connector_options.connectorTypeAuthoring = connector_options.connectorType;
				SLEData.connector_options = connector_options;
				
				/** Not getting the param, hence commented **/
				
				if(data[11] == 'T'){
					SLEData.transparent_border = 'F';
				}else{
					if(data[11] == 'F'){
						SLEData.transparent_border = 'T';
					}
				}
				
				SLEData.transparent = data[12];
				SLEData.transparent_hint = data[13];
				SLEData.transparent_border_1 = data[14];
				SLEData.transparent_1 = data[15];
				
				SLEData.media_value = data[16];
				SLEData.media_dock_value = data[17];
				SLEData.media_label_XY = data[18];
				SLEData.media_dock_XY = data[19];
				SLEData.play_option_L0_X = data[20];
				SLEData.play_option_L0_Y = data[21];
				SLEData.play_option_D0_X = data[22];
				SLEData.play_option_D0_Y = data[23];
				SLEData.label_Audio_Value = data[24];
				SLEData.label_play_option_value = data[25];
				SLEData.distractor_label = data[26];
				
				
				SLEData.class_array_SLE = data[28];
				SLEData.edit_button_X = data[29];
				SLEData.edit_button_Y = data[30];
				SLEData.dock_hint_value = methods.prepareTextData(data[31]);
				SLEData.FIB_Dock = data[32];
				
				if(data[15] === 'F'){
					SLEData.doc_transparent_value = 'semitransparent';	//Default is semitransparent
				}else{
					if(data[15] === 'T'){
						SLEData.doc_transparent_value = 'transparent';
					}
				}
				if(version == 2000){
					SLEData.doc_transparent_value = 'semitransparent';
				}
				SLEData.visibility = true;
				if(data[40] && data[40]!==''){
					
				}else{
					SLEData.textFormat = '';
				}
				/** --- for hint feedback option --- **/
				if(SLEData.hint_value && SLEData.hint_value !== '%n%'){
					dataMap.adminData.showHintOrFeedbackInAuthoring = 'hint';
				}
				return SLEData;
			}catch(error){
				console.info("****** Error in olddata_validator :: prepareSLEData ******"+ error.message);
			}
		},
		
		
		preparePRGDockData : function(data,dataMap,dockId){
			try{
				var PRGdockdata = {};
				var txtFormat ={
						'underline_value':'F',
						'fontSize':dataMap.adminData.GFS,
						'fontStyle':'normal',
						'align':'center'
				};
				var align=undefined;
				if(data[0].match(/<p align="(left|right|center)">([\W\w\r\n]*)<\/p>([\W\w\r\n]*)/g) != null){
					align = data[0].replace(/<p align="(left|right|center)">([\W\w\r\n]*)<\/p>([\W\w\r\n]*)/g,'$1');
				}
				txtFormat.align = align ? align : 'left';
				
				PRGdockdata.sentence = data[0];			
				PRGdockdata.feedback = data[1];
				PRGdockdata.PRG_sentence_list_x = data[2];
				PRGdockdata.PRG_sentence_list_y = data[3];
				PRGdockdata.dockGroupId = dockId;
			
				PRGdockdata.current_SLED_item_transparency = data[4];
				PRGdockdata.media_PRG_value = data[5];
				PRGdockdata.coor_PRG_value = data[6];
				PRGdockdata.media_label_x = data[7];
				PRGdockdata.media_label_y = data[8];
				PRGdockdata.caption = data[9];
				PRGdockdata.sentence_feedback = data[10];
				PRGdockdata.custom_hint = data[11];
				PRGdockdata.sentence_hint = data[12];
				PRGdockdata.infoHideText = "F";
				PRGdockdata.infoHintText = "T";
				PRGdockdata.infoFText = "T";
				PRGdockdata.lockStatus = false;
				PRGdockdata.textFormat = txtFormat;
				/** --- for hint feedback option --- **/
				if(PRGdockdata.sentence_hint && (PRGdockdata.sentence_hint !== '%n%' || PRGdockdata.sentence_hint !== '')){
					dataMap.adminData.showHintOrFeedbackInAuthoring = 'hint';
				}
				return PRGdockdata;
			}catch(error){
				console.info("****** Error in olddata_validator :: preparePRGDockData ******"+ error.message);
			}
		},
		preparePRGLabelData : function(data,dataMap,labelId){
			try{
				var PRGlabeldata = {};
				var txtFormat ={
					'underline_value':'F',
					'fontSize':dataMap.adminData.GFS,
					'fontStyle':'normal',
					'align':'center'
				};
				PRGlabeldata.term = data[0];			
				PRGlabeldata.term_pos_x = data[1];
				PRGlabeldata.term_pos_y = data[2];
				if(data[3] == "T")
					PRGlabeldata.current_item_transparency_border = "F";
				else
					PRGlabeldata.current_item_transparency_border = "T";
				PRGlabeldata.current_item_transparency = data[4];
				PRGlabeldata.labelGroupId = labelId;			
				PRGlabeldata.media_PRGT_value = data[5];
				PRGlabeldata.coor_PRGT_value = data[6];				
				PRGlabeldata.media_dock_x = data[7];
				PRGlabeldata.media_dock_y = data[8];	
				PRGlabeldata.lock_status = false;	
				PRGlabeldata.distractor_label = "F";	
				PRGlabeldata.name = 'dock_'+labelId;	
				PRGlabeldata.textFormat = txtFormat;
				return PRGlabeldata;
			}catch(error){
				console.info("****** Error in olddata_validator :: preparePRGLabelData ******"+ error.message);
			}
		},
		fixSleOTM :function(dataMap){
			var sleData = dataMap.SLEData;
			for(var key in sleData){
				if(dataMap.SLEData[key].holder_x != 3000){
					var labelValue = dataMap.SLEData[key].label_value;
					dataMap.SLEData[key].name = 'label_'+ key.split('SLE')[1];
					for(var skey in sleData){	
						var chkLabelValue = dataMap.SLEData[skey].label_value;
						if((key != skey) && (labelValue == chkLabelValue) && (dataMap.SLEData[skey].holder_x == 3000)){
							dataMap.SLEData[skey].name = 'label_'+ key.split('SLE')[1];
						}
					}
				}
			}
		},

		fixSEQData : function(tempDataMap,dataMap) {
			var sleData = new Array();
			var sleCount = 0;
			var slern = '';
			var counter = 0;
			dataMap.SLEData = {};
			var tempTransparency;
			var tempTransparencyBorder;
			var tempSeqDockTransparency = "F";
			var docTempTransparency;
			
			if(mode == 'design'){
				for(key in tempDataMap) {				
					if(key.match(/SLE[0-9]+/)){
						var seqData1 = {};
						seqTmpData = tempDataMap[key].split(",");
						if(seqTmpData[15])
							var seqDockTrans = seqTmpData[15];
						$.extend(seqData1, seqTmpData);
						if(seqData1["11"]=="F"){
							tempTransparencyBorder = "T";
						}
						if(seqData1["12"]=="T"){
							tempTransparency = "T";
						}
						if(seqData1["15"]=="T"){
							tempSeqDockTransparency = "T";
						}
					}
				}	
			}else{
				for(key in tempDataMap) {				
					if(key.match(/SLE[0-9]+/)){
						var seqData1 = {};
						seqTmpData = tempDataMap[key].split(",");
						if(seqTmpData[15])
							var seqDockTrans = seqTmpData[15];
					}
				}
			}
			
			/** --- for SEQ docks are by default transparent --- **/
			if(version == 2000 && !seqDockTrans){
				tempSeqDockTransparency = "T";
			}
			for(key in tempDataMap) {				
				if(key.match(/SLE[0-9]+/)){
					slern += sleCount + ',';
					sleCount++;
					var sleData = {};
					seqData = tempDataMap[key].split(",");
					var tmpDefaults = getSLEDefaults();
					
					for(var i=0;i<8;i++){
						tmpDefaults[i] = seqData[i];
					}
					
					i = 9;
					
					for(var j=14;j<39;j++){//This is changed to 39 as for SEQ seqData[39]('visibility') was coming false
						if(seqData[i]){
							tmpDefaults[j] = seqData[i];							
						}
						i++;
					}

					//$.extend(tmpDefaults, sleData);
					var labelId = 'label_'+key.substr(3);
					//var sleData = this.prepareSEQData(tmpDefaults,dataMap,labelId);//dataMap is passed 'showHintOrFeedbackInAuthoring' in adminData
					var sleData = this.prepareSLEData(tmpDefaults,dataMap,labelId,tempTransparencyBorder,tempTransparency,docTempTransparency,tempSeqDockTransparency);//dataMap is passed 'showHintOrFeedbackInAuthoring' in adminData
					sleData.feedback_value = methods.prepareTextData(seqData[8]);
					dataMap.SLEData[key] = sleData;
					delete dataMap[key];
				}
			}
			dataMap.adminData.showZoomInAuth = 'F';
			this.fixSleOTM(dataMap);
			
			slern = slern.substr(0, (slern.length-1));
			
			var slecommon = {					
					'SLEGV'	: '',
					'SLELD'	: '120,70',
					'DCKLD' : '120,70',					
					'SLERN' : slern,
					'SLERQ'	: '',
					'SLEDC' : ''
			};
			
			$.extend(slecommon, tempDataMap);

			/** ---------- For SLEPS start -------------- **/
			var SLEPS = {
				'totalRandomLabels': sleCount, 
				'totalRandomDistractors': sleCount, 
				'showFeedbackAfter': 'N',
				'showInstantFeedbackAfter': 'N',
				'showHintsAfter': 0,
				'studentGradeFormat': 'P',	
				'discrete':'F'
			};
			
			var slepsArr = tempDataMap.SLEPS.split(',');
			
			SLEPS.totalRandomLabels = slepsArr[0];
			SLEPS.showFeedbackAfter = slepsArr[1];
			SLEPS.showInstantFeedbackAfter = slepsArr[2];
			SLEPS.showHintsAfter = slepsArr[3];
			SLEPS.studentGradeFormat = slepsArr[4];
			
			dataMap.SLEPS = SLEPS;
			
			/** ---------- For SLEPS end -------------- **/
			
			/** ---------- For SLEGP start -------------- **/
			if(tempDataMap.SLEGP){
				var slegpArr = tempDataMap.SLEGP.split(',');
				
				dataMap.SLEGP = {};
				dataMap.SLEGP.borderGlobal = slegpArr[0];
				dataMap.SLEGP.backGroundGlobal = slegpArr[1];
				dataMap.SLEGP.labelBorderGlobal = slegpArr[2];
				dataMap.SLEGP.labelBGGlobal = slegpArr[3];
				dataMap.SLEGP.dockBGGlobal = slegpArr[4];
			} else {
				dataMap.SLEGP = {};
				dataMap.SLEGP.borderGlobal = 'T';
				dataMap.SLEGP.backGroundGlobal = 'T';
				dataMap.SLEGP.labelBorderGlobal = 'N';
				dataMap.SLEGP.labelBGGlobal = 'N';
				dataMap.SLEGP.dockBGGlobal = 'N';
			}
			/** ---------- For SLEGP end -------------- **/
			
			/** ---------- For other common data start -------------- **/
			var sleCommonData = prepareSLECommonData(tempDataMap,dataMap);
			preparePublishOptions(dataMap);
			dataMap.adminData.DOCSAMEASLABEL = false;//For SLE dock is always same size as label
			dataMap.adminData.ET = 'SLE';
			function prepareSLECommonData(tempDataMap,dataMap){
				try{
					dataMap.SLEGV = tempDataMap.SLEGV;
					dataMap.SLELD = tempDataMap.SLELD;
					dataMap.DCKLD = tempDataMap.SLELD;//As for SLE dock and label are of same sizes
					dataMap.SLERN = tempDataMap.SLERN;
					dataMap.SLERQ = tempDataMap.SLERQ;
					dataMap.DCKLD = tempDataMap.DCKLD;
					dataMap.SLEDC = tempDataMap.SLEDC != undefined ? tempDataMap.SLEDC : '';
				}
				catch(err){
					console.info('****** Error in olddata_validator :: prepareSLECommonData ****** :'+err.message);
				}
			}
			var hideFillBorderCheck = false;
			if(version ==2010 || version ==2011){
				for(var key in dataMap.SLEData){
					if(dataMap.SLEData[key].transparent == 'T'){
						hideFillBorderCheck = true;
					}
				}
			}
			if(hideFillBorderCheck == true){
				dataMap.SLEGP.backGroundGlobal = 'F';
				dataMap.SLEGP.borderGlobal = 'F';
			}
			prepareSLERN(dataMap);
			prepareSLERQ(dataMap);
			prepareSLEGV(dataMap);
			
			
			function prepareSLERN(dataMap){
				var duplicateLabel = [];
				var allLabels = dataMap.SLERN.split(',');
				var noOfLabel = allLabels.length;
				var visiblelabel = [];
				if(dataMap.adminData.OTM == true && dataMap.adminData.OTO == false && dataMap.adminData.TYPE == false){
					for(var i=0;i<noOfLabel;i++){
						for(var j=i+1;j<noOfLabel;j++){
							if((dataMap.SLEData['SLE'+allLabels[i]].label_value === dataMap.SLEData['SLE'+allLabels[j]].label_value)&&(dataMap.SLEData['SLE'+allLabels[j]].visibility == true)){
								dataMap.SLEData['SLE'+allLabels[j]].visibility = false;
								duplicateLabel.push(''+allLabels[j]+'');
							}
						}
					}
				}
					
				visiblelabel = jQuery.grep(allLabels,function (item) {
				    return jQuery.inArray(item, duplicateLabel) < 0;
				});
				dataMap.SLERN = [];
				var visibleSLERN = visiblelabel;
				var visibleSLERQ = dataMap.SLERQ.split(',');
				var visibleSLEGV = dataMap.SLEGV.split(',');
				visiblelabel = jQuery.grep(visiblelabel,function (item) {
				    return jQuery.inArray(item, visibleSLERQ) < 0;
				});
				visiblelabel = jQuery.grep(visiblelabel,function (item) {
				    return jQuery.inArray(item, visibleSLEGV) < 0;
				});
				
				dataMap.SLERN = visiblelabel.toString();
			}
			function prepareSLERQ(dataMap){
				var duplicateLabel = [];
				var allRequirdLabels = dataMap.SLERQ.split(',');
				var noOfLabel = allRequirdLabels.length;
				var visiblelabel = [];
				if(dataMap.adminData.OTM == true && dataMap.adminData.OTO == false && dataMap.adminData.TYPE == false){
					for(var i=0;i<noOfLabel;i++){
						for(var j=i+1;j<noOfLabel;j++){
							if((dataMap.SLEData['SLE'+allRequirdLabels[i]].label_value === dataMap.SLEData['SLE'+allRequirdLabels[j]].label_value)&&(dataMap.SLEData['SLE'+allRequirdLabels[j]].visibility == true)){
								dataMap.SLEData['SLE'+allRequirdLabels[j]].visibility = false;
								duplicateLabel.push(''+allRequirdLabels[j]+'');
							}
						}
					}
				}
				
					
				visiblelabel = jQuery.grep(allRequirdLabels,function (item) {
				    return jQuery.inArray(item, duplicateLabel) < 0;
				});
				dataMap.SLERQ = [];
				dataMap.SLERQ = visiblelabel.toString();
			}
			function prepareSLEGV(dataMap){
				var duplicateLabel = [];
				var allGivenLabels = dataMap.SLEGV.split(',');
				var noOfLabel = allGivenLabels.length;
				var visiblelabel = [];
				if(dataMap.adminData.OTM == true && dataMap.adminData.OTO == false && dataMap.adminData.TYPE == false){
					for(var i=0;i<noOfLabel;i++){
						for(var j=i+1;j<noOfLabel;j++){
							if((dataMap.SLEData['SLE'+allGivenLabels[i]].label_value === dataMap.SLEData['SLE'+allGivenLabels[j]].label_value)&&(dataMap.SLEData['SLE'+allGivenLabels[j]].visibility == true)){
								dataMap.SLEData['SLE'+allGivenLabels[j]].visibility = false;
								duplicateLabel.push(''+allGivenLabels[j]+'');
							}
						}
					}
				}
				
					
				visiblelabel = jQuery.grep(allGivenLabels,function (item) {
				    return jQuery.inArray(item, duplicateLabel) < 0;
				});
				dataMap.SLEGV = [];
				dataMap.SLEGV = visiblelabel.toString();
			}
			
			function preparePublishOptions(dataMap){
				try{
					var sleData = dataMap.SLEData;
					/** ----- For making all label standard ----- **/
					for(var labl in sleData){
						updateSLEPublishingOption(dataMap,labl,'S');
					}
					/** ----- For given ----- **/
					var givenArr = dataMap.SLEGV.split(',');
					if(givenArr != "" && givenArr.length > 0){
						var gvnArrLen = givenArr.length;
						for(var i=0;i<gvnArrLen;i++){
							var sleGId = 'SLE'+givenArr[i];
							updateSLEPublishingOption(dataMap,sleGId,'G');
						}
					}
					/**********************************************************/
					/** ----- For required ----- **/
					var reqArr = dataMap.SLERQ.split(',');
					if(reqArr != "" && reqArr.length > 0){
						var reqArrLen = reqArr.length;
						for(var j=0;j<reqArrLen;j++){
							var sleRId = 'SLE'+reqArr[j];
							updateSLEPublishingOption(dataMap,sleRId,'R');
						}
					}
					
					/**********************************************************/
					/** ----- For Distractor with dock ----- **/
					var disArr = dataMap.SLEDC.split(',');			

					if(disArr != "" && disArr.length > 0){
						dataMap.SLEPS.discrete = 'DC';
						var disArrLen = disArr.length;
						for(var k=0;k<disArrLen;k++){
							var sleDId = 'SLE'+disArr[k];
							updateSLEPublishingOption(dataMap,sleDId,'DC');
						}
					}
					
					var newSleDc = disArr;
					var dcArrLen = newSleDc.length;
					if(disArr == "")
						dcArrLen = 0;
					for(var i=0;i<dcArrLen;i++){
						if(disArr[i] == 'N')
							newSleDc[i] = i;
						else
							newSleDc[i] = 'N';
					}
					dataMap.SLEDC = newSleDc.join(',');
				}
				catch(err){
					console.info('****** Error in olddata_validator :: preparePublishOptions ****** :'+err.message);
				}
			}
			
			function updateSLEPublishingOption(dataMap,sleId,val){
				try{
					dataMap.SLEData[sleId].publishingOption = val;
				}
				catch(err){
					console.info('****** Error in olddata_validator :: updateSLEPublishingOption ****** :'+err.message);
				}
			}
			
			function getSLEDefaults() {
				var sledefaults = {
						'0'	: '',
						'1'	: '%n%',
						'2'	: '0',
						'3'	: '0',
						'4'	: '',
						'5'	: '100',
						'6'	: '100',
						'7'	: 'N',
						'8'	: 'R',
						'9'	: '20',
						'10': '0',
						'11': '40',
						'12': '0',
						'13': 'F|D|T|',
						'14': '',
						'15': '',
						'16': 'T',
						'17': 'F',
						'18': 'F',
						'19': 'F',
						'20': 'F',
						'21': 'N',
						'22': 'N',
						'23': 'N',
						'24': 'N',
						'25': '233',
						'26': '259',
						'27': '233',
						'28': '259',
						'29': 'N',
						'30': 'N',
						'31': 'F',
						'32': 'N',
						'33': '0',
						'34': '5',
						'35': '0',
						'36': '%n%',
						'37': 'N',
						'38': 'F',
						'39': 'true'
				}
				return sledefaults;
			}
			return dataMap;
		},
		
				
		fixCLSData : function(clsDataMap,dataMap) {
			var clsData = new Array();
			var clsTmpData = new Array();
			var clsCount = 0;
			var clscCount = 0;
			var clsrn = '';
			var counter = 0;
			var clsLabelData = {};
			var clsDockData = {};
			var clsgv = "";
			var clsrq = "";
			var clsrn = "";
			var clsps = "";
			var clsgp = "";
			var clspos = "";
			var vst = "";
			var clsds = "";
			var clssd = "";
			var tempTransparency = "F";
			var tempTransparencyBorder = "F";
			var tempDockTransparency = 'semitransparent';
			for(key in clsDataMap) {				
				if(key.match(/CLS[0-9]+/)){
					var clsData1 = {};
					clsTmpData = clsDataMap[key].split(",");
					$.extend(clsData1, clsTmpData);
					if(clsData1["6"]=="T"){
						tempTransparency = "T";
					}
					if(clsData1["8"]=="F"){
						tempTransparencyBorder = "T";
					}
				}
				if(key.match(/CLSGP/)){//Fix for CTCD-205
					var clsgp = clsDataMap[key].split(",");
					if (clsgp[3] == "T"){
						var clsgpTempTransparencyBorder = "F";
					}	
				}}
			var globalFontSize = dataMap.adminData.GFS;
			for(key in clsDataMap) {				
				if(key.match(/CLS[0-9]+/)){
					clsrn += clsCount + ',';
					clsCount++;
					var clsData = {};
					clsTmpData = clsDataMap[key].split(",");
					
					var clsData = getCLSDefaults();
					$.extend(clsData, clsTmpData);
					
					
					var tmpDefaults = {
							'label_value':methods.prepareTextData(clsData[0]),
							'class_name':clsData[1],
							'image_data':clsData[2],
							'holder_x':parseInt(clsData[3]),
							'holder_y':parseInt(clsData[4]),
							'hint_value':methods.prepareTextData(clsData[5]),
							'feedback_value':"",
							'transparent':clsData[6],
							'transparent_hint':clsData[7],
							'transparent_border':clsData[8]=='T'?'F':'T',
							'media_value':clsData[9],
							'play_option_value':clsData[10],
							'media_X':parseInt(clsData[11]),
							'media_Y':parseInt(clsData[12]),
							'distractor':clsData[13],
							'student_answer_string':clsData[14],
							'class_set':clsData[15],
							'edit_button_X':parseInt(clsData[16]),
							'edit_button_Y':parseInt(clsData[17]),
							'custom_hint':clsData[18],
							'visibility':true,
							'lockStatus':false,
							'textFormat':{
								'underline_value':'F',
								'fontSize':globalFontSize,
								'fontStyle':'normal',
								'align':'center'
							},
							"labelGroupId": "label_" + parseInt(key.replace( /^\D+/g, '')), 
				            "infoHideText": "F", 
				            "underline_value": "F", 
				            "infoHintText": "T"
					};
					
					if(clsData[19] == "false"){
						tmpDefaults.infoHideText = "T"
					}else{
						if(clsData[19] == "true"){
							tmpDefaults.infoHideText = "F"
						}
					}
					if(mode == 'design' && (version == 2010 || version == 2011)){
						
						tmpDefaults.transparent = tempTransparency ;
						tmpDefaults.transparent_border = tempTransparencyBorder;
					}
					if(version == 2000 && status == false){
						tmpDefaults.class_set = tmpDefaults.class_name;
					}
					if(mode == 'design' && version == 2000){
						//tmpDefaults.transparent = 'F';
						if (clsgpTempTransparencyBorder != undefined){//Fix for CTCD-205
							tmpDefaults.transparent_border = clsgpTempTransparencyBorder;
						}
						dataMap.adminData.CSO = 'pi_connectstylev2.swf';
					}
					
					if(clsData[2] != "N"){
						this.image_list.push(clsData[2]);
					}
					clsLabelData[key] = tmpDefaults;
				} else if(key.match(/CLSC[0-9]+/)){
					clscCount++;
					var clscData = new Array();
					
					clscTmpData = clsDataMap[key].split("%d%");
					var tmpcDefaults = getCLSCDefaults();
					$.extend(tmpcDefaults, clscTmpData);
										
					var dockGroupNo = parseInt(key.replace( /^\D+/g, ''))+1;
					
					var tmpCLSCDefaults = {
							'name':tmpcDefaults[0],
							'xpos':parseInt(tmpcDefaults[1]),
							'ypos': parseInt(tmpcDefaults[2]),
							'width': parseInt(tmpcDefaults[3]),
							'height':parseInt(tmpcDefaults[4]),
							'transparent':tmpcDefaults[5]=='F'?"semitransparent":"transparent",
							'transparent_border':'F',
							'media_value':tmpcDefaults[6],
							'play_option_value':tmpcDefaults[7],
							'media_X': tmpcDefaults[8],
							'media_Y': tmpcDefaults[9],
							'dockGroupId' : 'dock_' + parseInt(key.replace( /^\D+/g, '')),
							'dockGroupNo': dockGroupNo,
							'lockStatus':false,
							'dockHeadingId': ''
						};

					clsDockData[key] = tmpCLSCDefaults;
					/** --- Updated for BECB conversion --- **/
//					if(dataMap.adminData.CSO != 'none' && version == 2000){
//						clsDockData[key].transparent = 'semitransparent';
//					}
				} else if(key.match(/CLSGV/)){
					clsgv = clsDataMap[key];
				} else if(key.match(/CLSRQ/)){
					clsrq = clsDataMap[key];
				} else if(key.match(/CLSRN/)){
					clsrn = clsDataMap[key];
				} else if(key.match(/CLSPS/)){
					clsps = clsDataMap[key].split(",");
					
					var clsPsData = {
							'totalRandomLabels': clsps[0], //Replace with CLS count
							'totalRandomDistractors': '', 
							'disableFeedback': clsps[1],
							'disableInstantFeedback': clsps[2],
							'disableHints': clsps[3],
							'studentGradeFormat': clsps[4]
						};
					
				} else if(key.match(/CLSGP/)){
					clsgp = clsDataMap[key].split(",");
					
					var clsgpData = {
							'borderGlobal': clsgp[0],
							'backGroundGlobal': clsgp[1],
							'toggleSPGlobal': clsgp[2],
							'labelBorderGlobal': clsgp[3],
							'labelBGGlobal': clsgp[4],
							'dockBGGlobal': clsgp[5]
						};
					
				} else if(key.match(/CLSPOS/)){
					clspos = clsDataMap[key];
				} else if(key.match(/VST/)){
					vst = clsDataMap[key];
				} else if(key.match(/CLSDS/)){
					clsds = clsDataMap[key];
				} else if(key.match(/CLSSD/)){
					clssd = clsDataMap[key];
				}
			}
			if(mode == 'design'){
				for(key in clsDockData) {				
					if(clsDockData[key].transparent == 'transparent'){
						tempDockTransparency = 'transparent';	
					}
				}	
			}
			if(mode == 'design'){
				for(key in clsDockData) {
					clsDockData[key].transparent = tempDockTransparency; 
				}
			}
			
			if(!clsgpData){
				var clsgpData = {
						'borderGlobal': 'T',
						'backGroundGlobal': 'T',
						'toggleSPGlobal': 'F',
						'labelBorderGlobal': 'N',
						'labelBGGlobal': 'N',
						'dockBGGlobal': 'N'
					};
			}

			dataMap.CLSData = clsLabelData;
			dataMap.CLSCData = clsDockData;
			dataMap.CLSGV = clsgv;
			dataMap.CLSRQ = clsrq;
			dataMap.CLSRN = clsrn;
			dataMap.CLSPS = clsPsData;
			dataMap.CLSGP = clsgpData;
			dataMap.CLSPOS = clspos;
			dataMap.adminData.VST = vst;
			dataMap.CLSDS = clsds;
			dataMap.CLSSD = clssd;
			
			return dataMap;
			
			
			
			
			
			
			
			
			
			function getCLSDefaults() {
				var clsdefaults = {
						'0'	: '',
						'1'	: '',
						'2'	: 'N',
						'3'	: '20',
						'4'	: '50',
						'5'	: '',
						'6'	: 'F',
						'7'	: 'F',
						'8'	: 'T',						
						'9'	: 'N',
						'10': 'N',
						'11': '233',
						'12': '259',
						'13': 'F',
						'14': 'N',
						'15': '',
						'16': '5',
						'17': '0',
						'18': 'N',
						'19': 'true'						
				}
				return clsdefaults;
			}
			
			function getCLSCDefaults() {
				var clscdefaults = {
						'0'	: '',
						'1'	: '40',
						'2'	: '50',
						'3'	: '128',
						'4'	: '198',
						'5'	: version == 2010 ?'T':'F',
						'6'	: 'N',
						'7'	: '0|0',
						'8'	: '233',						
						'9'	: '259'					
				}
				return clscdefaults;
			}
			
		},
		
		fixCOIData : function(coiDataMap,dataMap) {
			var coiData = new Array();
			var coiLabelData = {};
			var coiCount = 0;
			var coirn = '';
			var counter = 0;
			var coirn = "";
			var coist = "";
			var vst = "";
			var tempTransparency="F";
			var tempTransparencyBorder="T";
			for(key in coiDataMap) {				
				if(key.match(/COI[0-9]+/)){
					var coiData1 = {};
					coiTmpData = coiDataMap[key].split(",");
					$.extend(coiData1, coiTmpData);
					if(coiData1["5"]=="T"){
						tempTransparency = "T";
					}
					if(coiData1["4"]=="F"){
						tempTransparencyBorder = "F";
					}
				}}
			for(key in coiDataMap) {				
				if(key.match(/COI[0-9]+/)){
					coirn += coiCount + ',';
					coiCount++;
					var coiData = {};
					
					coiTmpData = coiDataMap[key].split(",");
					var coiData = getCOIDefaults();
					$.extend(coiData, coiTmpData);
					

						var tmpDefaults = {
								'holder_x':parseInt(coiData[0]),
								'holder_y':parseInt(coiData[1]),
								'image_data':coiData[2],
								'correct_ans':coiData[3],
								'transparent_border':coiData[4]=='T'?'F':'T',
								'transparent':coiData[5],
								'media_value':coiData[6],
								'media_label_XY':coiData[7],
								'is_label_selected':coiData[8],
								'media_local_x_pos':parseInt(coiData[9]),
								'media_local_y_pos':parseInt(coiData[10]),
								'hint_value':methods.prepareTextData(coiData[11]),
								'label_value':methods.prepareTextData(coiData[12]),
								'custom_hint':coiData[13],
								/*ends default data*/
								
								/*added extra for label*/
								'feedback_value': '',
								'infoHideText':'F',
								'infoHintText':'F',
								'infoFText':'F',
								'labelGroupId':'',
								'lockStatus':false,
								'textFormat':{
									'underline_value':'F',
									'fontSize':dataMap.adminData.GFS,
									'fontStyle':'normal',
									'align':'center'
								}
						};
						if(mode=='design'){
							if(tempTransparency=="T"){
								tmpDefaults.transparent="T";
							}
							if(tempTransparencyBorder=="F"){
								tmpDefaults.transparent_border="T";
							}
						}
					coiLabelData[key] = tmpDefaults;	
					if(coiData[2] != "N"){
						this.image_list.push(coiData[2]);
					}
					/** --- for hint feedback option --- **/
					if(coiLabelData[key].hint_value && (coiLabelData[key].hint_value !== '%n%'|| coiLabelData[key].hint_value !== '')){
						dataMap.adminData.showHintOrFeedbackInAuthoring = 'hint';
					}
				} else if(key.match(/COIPS/)){
					coips = coiDataMap[key].split(",");
					
					var coiPsData = {
							'totalRandomLabels': coips[0],
							'disableFeedback': coips[1],
							'disableInstantFeedback': coips[2],
							'disableHints': coips[3],
							'studentGradeFormat': coips[4]
						};
					
				} else if(key.match(/COIRN/)){
					coirn = coiDataMap[key];
				} else if(key.match(/COIST/)){
					coist = coiDataMap[key];
				} else if(key.match(/VST/)){
					vst = parseInt(coiDataMap[key]);
				}
			}
			
			
			dataMap.COIData = coiLabelData;
			dataMap.COIRN 	= coirn;
			dataMap.COIPS 	= coiPsData;
			dataMap.VST 	= vst;
			dataMap.COIST 	= coist;
			
			return dataMap;
			
			

			function getCOIDefaults() {
				var coidefaults = {
						'0'	: '10',
						'1'	: '10',
						'2'	: 'N',
						'3'	: 'F',
						'4'	: 'T',
						'5'	: 'F',
						'6'	: 'N',
						'7'	: 'N',
						'8'	: 'F',						
						'9'	: '233',
						'10': '259',
						'11': '',
						'12': '',
						'13': ''						
				}
				return coidefaults;
			}
		},
		
		fixPRGData : function(tempDataMap,dataMap) {
			var prgData = new Array();
			var prgCount = 0;
			var prgtCount = 0;
			var prgrn = '';
			var counter = 0;
			var tempDockTransparency = 'F';
			var tempLabelTransparency = 'F';
			dataMap.PRGData ={};
			dataMap.PRGData.PRGDockData={};
			dataMap.PRGData.PRGLabelData={};
			dataMap.adminData.OTM = true;
			dataMap.adminData.OTO = false;
			for(key in tempDataMap) {				
				if(key.match(/PRGS[0-9]+/)){
					prgCount++;
					var prgData = {};
					prgData = tempDataMap[key].split(",");
					var tmpDefaults = getPRGDefaults();
					$.extend(tmpDefaults, prgData);
					var dockId = 'dock_label_'+key.substr(4);
					var prgdockData = this.preparePRGDockData(tmpDefaults,dataMap,dockId);//dataMap is passed 'showHintOrFeedbackInAuthoring' in adminData
					dataMap.PRGData.PRGDockData[key] = prgdockData;
					delete dataMap[key];					
				}
				
				if(key.match(/PRGT[0-9]+/)){
					prgrn += prgtCount + ',';
					var prgtData = {};
					
					prgtData = tempDataMap[key].split(',');
					//console.log(prgtData);
					var tmpcDefaults = getPRGTDefaults();
					$.extend(tmpcDefaults, prgtData);
					var labelId = 'label_'+key.substr(4);
					var prglabelData = this.preparePRGLabelData(tmpcDefaults,dataMap,labelId);//dataMap is passed 'showHintOrFeedbackInAuthoring' in adminData
					dataMap.PRGData.PRGLabelData[key] = prglabelData;
					delete dataMap[key];	
				}				
			}
			
			var prgdockData = dataMap.PRGData.PRGDockData;	
			dataMap.PRGData.PRGDockData={};
			var posArrDock = new Array();
			for(var eachPRG in prgdockData){
				posArrDock.push(parseInt(prgdockData[eachPRG].PRG_sentence_list_y));
			}
			if(mode == 'design'){
				for(key in prgdockData){
					if(prgdockData[key].current_SLED_item_transparency == 'T'){
						tempDockTransparency = 'T';
					}
				}
			}
			if(mode == 'design'){
				for(key in prgdockData){
					prgdockData[key].current_SLED_item_transparency = tempDockTransparency;					
				}
			}
			for(key in prgdockData){
				prgdockData[key].sentence = methods.prepareTextData(prgdockData[key].sentence);					
			}

			for(key in prgdockData){
				prgdockData[key].feedback = methods.prepareTextData(prgdockData[key].feedback);					
			}
			for(key in dataMap.PRGData.PRGLabelData){
				dataMap.PRGData.PRGLabelData[key].term = methods.prepareTextData(dataMap.PRGData.PRGLabelData[key].term);					
			}

			if(mode == 'design'){
				for(key in dataMap.PRGData.PRGLabelData){
					if(dataMap.PRGData.PRGLabelData[key].current_item_transparency == 'T'){
						tempLabelTransparency = 'T';
					}
				}
			}
			if(mode == 'design'){
				for(key in dataMap.PRGData.PRGLabelData){
					dataMap.PRGData.PRGLabelData[key].current_item_transparency = tempLabelTransparency;					
				}
			}
			if(mode == 'design'){
				for(key in dataMap.PRGData.PRGLabelData){
					dataMap.PRGData.PRGLabelData[key].term = methods.prepareTextData(dataMap.PRGData.PRGLabelData[key].term);					
				}
			}
			posArrDock.sort(function(a,b){return a-b});
			for(var i=0;i<posArrDock.length; i++){
				for(var eachPRG in prgdockData){
					if(parseInt(prgdockData[eachPRG].PRG_sentence_list_y) == posArrDock[i]){
						dataMap.PRGData.PRGDockData['PRGS'+i] = prgdockData[eachPRG];
					}
				}
			}
			
			var _this = this;
			dataMap = createDistractorData(dataMap,_this);//'this' is passed to make it available inside createDistractorData()
			prgrn = prgrn.substr(0, (prgrn.length-1));
			
			var prgcommon = {			
													
					'PRGGV'	: '',
					'SLELD'	: '120,70',
					'DCKLD' : '300,80',							
					'PRGRN' : prgrn,
					'PRGRQ'	: ''
						
			};
			
			
			$.extend(prgcommon, tempDataMap);
			
			
			/** ---------- For PRGPS start -------------- **/
			var prgPS = {
				'totalRandomLabels': prgtCount, 
				'disableFeedback': 'N',
				'disableInstantFeedback': 'N',
				'disableHints': 0,
				'studentGradeFormat': 'P',
				'sentenceReorder' : 'F'
			};
			
			var prgpsArr = tempDataMap.PRGPS.split(',');
			
			prgPS.totalRandomLabels = prgpsArr[0];
			prgPS.disableFeedback = prgpsArr[1];
			prgPS.disableInstantFeedback = prgpsArr[2];
			prgPS.disableHints = prgpsArr[3];
			prgPS.studentGradeFormat = prgpsArr[4];
			if(prgpsArr[5] == "T")
				prgPS.sentenceReorder = "F";
			else
			prgPS.sentenceReorder = "T";
			dataMap.PRGPS = {};		
			dataMap.PRGPS = prgPS;
			
			/** ---------- For PRGPS end -------------- **/
			
			/** ---------- For PRGGP start -------------- **/
			if(tempDataMap.PRGGP){
				var prggpArr = tempDataMap.PRGGP.split(',');
				
				dataMap.PRGGP = {};			
				dataMap.PRGGP.borderGlobal = prggpArr[0];
				dataMap.PRGGP.backGroundGlobal = prggpArr[1];
				dataMap.PRGGP.labelBorderGlobal = prggpArr[2];
				dataMap.PRGGP.labelBGGlobal = prggpArr[3];
				dataMap.PRGGP.dockBGGlobal = prggpArr[4];
				dataMap.PRGGP.textAlign = prggpArr[5];
			} else {
				dataMap.PRGGP = {};			
				dataMap.PRGGP.borderGlobal = 'T';
				dataMap.PRGGP.backGroundGlobal = 'T';
				dataMap.PRGGP.labelBorderGlobal = 'N';
				dataMap.PRGGP.labelBGGlobal = 'N';
				dataMap.PRGGP.dockBGGlobal = 'T';
				dataMap.PRGGP.textAlign = 'left';
			}
			var prgGP = {
				'borderGlobal': 'T',
				'backGroundGlobal': 'T',
				'labelBorderGlobal': 'N',
				'labelBGGlobal': 'N',
				'dockBGGlobal': 'N',
				'textAlign': 'left'
			};
			
			
			dataMap.PRGGP = {};	
			if(tempDataMap.PRGGP){
				var prggpArr = tempDataMap.PRGGP.split(',');
				dataMap.PRGGP.borderGlobal = prggpArr[0];
				dataMap.PRGGP.backGroundGlobal = prggpArr[1];
				dataMap.PRGGP.labelBorderGlobal = prggpArr[2];
				dataMap.PRGGP.labelBGGlobal = prggpArr[3];
				dataMap.PRGGP.dockBGGlobal = prggpArr[4];
				dataMap.PRGGP.textAlign = prggpArr[5];
			}else{
				dataMap.PRGGP.borderGlobal = prgGP['borderGlobal'];
				dataMap.PRGGP.backGroundGlobal = prgGP['backGroundGlobal'];
				dataMap.PRGGP.labelBorderGlobal = prgGP['labelBorderGlobal'];
				dataMap.PRGGP.labelBGGlobal = prgGP['labelBGGlobal'];
				dataMap.PRGGP.dockBGGlobal = prgGP['dockBGGlobal'];
				dataMap.PRGGP.textAlign = prgGP['textAlign'];
			}
			
			/*dock text alignment issue*/
			
			if(version == 2000 || version == 2010 || version == 2011){
				var textalign = dataMap.PRGGP.textAlign;
				/** Text align is populated in preparePRGDockData **/
				/*if(!textalign)
					textalign = "left";
				for(key in dataMap.PRGData.PRGDockData){
					dataMap.PRGData.PRGDockData[key].textFormat.align = textalign;					
				}*/
				/**This is done for CTCD-204, text in prg dock was coming in left alignment though it was center aling in original string **/
				if(!textalign)
					textalign = "left";
				for(key in dataMap.PRGData.PRGDockData){
					dataMap.PRGData.PRGDockData[key].textFormat.align = textalign;					
				}
			}
			
			/** ---------- For PRGGP end -------------- **/
			
			/** ---------- For other common data start -------------- **/
			var prgCommonData = preparePRGCommonData(tempDataMap,dataMap);
			
			function preparePRGCommonData(tempDataMap,dataMap){
				try{
					dataMap.PRGGV = tempDataMap.PRGGV;
					dataMap.SLELD = tempDataMap.SLELD;
					dataMap.DCKLD = tempDataMap.DCKLD;
					dataMap.PRGRN = tempDataMap.PRGRN;
					dataMap.PRGRQ = tempDataMap.PRGRQ;
				}
				catch(err){
					console.info('****** Error in olddata_validator :: preparePRGCommonData ****** :'+err.message);
				}
			}
			function getPRGDefaults() {
				var prgdefaults = {
						'0'	: '',
						'1'	: '',
						'2'	: '174',
						'3'	: '9',
						'4'	: 'F',
						'5'	: 'N',
						'6'	: '0|0',
						'7'	: '233',
						'8'	: '259',						
						'9'	: '',
						'10': '',
						'11': '',
						'12': ''
						
				}
				
				return prgdefaults;
			}
			
			
			function getPRGTDefaults() {
				var prgtdefaults = {
						'0'	: '',
						'1'	: '50',
						'2'	: '10',
						'3'	: 'T',
						'4'	: 'F',
						'5'	: 'N',
						'6'	: '0|0',
						'7'	: '233',
						'8'	: '259'				
				}
				
				return prgtdefaults;
			}
			
			function createDistractorData(dataMap,_this){
				var dockCount =0;
				var labelCount =0;
				for(var key in dataMap.PRGData.PRGDockData)
					dockCount++;
				for(var key in dataMap.PRGData.PRGLabelData)
					labelCount++;
				
				var textVal = '';				
				for(i=0; i<dockCount;i++){
					var dock = dataMap.PRGData.PRGDockData['PRGS'+i];
					textVal = textVal + dock.sentence;
				}
				textVal = methods.prepareTextData(textVal);
				var c = textVal.replace((/__([a-z0-9A-Z\W\s]+)__/g), '__~~$1~~__');
				var splittedWords = c.split(/__([a-z0-9A-Z\W\s]+)__/g);
				var finalSplitArray = new Array();
				for(var k=0;k<splittedWords.length;k++){
					finalSplitArray.push(splittedWords[k].replace(/\n/g,' '));
				}
					
				for(i=0; i<labelCount;i++){					
					if(($.inArray(('~~'+(dataMap.PRGData.PRGLabelData['PRGT'+i].term)+'~~'), finalSplitArray)) == -1){
						dataMap.PRGData.PRGLabelData['PRGT'+i]['distractor_label'] = "T";
					}
				}
			
				return dataMap;
			}
			return dataMap;
		},
		
		makeString : function(data,removekey) {
			var str = '';
			
			if(removekey == 1 ) {
				for(key in data) {
					str += data[key] + ',';
				}
			} else {
				for(key in data) {
					str += key + '=' + data[key] + ',';
				}
			}
			
			str = str.substr(0,(str.length-1));
			return str;
		},
		makeOutputStr : function(dataMap) {			
			var outputStr = '';
			var studentScore = '';
			for(key in dataMap) {
				if(key != '' ) {
					if(key != 'studentScore'  ) {
						outputStr += key + '=' + dataMap[key] + ';';
					} else {
						studentScore = ';studentScore=' + dataMap[key];
					}
				}				
			}

			outputStr = escape(outputStr) + studentScore;

			return outputStr;
		},
	};	
	String.prototype.validate_olddata = function(callbackFun,callbackData){
		console.log("calling olddata_validator.init");
		  return methods.init(this,callbackFun,callbackData);
	}
})( jQuery );
