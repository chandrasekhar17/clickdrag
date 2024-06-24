/**
	EZTO External Question Open API v1.4.3

	API function to collect state and score info from the external object
	
	YOU MAY NOT EDIT THIS SCRIPT!!!

	API Author:  Malcolm Duncan wmd@clearlearning.com
*/

var API_PARENT_VERSION = "1.4.3";

var ex_list = null;
var ex_looping = 0;
var ex_function = null;
var ex_arg = null;
var ex_start = null;

var EX_MODE_PREVIEW = "preview";	// mode showing correct answers in place
var EX_MODE_TEST = "test";		// standard student mode
var EX_MODE_PREGRADE = "sample";		// mode to pregrade only items answered
var EX_MODE_POST_TEST = "review";		// mode to fully grade/score the object
var EX_MODE_DESIGN = "design";		// mode to edit the object


/*
 * calling convention
 * 
 * ex_startgather( 'call at end function', argument for call at end function);
 * if (!ex_gather()) return;
 * 
 * e.g.
 * ex_startgather( 'doPregrade', nextID );
 * if (!ex_gather()) return;
 */

function ex_get_varByID(varname) {
	return $("#" + varname).val();
}

function ex_get_varByDivID(divname) {
	return $("#" + divname).attr('id');
}

function ex_loadSpinner(aid) {
	var iframeID = ex_get_varByDivID(aid),
		iframeSpinner = ex_get_varByDivID(aid + "_spinner"),
		$spinner = $("#" + iframeSpinner),
		$wkIframe = $("#" + iframeID);
	if ($spinner.hasClass("hide")) {
		$spinner.removeClass("hide");
	}
	setTimeout(function () {
		if ($wkIframe.hasClass("hide")) {
			$wkIframe.removeClass("hide");
		}
		if (!$spinner.hasClass("hide")) {
			$spinner.addClass("hide");
		}
	}, 3000);
}

function ex_get_varByName(name) {
	return $('input[name=' + name + ']').val();
}

function ex_resize(id, width, height) {
	$('#' + id).css({
		width: '' + width + 'px',
		height: '' + height + 'px'
	});
}

function ex_startgather(callback, argument) {
	ex_function = callback;
	ex_arg = argument;
}

function ex_allow_regather() {
	ex_list = null;
	ex_looping = 0;
	ex_function = null;
	ex_arg = null;
	ex_start = null;
}

