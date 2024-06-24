const tool_base_url = window.location.href.substr(0, window.location.href.lastIndexOf('/'));
const tinymce_plugins_base_url = tool_base_url + "/assets/tinymce-ext-plugins/";

const externalJsFiles = {
  'design': {
    tinymce: 'https://dle-cdn.mheducation.com/mhe/tinymce/4.10.0-beta/tinymce.min.js',
    tinyMCE_Ext_Plugins: tinymce_plugins_base_url + 'specialCharMap.js',
    backwardCompFile1: tool_base_url + '/assets/v2StateFiles/newauthData_validator.js',
    backwardCompFile2: tool_base_url + '/assets/v2StateFiles/olddata_validator.js'
  }
};

export default externalJsFiles;
