/**
	EZTO External Question Open API v1.4.5
	
	YOU MAY NOT EDIT THIS SCRIPT!!!
	
	jQuery 1.3.2 or better required!!!

	Authors:	Malcolm Duncan wmd@clearlearning.com
				Chris Patterson
*/

/*
** Following constants are deprecated in favor of EZ.* constants...
*/
var MODE_PREVIEW = "preview";	// mode showing correct answers in place
var MODE_TEST = "test";		// standard student mode
var MODE_PREGRADE = "sample";		// mode to pregrade only items answered
var MODE_POST_TEST = "review";		// mode to fully grade/score the object
var MODE_DESIGN = "design";		// mode to edit the object

/*
** Following global variables are deprecated in favor of EZ.* instance variables...
*/
var ez_id = ""; 			// external identifier from EZTO
var ez_qid = ""; 			// parent question identifier from EZTO
var ez_mode = ""; 			// rendering mode from EZTO
var ez_state = ""; 			// initial state from EZTO
var ez_randoms = [];			// random variables from EZTO
var ez_mediaurls = [];			// associated media from EZTO
var ez_mediabase = "";			// baseURL from EZTO

var dName = document.domain;
if ((dName.indexOf(".com") > -1) && (dName.indexOf(".") > -1)) {
	var temp = dName.split(".");
	dName = temp[temp.length - 2] + "." + temp[temp.length - 1];
}
//alert('api base domain: ' + dName);
document.domain = dName;