function ex_gather() {
	if (ex_list == null) {
		ex_start = (new Date()).getTime();
		ex_looping = 0;

		// build an array of data, and start populating the textarea's
		var ex_error_issued = false;
		ex_list = new Array();

		$('.wk_ex_iframe').each(function () {
			var theFrame = $(this);
			var theID = $(this).attr('id');
			var thisExternal = new Object();
			var prevCompletion = '',
				currentCompletion = '';

			try {
				thisExternal.state = window.frames[this.name].getState();
				thisExternal.statefield = '#' + theID + '_state';
				$(thisExternal.statefield).val(thisExternal.state);			// apparently this can take a while
				//ex_log('state size is ' + thisExternal.state.length);

				thisExternal.score = window.frames[this.name].getScore();
				thisExternal.scorefield = '#' + theID + '_eval';
				$(thisExternal.scorefield).val(thisExternal.score);

				prevCompletion = $('#' + theID + '_completion').val();
				currentCompletion = window.frames[this.name].getValidatedCompletion(thisExternal.state);
				/**
				 * We need to call deriveCompletion method to compute invalid completion value received from Tools.
				 * If this is not done and tool returns invalid completion (like:: "n/a") then it stores into the form's 
				 * field and update into db as invalid form in hm.tpx API call.
				 */
				currentCompletion = deriveCompletion(currentCompletion).toString();
				thisExternal.completion = currentCompletion;
				thisExternal.completionField = '#' + theID + '_completion';
				$(thisExternal.completionField).val(currentCompletion);

				/* 
				   saving tool's completion when it is in test mode and
				   the previous and current completion is different
				*/
				var testMode = window.frames[theID].ez_mode;
				if (testMode === "test" && (prevCompletion != currentCompletion)) {
					saveCompletion(thisExternal.state, thisExternal.score, thisExternal.completion, theID);
				}

				ex_list.push(thisExternal);
			}
			catch (err) {
				if (!ex_error_issued) {
					ex_error_issued = true;
					ex_log('failure to implement getState, getScore or the external API correctly');
				}
			}
		});

		/*
		// test code to force looping
		ex_looping++;
		window.setTimeout('ex_gather();', 500);
		return false;
		*/
	}

	if (ex_list.length == 0)	// no externals, we're good to go
	{
		ex_list = null;
		return true;
	}

	// we're going to assume, for now that the scores get populated successfully

	var newlist = new Array();
	for (i = 0; i < ex_list.length; i++) {
		// get the DOM value
		var theField = $(ex_list[i].statefield).val();
		//ex_log('field size is ' + theField.length)

		// if the DOM value doesn't yet match our memory copy, hold it for checking later
		if (theField != ex_list[i].state)
			newlist.push(ex_list[i]);
	}

	// newlist has the items that have yet to propagate into the DOM properly

	// if there are none, we're done
	if (newlist.length == 0) {
		ex_list = newlist;

		ex_log("finished ex_gather() in " + ((new Date()).getTime() - ex_start) + "ms after " + ex_looping + " loops");
		if (ex_looping > 0) {
			if (ex_function == 'backgroundSave') backgroundSave();
			else if (ex_function == 'continueTest') continueTest(ex_arg);
			else if (ex_function == 'doExit') doExit(ex_arg);
			else if (ex_function == 'doPregrade') doPregrade(ex_arg);
			else if (ex_function == 'forceSubmission') forceSubmission();
			else if (ex_function == 'eztoChatSave') eztoChatSave();
			ex_function = null;
			ex_arg = null;
		}

		return true;
	}

	ex_looping++;
	if (ex_looping > 120) {
		ex_log("gave up waiting on the DOM in ex_gather() after " + ex_looping + " loops (1 minute) with " + ex_list.length + " externals unvalidated");
		ex_list = new Array();

		if (ex_function == 'backgroundSave') backgroundSave();
		else if (ex_function == 'continueTest') continueTest(ex_arg);
		else if (ex_function == 'doExit') doExit(ex_arg);
		else if (ex_function == 'doPregrade') doPregrade(ex_arg);
		else if (ex_function == 'forceSubmission') forceSubmission();
		else if (ex_function == 'eztoChatSave') eztoChatSave();
		ex_function = null;
		ex_arg = null;

		return true;
	}

	ex_list = newlist;
	window.setTimeout('ex_gather();', 500);
	return false;
}

function ex_log(message) {
	try {
		if (console && console.log) console.log(message);
	}
	catch (err) {
		//window.alert(message);
	}
}



function extGather() {
	$('.wk_ex_iframe').each(function () {
		var theFrame = $(this);
		var theID = $(this).attr('id');
		//alert(theID);
		var prevCompletion = '';

		try {
			var theState = window.frames[this.name].getState();
			$('#' + theID + '_state').val(theState);

			var theScore = window.frames[this.name].getScore();
			$('#' + theID + '_eval').val(theScore);

			prevCompletion = $('#' + theID + '_completion').val();
			var currentCompletion = window.frames[this.name].getValidatedCompletion(theState);
			currentCompletion = deriveCompletion(currentCompletion).toString();
			$('#' + theID + '_completion').val(currentCompletion);

			/* 
			   saving tool's completion when it is in test mode and
			   the previous and current completion is different
			*/
			var testMode = window.frames[theID].ez_mode;
			if (testMode === "test" && (prevCompletion != currentCompletion)) {
				saveCompletion(theState, theScore, currentCompletion, theID);
			}
		}
		catch (err) {
			ex_log(err.message);
		}
	});
}


function extTestGather() {
	$('.wk_ex_iframe').each(function () {
		var theFrame = $(this);
		var theID = $(this).attr('id');
		//alert(theID);
		try {
			var theState = window.frames[this.name].getState();
			$('#' + theID + '_ostate').val(theState);

			var theScore = window.frames[this.name].getScore();
			$('#' + theID + '_eval').val(theScore);

			var theCompletion = window.frames[this.name].getCompletion(theState);
			$('#' + theID + '_completion').val(theCompletion);
		}
		catch (err) {
			if (console && console.log)
				console.log('failure to implement getState, getScore or the external API correctly');
			else
				window.alert('failure to implement getState, getScore or the external API correctly');
		}
	});
}


