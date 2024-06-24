/*
 * jQuery Data Validator Plugin for old datastring
 * @author:552756
 */

(function($){

		var settings = {			
				
		};
		var methods = {
				init : function(inputStr,callbackFun,callbackData) { 
					console.log("@newauthData_validator.init");
					try{						
						var validInputStrting = inputStr;
						if(inputStr.indexOf(';studentScore') != -1){
							validInputStrting = inputStr.split(';studentScore')[0];//For splitting 'studentScore' from student side data
						}
						
						var dataMap =  JSON.parse(validInputStrting);					
						this.frameDataModify(dataMap);//frame data modification						
						this.exerciseTypeDataModify(dataMap);//exercise type data modification
						this.frameImageDataModify(dataMap);
						this.adminDataModify(dataMap,callbackData);//For admin data modification
						this.modifyAudioData(dataMap);//If audio position come as 'N', to change this to 0|0
						if(mode == MODE_DESIGN){
							//var mediaFlag = this.checkImageExists(dataMap);
							//if(mediaFlag){
								return dataMap;
							//}
						}else{
							ClickDrag.GlobalVars.originalValue = dataMap;
							ClickDrag.GlobalVars.shellData.dataMap = dataMap;
							callbackData.shellInput = dataMap;
							callbackFun(callbackData);
							
						}
						
						//
						
					}catch(err){
						console.info('****** Error in newauthData_validator :: init ****** :'+err.message);
					}
				},
				checkImageExists: function(dataMap){
					try{
						var mediaNotFoundStr ="";
						var et = dataMap.adminData.ET;
						var mediaValueArray = window.CD.mediaValue;
						var image_list = dataMap.adminData.imageList;
						var audio_list = dataMap.adminData.audioList;
						for(var eachimg in image_list){
							/** This is done as image name comes with width and height separated by '|' **/
							var imageName = image_list[eachimg].split('|')[0];
							var imageIndex = $.inArray(imageName,mediaValueArray); 
							if(imageIndex == -1){
								mediaNotFoundStr = mediaNotFoundStr +" " + image_list[eachimg];
							}
						}
						
						if(mediaNotFoundStr != "" && et!= "PRG"){
							removeModalWindow();								
							createModalWindow("Sorry could not process the string as :"+mediaNotFoundStr + " are missing.");
							return false;
						}else{
							return true;
						}
						
						
					}catch(e){
						console.info('****** Error in check Image Exists ****** :'+error.message);
					}
				},
				prepareTextData : function(textData){
					textData = textData.replace(/%c%/g,',');
					textData = textData.replace(/<br>/g,'\n').replace(/<\/br>/g,'\n').replace(/<br\/>/g,'\n');
					return textData;
				},
				
				adminDataModify : function(dataMap,callbackData){
					var zhp = dataMap.adminData.ZHP.split(',');
					var zoom_window_x = zhp[2];
					var zoom_window_y = zhp[3];
					var zoom_window_H = zhp[1];
					var zoom_window_W = zhp[0];
					var zoomX = parseInt(dataMap.FrameData[0].frameWidth)-10;
					var zoomY = parseInt(dataMap.FrameData[0].frameHeight)-10;
					if((parseInt(zoom_window_x)+parseInt(zoom_window_W))>zoomX){
						zhp[2] = zoomX-parseInt(zoom_window_W);
					}					
					if((parseInt(zoom_window_y)+parseInt(zoom_window_H))>zoomY){
						zhp[3] = zoomY-parseInt(zoom_window_H);						
					}
					dataMap.adminData.ZHP = '';
					dataMap.adminData.ZHP = zhp.join(',');
					if(dataMap.adminData.ET != 'PRG'){
						if(!dataMap.adminData.OTO && !dataMap.adminData.OTM && !dataMap.adminData.TYPE) {
							dataMap.adminData.OTO = true;
						}
					}
					/** updating AW/AH comparing with frame width/height **/
					/*var frameW = dataMap.FrameData[0].frameWidth;
					var frameH = dataMap.FrameData[0].frameHeight;
					
					var canvasW = parseInt(dataMap.adminData.AW);
					var canvasH = parseInt(dataMap.adminData.AH);
					
					if(canvasW<frameW){
						dataMap.adminData.AW = frameW;
					}
					
					if(canvasH<frameH){
						dataMap.adminData.AH = frameH;
					}*/
					
					if(callbackData && (callbackData.contentHeight >= 100 && callbackData.contentWidth >= 100)){		//Checked undefined as authoring mode doesn't pass callbackData
						dataMap.adminData.AH = callbackData.contentHeight;
						dataMap.adminData.AW = callbackData.contentWidth;	
					}
					
					//Added the frame 0/Canvas width and height shouldn't be more than iFrame height and width by SS'
					dataMap.FrameData[0].frameWidth = dataMap.adminData.AW;
					dataMap.FrameData[0].frameHeight = dataMap.adminData.AH;
					if(mode == "preview" && parent.document.getElementById(window.name)){
						dataMap.FrameData[0].frameWidth = parseInt(parent.document.getElementById(window.name).width);
						dataMap.FrameData[0].frameHeight = parseInt(parent.document.getElementById(window.name).height);
					}
					
				},
				/***
				 * This is used for modification of frame data for new data string
				 * @param dataMap
				 */
				frameDataModify : function(dataMap){
					try{
						dataMap.FrameData[0].frameX = 0;
						dataMap.FrameData[0].frameY = 0;
						dataMap.FrameData[0].frameOriginalX = 0;
						dataMap.FrameData[0].frameOriginalY = 0;
						
						var frameTextList = dataMap.FrameData[0].frameTextList;
						if(frameTextList.length>0){
							//if(frameTextList.length>1){//for more than one text in a frame
								var textList = frameTextList;
								for(var eachText in textList){
									if(textList[eachText].textX !== null && textList[eachText].textY !== null){//For a text will null textX and textY will not be shown
										dataMap.FrameData[0].frameTextList[eachText].textX = parseInt(textList[eachText].textX);
										dataMap.FrameData[0].frameTextList[eachText].textY = parseInt(textList[eachText].textY);
										
										if(mode !== 'design'){
											dataMap.FrameData[0].frameTextList[eachText].textX = parseInt(textList[eachText].textX);
											dataMap.FrameData[0].frameTextList[eachText].textY = parseInt(textList[eachText].textY);
										}
									}
									
								}
							/*}else{
								dataMap.FrameData[0].frameTextList[0].textX = parseInt(frameTextList[0].textX)-15;
								dataMap.FrameData[0].frameTextList[0].textY = parseInt(frameTextList[0].textY)-15;
							}*/
								
						}
						
						for(var key in dataMap.FrameData){
							for(var mkey in dataMap.FrameData[key].frameTextList){
								dataMap.FrameData[key].frameTextList[mkey].textGroupObjID = 'txt_'+mkey+'_'+key;
								
								/** For old converted and retrieved string, textAlign,fontType and underlineVal are set to default values **/
								if(dataMap.FrameData[key].frameTextList[mkey].textAlign == undefined){
									dataMap.FrameData[key].frameTextList[mkey].textAlign = 'center';
								}
								if(dataMap.FrameData[key].frameTextList[mkey].fontType == undefined){
									dataMap.FrameData[key].frameTextList[mkey].fontType = 'normal';
								}
								if(dataMap.FrameData[key].frameTextList[mkey].underlineVal == undefined){
									dataMap.FrameData[key].frameTextList[mkey].underlineVal = 'F';
								}
							}
						}
						//16 is the height and width of the ruler
						
						var frameImageList = [];
						frameImageList = dataMap.FrameData[0].frameImageList;
						if(Object.keys(frameImageList).length>0){
							//if(Object.keys(frameImageList).length>1){//for more than one text in a frame
								var imageList = frameImageList;
								for(var eachImg in imageList){
									dataMap.FrameData[0].frameImageList[eachImg].imageX = parseInt(frameImageList[eachImg].imageX)-parseInt(dataMap.FrameData[0].frameOriginalX);
									dataMap.FrameData[0].frameImageList[eachImg].imageY = parseInt(frameImageList[eachImg].imageY)-parseInt(dataMap.FrameData[0].frameOriginalY);
								}
							//}/*else{
								/*var imgId = 'img_0_0';
								dataMap.FrameData[0].frameImageList[imgId].imageX = parseInt(frameImageList[imgId].imageX)-parseInt(dataMap.FrameData[0].frameOriginalX);
								dataMap.FrameData[0].frameImageList[imgId].imageY = parseInt(frameImageList[imgId].imageY)-parseInt(dataMap.FrameData[0].frameOriginalY);
							}*/
						}
						if(mode !== 'design'){
							var frmData = dataMap.FrameData;
							var frmDataLength = frmData.length;
							for(var i=0; i<frmDataLength; i++){
								var frmTxtLst = frmData[i].frameTextList;
								for(var eachText in frmTxtLst){
									frmTxtLst[eachText].textValue = this.prepareTextData(frmTxtLst[eachText].textValue);
								}
							}
						}
					}
					
					catch(error){
						console.info('****** Error in newauthData_validator :: frameDataModify ****** :'+error.message);
					}
				},
				frameImageDataModify : function(dataMap){
					try{
						
						var frameList = dataMap.FrameData;
						for(key in frameList){
							if(key != '0'){
								var tempFrameImgList = {};
								var frameImageList = frameList[key].frameImageList;
								for(mkey in frameImageList){
									var img = frameImageList[mkey];
									var imgIndex = mkey.split('_')[2];
									var newImage = 'img_'+key+'_'+imgIndex;
									delete frameImageList[mkey];
									tempFrameImgList[newImage] = img;
									//frameImageList.imageId = 
								}
								frameList[key].frameImageList = tempFrameImgList;
							}
						}
						
					}
					
					catch(error){
						console.info('****** Error in newauthData_validator :: frameDataModify ****** :'+error.message);
					}
				},
				/***
				 * This is used for exercise data modification method selection
				 * @param dataMap
				 */
				exerciseTypeDataModify : function(dataMap,callbackData){
					try{
						var et = dataMap.adminData.ET;
						switch(et){
						case 'SLE':			
							this.modifySLEData(dataMap);
							break;
						case 'CLS':
							this.modifyCLSData(dataMap);
							break;
						case 'PRG':
							this.modifyPRGData(dataMap);
							break;
						case 'COI':
							this.modifyCOIData(dataMap);
							break;
						}
					}catch(error){
						console.info('****** Error in newauthData_validator :: exerciseTypeDataModify ****** :'+error.message);
					}
					
				},
				/***
				 * This is used for SLEData modification for new data string
				 * @param dataMap
				 */
				modifySLEData : function(dataMap){
					try{
						var SLEData = dataMap.SLEData;
						for(var eachSLE in SLEData){
							if(SLEData[eachSLE].connector_facing == 'B'){//for connector facing Bottom
								dataMap.SLEData[eachSLE].connector_mx_authoring = parseInt(SLEData[eachSLE].connector_my);
								dataMap.SLEData[eachSLE].connector_my_authoring = parseInt(SLEData[eachSLE].connector_mx)*(-1);
								dataMap.SLEData[eachSLE].connector_lx_authoring = parseInt(SLEData[eachSLE].connector_ly);
								dataMap.SLEData[eachSLE].connector_ly_authoring = parseInt(SLEData[eachSLE].connector_lx)*(-1);
							}
							if(SLEData[eachSLE].connector_facing == 'R'){//for connector facing Right
								dataMap.SLEData[eachSLE].connector_mx_authoring = SLEData[eachSLE].connector_mx;
								dataMap.SLEData[eachSLE].connector_my_authoring = SLEData[eachSLE].connector_my;
								dataMap.SLEData[eachSLE].connector_lx_authoring = SLEData[eachSLE].connector_lx;
								dataMap.SLEData[eachSLE].connector_ly_authoring = SLEData[eachSLE].connector_ly;
							}
							
							if(SLEData[eachSLE].connector_facing == 'T'){//for connector facing Top
								dataMap.SLEData[eachSLE].connector_mx_authoring = parseInt(SLEData[eachSLE].connector_my)*(-1);
								dataMap.SLEData[eachSLE].connector_my_authoring = parseInt(SLEData[eachSLE].connector_mx);
								dataMap.SLEData[eachSLE].connector_lx_authoring = parseInt(SLEData[eachSLE].connector_ly)*(-1);
								dataMap.SLEData[eachSLE].connector_ly_authoring = parseInt(SLEData[eachSLE].connector_lx);
							}
							if(SLEData[eachSLE].connector_facing == 'L'){//for connector facing Left
								dataMap.SLEData[eachSLE].connector_mx_authoring = parseInt(SLEData[eachSLE].connector_mx)*(-1);
								dataMap.SLEData[eachSLE].connector_my_authoring = parseInt(SLEData[eachSLE].connector_my)*(-1);
								dataMap.SLEData[eachSLE].connector_lx_authoring = parseInt(SLEData[eachSLE].connector_lx)*(-1);
								dataMap.SLEData[eachSLE].connector_ly_authoring = parseInt(SLEData[eachSLE].connector_ly)*(-1);
							}
							
							var imageData = SLEData[eachSLE].image_data.split('|');
							dataMap.SLEData[eachSLE].image_data = imageData[0];
							if(imageData[1] && imageData[2]){
								dataMap.SLEData[eachSLE].imageDimension = {
										imageHeight : parseInt(imageData[2]),
										imageWidth : parseInt(imageData[1])
								};
							}
							if(mode !== 'design'){
								SLEData[eachSLE].label_value = this.prepareTextData(SLEData[eachSLE].label_value);
							}
							
							if(!SLEData[eachSLE].local_magnification){
								var local_magnification = {};
								var zhp = dataMap.adminData.ZHP;
								var local_magnification_data = zhp.split(',');
								local_magnification.localMagnificationWidth = local_magnification_data[0];
								local_magnification.localMagnificationHeight = local_magnification_data[1];
								local_magnification.localMagnificationFactor = local_magnification_data[4];
								SLEData[eachSLE].local_magnification = local_magnification;
							}
							
						}
					}
					catch(error){
						console.info('****** Error in newauthData_validator :: modifySLEData ****** :'+error.message);
					}
				},
				/***
				 * This is used for COIData modification for new data string
				 * @param dataMap
				 */
				modifyCOIData : function(dataMap){
					try{
						var COIData = dataMap.COIData;
						for(var eachCOI in COIData){
							var imageData = COIData[eachCOI].image_data.split('|');
							dataMap.COIData[eachCOI].image_data = imageData[0];
							if(imageData[1] && imageData[2]){
								dataMap.COIData[eachCOI].imageDimension = {
										imageHeight : parseInt(imageData[2]),
										imageWidth : parseInt(imageData[1])
								};
							}
							if(mode !== 'design'){
								COIData[eachCOI].label_value = this.prepareTextData(COIData[eachCOI].label_value);
							}
						}
					}catch(error){
						console.info('****** Error in newauthData_validator :: modifyCOIData ****** :'+error.message);
					}
					
				},
				modifyCLSData : function(dataMap){
					var CLSData = dataMap.CLSData;
					for(var eachCLS in CLSData){
						
						var imageData = CLSData[eachCLS].image_data.split('|');
						dataMap.CLSData[eachCLS].image_data = imageData[0];
						if(imageData[1] && imageData[2]){
							dataMap.CLSData[eachCLS].imageDimension = {
									imageHeight : parseInt(imageData[2]),
									imageWidth : parseInt(imageData[1])
							};
						}
						
						dataMap.CLSData[eachCLS].FIB_value = '';
						var label_value = CLSData[eachCLS].label_value;
						var modifiedText = label_value.replace((/__([a-z0-9A-Z\W\s]+)__/g), '__~~$1~~__');			
						var senArr = modifiedText.split(/__([a-z0-9A-Z\W\s]+)__/g);			
						
						for(var i=0;i<senArr.length;i++) {
							if(senArr[i].indexOf("~~") != -1) {
								var fibVal = label_value;
							}
						}
						if(fibVal){
							dataMap.CLSData[eachCLS].FIB_value = fibVal;
						}else{
							dataMap.CLSData[eachCLS].FIB_value = 'N';
						}
						if(mode !== 'design'){
							CLSData[eachCLS].label_value = this.prepareTextData(CLSData[eachCLS].label_value);
						}
					}
					
				},
				modifyPRGData : function(dataMap){
					//if(mode == "test"){
						var prgdockData = dataMap.PRGData.PRGDockData;	
						var prglabelData = dataMap.PRGData.PRGLabelData;
						dataMap.PRGData.PRGDockData={};
						var posArrDock = new Array();
						for(var eachPRG in prgdockData){
							posArrDock.push(parseInt(prgdockData[eachPRG].PRG_sentence_list_y));
							if(mode !== 'design'){
								prgdockData[eachPRG].sentence = this.prepareTextData(prgdockData[eachPRG].sentence);
							}
						}
						if(mode !== 'design'){
							for(var eachPRG in prglabelData){
								prglabelData[eachPRG].term = this.prepareTextData(prglabelData[eachPRG].term);
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
						
					//}
				},
				modifyAudioData : function(dataMap){
					if(dataMap.adminData.ET == 'SLE' || dataMap.adminData.ET == 'CLS'){
						if(dataMap.adminData.ET == 'SLE'){
							for(key in dataMap.SLEData){
								if(dataMap.SLEData[key].media_label_XY == 'N'){
									dataMap.SLEData[key].media_label_XY = '0|0';
								}
							}
						}
						if(dataMap.adminData.ET == 'CLS'){
							for(key in dataMap.CLSData){
								if(dataMap.CLSData[key].play_option_value == 'N'){
									dataMap.CLSData[key].play_option_value = '0|0';
								}
							}
						}
					}
				}
		
		};
	String.prototype.validate_newAuth = function(callbackFun,callbackData){
		console.log("calling validate_newAuth.init");
		  return methods.init(this,callbackFun,callbackData);
	}

})( jQuery );