var EZ = {

	API_VERSION: "1.4.5",

	MODE_PREVIEW: "preview",	// mode showing correct answers in place
	MODE_TEST: "test",		// standard student mode
	MODE_PREGRADE: "sample",	// mode to pregrade only items answered
	MODE_POST_TEST: "review",	// mode to fully grade/score the object
	MODE_DESIGN: "design",	// mode to edit the object

	id: "", 		// external identifier from EZTO
	qid: "", 		// parent question identifier from EZTO
	instanceid: "", 		// unique identifier from EZTO
	mode: "", 		// rendering mode from EZTO
	state: "", 		// initial state from EZTO
	randoms: [],			// random variables from EZTO
	mediaUrls: [],			// associated media from EZTO
	mediaBase: "",			// baseURL from EZTO
	debug: false,		// set true to see debug alerts
	isApiCallQueued: false, // to determine if any api call is in queue
	toolStateJSON: {},    // holds all the tool information
	toolserver: "",    // base path which will determine old and new save call
	toolsavethrottle: "",    // time interval to save tool instance
	dcr: "=;()_&abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
	ncr: "aeiouy0123QRST67JKEFGH45=MN;pqrs(fgh)lmnvwx89_jk&bcdtzABCDILXYZOPUVW",
	itemmedia: "./assets/testrigmedia.json",
	itemmediaJWT: "testrig",

	getParentVarByID: function (varname) {
		var result = "";

		try {
			if (parent.ex_get_varByID)
				result = parent.ex_get_varByID(varname);
			else
				this.log("EZ.getParentVarByID() - no ex_get_varByID in parent");
		}
		catch (err) {
			this.log("EZ.getParentVarByID() - exception " + err);
		}

		return result;
	},

	getParentVarByName: function (name) {
		var result = "";

		try {
			if (parent.ex_get_varByName)
				result = parent.ex_get_varByID(name);
			else
				this.log("EZ.getParentVarByName() - no ex_get_varByName in parent");
		}
		catch (err) {
			this.log("EZ.getParentVarByName() - exception " + err);
		}
		return result;
	},

	getParentDivByID: function (name) {
		var result = "";

		try {
			if (parent.ex_get_varByDivID)
				result = parent.ex_get_varByDivID(name);
			else
				this.log("EZ.getParentDivByID() - no ex_get_varByDivID in parent");
		}
		catch (err) {
			this.log("EZ.getParentDivByID() - exception " + err);
		}

		return result;
	},

	log: function (str) {
		if (this.debug) {
			// Use Firebug, Safari debugger, or other external console object if available.
			if (console && console.log)
				console.log(str);
			else
				window.status = str;
		}
	},

	error: function (str) {
		if (this.debug) {
			// Use Firebug, Safari debugger, or other external console object if available.
			if (console && console.log)
				console.log(str);
			else
				window.alert(str);
		}
	},

	init: function () {
		this.log("EZ.init()");

		//this.id= document.location.search.substring(1);
		this.id = window.name;

		if (this.id != "") {
			var part = this.id.split('_');
			this.qid = part[0] + '_' + part[1];

			//this.mode = $('#' + this.id + '_mode',  parent.document).val();
			//this.state= $('#' + this.id + '_state', parent.document).val();
			//this.instanceid= $('#' + this.id + '_instanceid', parent.document).val();

			this.mode = this.getParentVarByID(this.id + '_mode');
			this.state = this.getParentVarByID(this.id + '_state');
			this.instanceid = this.getParentVarByID(this.id + '_instanceid');
			this.getOnDemandSaveInterval();
			this.loadRandoms();
			this.randomSubstitutions();
			this.loadMediaReferences();
			this.toolserver = this.param("toolserver");
			this.toolsavethrottle = this.param("toolsavethrottle");
			this.spinnerID = this.getParentDivByID(this.id + '_spinner');
			this.loaderPresent = this.getParentVarByName(this.id + '_loaderPresent');
			var state = "";

			try {
				state = JSON.parse(this.state);
			}
			catch (e) {
				this.error("Error parsing the state; is it JSON?" + e);
			}

			try {
				if (this.spinnerID && state && state.lti_api_endpoint && this.loaderPresent === "true") {
					parent.ex_loadSpinner(this.id);
				} // This is for showing the waiting icon when GoReact tool is loading
				setState(this.state);
			}
			catch (e) {
				this.error("Error calling external setState method; is it implemented?" + e);
			}
		}

		this.log("  id         : " + this.id);
		this.log("  qid        : " + this.qid);
		this.log("  instanceid : " + this.qid);
		this.log("  mode       : " + this.mode);
		this.log("  state      : " + this.state);

		// Copy values to old global variables
		ez_id = this.id;
		ez_qid = this.qid;
		ez_mode = this.mode;
		ez_state = this.state;

		this.toolStateJSON = this.populateToolStateJson();
	},

	populateToolStateJson: function () {
		try {
			var toolState = {};
			toolState.ezid = this.param("wid");
			toolState.userId = this.param("userId");
			toolState.attemptNo = this.param("attemptNo");
			toolState.activityId = this.param("activityId");
			toolState.sectionId = this.param("sectionId");
			toolState.qid = this.qid;
			toolState.timestamp = "";
			toolState.tool = this.id.split(this.qid + '_')[1];
			toolState.mode = this.mode;
			toolState.score = this.getParentVarByID(this.id + '_eval') || 0;
			toolState.state = this.state;
			toolState.completion = getValidatedCompletion(this.state);

			var role = this.param("role");
			if (role && (role === 'instructor' || role === 'instructorPrimary' || role === 'grader')) {
				toolState.userId = 'instructorPreviewID';
			}
			return toolState;
		} catch (err) {
			this.log("EZ.populateToolStateJson() - exception " + err);
		}
	},

	getOnDemandSaveInterval: function () {
		return parseInt(this.getParentVarByID('onDemandSaveTime'));
	},

	getOnDemandExtendedSaveInterval: function () {
		return parseInt(this.getParentVarByID('onDemandExtendedSaveTime'));
	},

	resize: function (width, height) {
		this.log("EZ.resize(" + width + ", " + height + ")");

		/*
		$('#' + this.id, parent.document).css({
			width : '' + width  + 'px', 
			height: '' + height + 'px'
		});
		*/
		try {
			if (parent.ex_resize)
				result = parent.ex_resize(this.id, width, height);
			else
				this.log("EZ.resize() - no ex_resize in parent");
		}
		catch (err) {
			this.log("EZ.resize() - exception " + err);
		}
	},

	policy: function (name) {
		this.log("EZ.policy(" + name + ")");

		//return ( $('#' + name, parent.document).val() );
		return (this.getParentVarByID(name));
	},

	param: function (name) {
		this.log("EZ.param(" + name + ")");

		//return ( $('input[name=' + name + ']', parent.document).val() );
		return (this.getParentVarByName(name));
	},

	instance: function () {
		this.log("EZ.instance()");

		return (this.instanceid);
	},

	loadRandoms: function () {
		this.log("EZ.loadRandoms()");

		try {
			this.randoms = [];

			//var sourceRandoms= $('#' + this.qid + '_rnd', parent.document).val();
			var sourceRandoms = this.getParentVarByID(this.qid + '_rnd');
			if (sourceRandoms != '') {
				if (sourceRandoms.substring(0, 3) == '%%1') {
					var input = sourceRandoms.substring(3);
					sourceRandoms = "";

					for (var i = 0; i < input.length; i++) {
						var ch = input.charAt(i);
						var ndx = this.ncr.indexOf(ch);
						if (ndx < 0) sourceRandoms += ch;
						else sourceRandoms += this.dcr.charAt(ndx);
					}
				}

				var randomArray = sourceRandoms.split(';');
				for (i = 0; i < randomArray.length; i++) {
					var thisVar = randomArray[i].split('=');
					if (thisVar.length == 2) {
						this.randoms.push({ name: thisVar[0], value: thisVar[1] });
					}
				}
			}
		}
		catch (e) {
			this.error("Error loading external random variables: " + e);
		};

		// Copy values to old global variables
		ez_randoms = this.randoms;

	},

	random: function (varname) {
		this.log("EZ.random(" + varname + ")");

		for (i = 0; i < this.randoms.length; i++) {
			var rv = this.randoms[i];
			if (rv.name == varname) return (rv.value);
		}
		return null;
	},

	randomSubstitutions: function () {
		this.log("EZ.randomSubstitutions()");

		// Dereference this.randoms so we can use it within $.each() below.
		var r = this.randoms;

		if (r.length == 0) return;

		$('.ez_random').each(function (ndex) {
			var content = $(this).html();
			if (content == null) return;
			if (content.length == 0) return;

			//EZ.log("ez_random " + ndex + " content before substitutions:");
			//EZ.log(content);

			var result = content;
			for (i = 0; i < r.length; i++) {
				var rv = r[i];
				var name = rv.name;
				var value = rv.value;
				result = result.split('\[' + name + '\]').join(value);
			}
			$(this).html(result);

			//EZ.log("ez_random " + ndex + " content after substitutions:");
			//EZ.log(result);
		});
	},

	loadMediaReferences: function () {
		this.log("EZ.loadMediaReferences()");

		try {
			this.mediaUrls = [];

			//var sourceMedia= $('#' + this.qid + '_media', parent.document).val();
			var sourceMedia = this.getParentVarByID(this.qid + '_media');

			if (sourceMedia != '') {
				var mediaArray = sourceMedia.split(',');
				if (mediaArray.length > 1) {
					this.mediaBase = mediaArray[0];
					for (i = 1; i < mediaArray.length; i++)
						this.mediaUrls.push(mediaArray[i]);
				}
			}
		}
		catch (e) {
			this.error("Error loading external media references: " + e);
		};

		// Copy values to old global variables
		ez_mediaurls = this.mediaUrls;
		ez_mediabase = this.mediaBase;
	},

	media: function (mediaName) {
		this.log("EZ.media(" + mediaName + ")");

		return this.mediaBase + mediaName;
	},

	save: function () {
		this.log("EZ.save()");

		try {
			if (this.toolserver) {
				this.saveToolInstance();
			} else {
				if (parent.ex_trigger_save) {
					parent.ex_trigger_save(this.mode, this.id);
				} else {
					this.log("EZ.save() - no ex_trigger_save in parent");
				}
			}
		}
		catch (err) {
			this.log("EZ.save() - exception " + err);
		}

		return;
	},

	saveToolInstance: function () {
		this.log("EZ.saveToolInstance()");
		try {
			if (ez_mode === 'test') {
				var currentTime = new Date().getTime(),
					previousCallTime = this.toolStateJSON.timestamp,
					elapsedTime = previousCallTime ? ((currentTime - this.toolStateJSON.timestamp) / 1000) : 0,
					thisToolObject = this;

				if (!previousCallTime || elapsedTime > this.toolsavethrottle) {
					var currentState = getState(),
						completion = getValidatedCompletion(currentState);

					if (this.toolStateJSON.state !== currentState || this.toolStateJSON.completion !== completion) {
						this.toolStateJSON.timestamp = currentTime;
						this.toolStateJSON.state = currentState;
						this.toolStateJSON.score = getScore();
						this.toolStateJSON.completion = completion;
						this.isApiCallQueued = false;
						if (parent.ex_trigger_geteaid) {
							var eaid = parent.ex_trigger_geteaid();
							if (eaid != '') {
								this.toolStateJSON.eaid = eaid;
							}
						}

						$.ajax({
							type: "POST",
							async: true,
							url: this.toolserver + "/api/tool/v1/putStateJSON",
							data: JSON.stringify(this.toolStateJSON),
							contentType: 'application/json',
							dataType: 'json',
							success: function (response) {
								console.log(response);
								if (typeof response.eaid != 'undefined') {
									if (parent.ex_trigger_seteaid) {
										parent.ex_trigger_seteaid(response.eaid);
									}
								}
							},
							error: function (xhr) {
								alert("There was an error saving this question. Reopen assignment to continue.\nSupport link: http://mpss.mhhe.com/contact.php");
								thisToolObject.toolStateJSON.timestamp = previousCallTime;
							}
						});
					}
				} else if (!this.isApiCallQueued && elapsedTime) {
					this.isApiCallQueued = true;
					var timeLeftToCallApi = (this.toolsavethrottle - elapsedTime) * 1000;
					setTimeout(function () {
						thisToolObject.saveToolInstance();
					}, timeLeftToCallApi);
				}
			}
		} catch (err) {
			this.log("EZ.saveToolInstance() - exception " + err);
		}
	},

	contactPublisher: function (message) {
		this.log("EZ.contactPublisher()");

		try {
			if (parent.ex_trigger_contact)
				parent.ex_trigger_contact(this.mode, this.qid, message);
			else
				this.log("EZ.contactPublisher() - no ex_trigger_contact in parent");
		}
		catch (err) {
			this.log("EZ.contactPublisher() - exception " + err);
		}

		return;
	}

};


$(document).ready(function () {
	console.log('Document is ready.');
	window.setTimeout("EZ.init();", 1000);
});


/*
** Old global functions. These are deprecated in favor of the
** scoped class methods (ie. EZ.resize(w,h) instead of ez_resize(w,h).
*/

function ez_resize(width, height) {
	EZ.resize(width, height);
}

function ez_policy(name) {
	return EZ.policy(name);
}

function ez_random(varname) {
	return EZ.random(varname);
}

function ez_media(medianame) {
	return EZ.media(medianame);
}

function getValidatedCompletion(state) {
	var completion = "";
	if (typeof getCompletion === "function") {
		try {
			completion = getCompletion(state);
		} catch (completionErr) {
			EZ.log("error occurred during getCompletion()");
			completion = "error";
		}
		if (completion === "exhausted") {
			EZ.log("getCompletion() returned exhausted");
		} else if (isNaN(completion)) {
			EZ.log("getCompletion() returned NaN");
			completion = "NaN (" + completion + ")";
		} else if (completion < 0 || completion > 100) {
			EZ.log("getCompletion() returned OOB");
			completion = "OOB (" + completion + ")";
		}
	} else {
		EZ.log("getCompletion() not implemented");
		completion = "n/a";
	}
	return completion;
}