(function ($) {
	$.fn.replaceTagName = function (a) {
		var t = [];
		for (var i = this.length - 1; 0 <= i; i--) {
			var n = document.createElement(a);
			n.innerHTML = this[i].innerHTML;
			$.each(this[i].attributes, function (j, v) {
				$(n).attr(v.name, v.value);
			});
			$(this[i]).after(n).remove();
			t[i] = n;
		}
		return $(t);
	};
})(jQuery);

function extInstantiate(theItem) {
	$(theItem).addClass("wk_ex_iframe").replaceTagName('iframe');
	$(theItem).map(function (i, el) {
		el.setAttribute("allow", "microphone *; camera *");
	});
}


var EX_SAVE_TIMEOUT = 100;			// ms

function ex_trigger_save(mode, triggeringID) {
	if (mode != EX_MODE_TEST) return;

	try {
		if (backgroundSave) {
			bgSave = true;
			window.setTimeout(function () {
				backgroundSave();
				ex_allow_regather();
			}, EX_SAVE_TIMEOUT);
		}

		if (console && console.log)
			console.log('triggering backgroundSave() in ' + EX_SAVE_TIMEOUT + 'ms');
		else
			window.alert('triggering backgroundSave() in ' + EX_SAVE_TIMEOUT + 'ms');
	}
	catch (err) {
		if (console && console.log)
			console.log('error triggering backgroundSave() in ex_trigger_save');
		else
			window.alert('error triggering backgroundSave() in ex_trigger_save');
	}
}


function ex_trigger_contact(mode, qid, message) {
	if (mode == EX_MODE_PREGRADE) return;
	if (mode == EX_MODE_DESIGN) return;

	try {
		if (askPublisherAPI) askPublisherAPI(qid, message);
	}
	catch (err) {
		if (console && console.log)
			console.log('error calling askPublisherAPI() in ex_trigger_contact');
		else
			window.alert('error calling askPublisherAPI() in ex_trigger_contact');
	}
}

function saveCompletion(state, score, completion, qId) {
	var toolState = {};
	toolState.ezid = $("#wid").val();
	toolState.userId = $("#userId").val();
	toolState.attemptNo = $("#attemptNo").val();
	toolState.activityId = $("#activityId").val();
	toolState.sectionId = $("#sectionId").val();
	toolState.timestamp = new Date().getTime();
	toolState.qid = qId.split("_")[0] + "_" + qId.split("_")[1];
	toolState.tool = qId.split(toolState.qid + "_")[1];
	toolState.mode = window.frames[qId].ez_mode;
	toolState.score = score;
	toolState.state = state;
	toolState.completion = completion;

	$.ajax({
		type: "POST",
		url: "/api/tool/v1/putStateJSON",
		async: false,
		data: JSON.stringify(toolState),
		contentType: 'application/json',
		dataType: 'json',
		error: function (err) {
			console.log("Error in saving tool completion ", err);
		}
	});
}

function deriveCompletion(completion) {
	if (isNaN(parseInt(completion))) {
		if (startsWith(completion, "OOB (")) {
			try {
				var completionOobValue = completion.replace("OOB (", "");
				completionOobValue = completionOobValue.replace(")", "");
				var completionOob = parseFloat(completionOobValue);
				if (completionOob < 0) {
					return 1;
				}
			} catch (err) {
				console.log("Unable to parse : ", completion, err);
			}
		}
		return 100;
	}
	return completion;
}

function launchGenericTool(aid) {
	var data = JSON.parse($("#" + aid + "_state").val());
	var formData = data.lti_signed_data,
		html = '',
		lltiUrl = data.lti_api_endpoint;
	for (var key in formData) {
		html += '<input type="hidden" name="' + key + '" value="' + formData[key] + '" />';
	}
	if ($('#launchGenericToolForm').length > 0) {
		$('#launchGenericToolForm').remove();
	}
	$("body").append("<form id='launchGenericToolForm' target='_blank' method='post'></form>");
	$('#launchGenericToolForm').attr("action", lltiUrl);
	$('#launchGenericToolForm').html(html);
	$('#launchGenericToolForm').submit();
	$('#launchGenericToolForm').remove();
}
