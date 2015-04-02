/**
 ** Input: generated poem text as a string, with pid number of appropriate parent specified in the request
 ** Input will be inside post data : req.body
 ** Input will structured as a JSON with pid(parentId, generatedText, metadata)
 ** Output: http status code 200 if successful, if input is wrong send 400, if server messes up, send 500
 ** Used to send a newly read poem to the backend to be added to the tree, processed in realtime locally and later processed offline globally
 **/
exports.onNewPoemGenerated = function(req,res) {}