/**
Author:  Malcolm Duncan wmd@clearlearning.com

VARIABLES from API

 var EZ.MODE_PREVIEW   = "preview"; // mode showing correct answers in place
 var EZ.MODE_TEST   = "test";  // standard student mode
 var EZ.MODE_PREGRADE  = "sample";  // mode to pregrade only items answered
 var EZ.MODE_POST_TEST  = "review";  // mode to fully grade/score the object

 var EZ.id    = "";    // external identifier from EZTO
 var EZ.qid    = "";    // parent question identifier from EZTO
 var EZ.mode    = "";    // rendering mode from EZTO
 var EZ.state   = "";    // initial state from EZTO

REQUIRED FUNCTIONS to be provided by author:

 setState( theState )
  called upon instatiation by API to set the initial state
   initial state is authored in the EZTO item
   theState is a UTF-8 string - could be XML

   ALL modes listed above are required to be supported!!!

 getState()
  called by EZTO on page exit to collect the current state
   should return a UTF-8 string
    no binary data
    XML is OK

 getScore()
  called by EZTO on page exit to collect the current score
   should return an integer from 0 to 100 reprenting percentage correct
*/
//var gteInstanceId = 0; 
function setState(theState) // test rig sample
{

  /*It is your responsibility to parse the state as needed.  This state will
  be the initial state authored with the item in EZTO or the result of an
  earlier call to getState() below.*/
  //EZ.state = theState;
  console.log("inside etszto set state");
  console.log("Bootstrapping the application.");
  window.startBootStrappingApp();

  //return CDInstance.setState(theState);
}

function getState()    // test rig sample
{
  /*
   It is your responsibility to package the state in a manner that it may be
   parsed correctly at a later time in setState() above.
  */
  return CDInstance.getState();
}

function getScore()    // test rig sample
{
  /*
   You may ONLY return an integer between 0 and 100 representing percentage correct.
  */
  return CDInstance.getScore();

}



function getCompletion(state) {
  if (state == "" || state == "0") {
    return 0;
  }
  else {
    return CDInstance.getCompletion(state);
  }
}


function resizeMe()    // test rig sample
{
  EZ.resize($('#frame_width').val(), $('#frame_height').val());
}

function getPolicy()    // test rig sample
{
  var thePolicy = EZ.policy($('#policy_name').val());
  //alert( thePolicy );
  return thePolicy;
}

function getParam()    // test rig sample
{
  //alert( $('#param_name').val() );
  var theParam = EZ.param($('#param_name').val());
  //alert( theParam );
  return theParam;
}

function buildMediaList() {
  var theList = '<select onChange="showMedia(options[selectedIndex].value);">';
  theList += '<option selected value="head">Pick one</option>';
  for (var i = 0; i < EZ.mediaUrls.length; i++)
    theList += '<option value="' + EZ.mediaUrls[i] + '">' + EZ.mediaUrls[i] + '</option>';
  theList += '</select>';

  $('#mediaList').html(theList);
}

function showMedia(name) {
  var imageTag = '<image src="' + EZ.media(name) + '">';
  $('#mediaDisplay').html(imageTag);
  window.setTimeout('EZ.resize($(document).width(), $(document).height());', 500);
}
