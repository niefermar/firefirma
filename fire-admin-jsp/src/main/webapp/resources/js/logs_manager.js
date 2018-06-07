/**
 * 
 */
 $(document).ready(function(){

	
   $( function() {
     $( "#startDate" ).datepicker({
       changeMonth: true,
       changeYear: true
     });
     $('#startTime').timepicker();
     
     $( "#search_StartDate" ).datepicker({
         changeMonth: true,
         changeYear: true
       });
       $('#search_StartTime').timepicker();
     
     $( "#endDate" ).datepicker({
         changeMonth: true,
         changeYear: true
       });
       $('#endTime').timepicker();
   } );

   $(window).on('beforeunload', function() {
		 
		 if(!isReset){
			  closeFile();
			  return '';			
		 }
		 return "salir sin cerrar";
		});

 
   
  });//fin de document ready
 
 /**Constantes*/
	
	var maxLines = 100;
	var points = "<div>. . . . . . . . . .</div><div>. . . . . . . . . .</div><div>. . . . . . . . . .</div>";
	
/**Variables Globales */	
	
	var isReset = false;
	var addResult = false;
	var isFinal = false;
	
	var filterOp = 0;
	var searchOp = 0;
	
	var text2Search = "";
	var date2Search = 0;
	
	var initDate2Filter = 0;
	var endDate2Filter = 0;
	var level2Filter = 0;
	
	var linesCount = 0;
	var diffLines = 0;
	var next_position = searchOp;
	var scrollTopPosition = 0;
	var scrollLefPosition = 0;
	var  oper = "";
	/** Elementos del DOM (id) utilizados en las funciones*/
	var idContainer = "";
	var idScrollElement = "";
	var idErrorTxtLog = "";
	var idOkTxtLog = "";
	var idAdvice = "";
	var idProgress = "progress_download";

	 
 /*****************Funciones:******************************/
 
 /**
  * 
  * @returns
  */
 function printErrorResult(JSONData){
	var html = "";
	$("#" + idErrorTxtLog).html(html);
	$("#" + idOkTxtLog).html(html); 
	$("#" + idOkTxtLog).hide();
	html = JSONData.Error[0].Message;
	$("#" + idErrorTxtLog).append(html);
	$("#" + idErrorTxtLog).css('display:inline-block');
	$("#" + idErrorTxtLog).show();
	 
 }
 
 function printOkResult(JSONData){
		var html = "";
		$("#" + idErrorTxtLog).html(html);
		$("#" + idErrorTxtLog).hide();
		$("#" + idOkTxtLog).html(html);
		html = JSONData.Ok[0].Message;
		$("#" + idOkTxtLog).append(html);
		$("#" + idOkTxtLog).css('display:inline-block');
		$("#" + idOkTxtLog).show();
		 
	 }
 
 function displayProgressBar(display){	 
	 if (display == 1){		
		$("#" + idProgress).css('display:inline-block');
		$("#" + idProgress).show();
		$("#btnContainer").hide(); 
		$("#selectedFile").hide();
	 }
	 else if(display == 0){		
		$("#" + idProgress).css('display:none');
		$("#" + idProgress).hide();
		$("#btnContainer").show(); 
		$("#selectedFile").show();

	 }			
	
 }
 
 /**
  * 
  * @param JSONData
  * @returns
  */
 function printResult(JSONData, nlines){
	var moreWithSearch = false;
	 var data = "";
	 var content = getResultLines(nlines);

	 $("#" + idContainer ).html("");
	 $("#" + idErrorTxtLog).hide();
	 $("#" + idOkTxtLog).hide();
	 $("#" + idAdvice).hide();
	 
	 if(JSONData.hasOwnProperty('Tail')){		 
		 data = JSONData.Tail[0].Result;		
		 content = "";
		 oper = "Tail";
	
	 }
	 else if(JSONData.hasOwnProperty('More')){
		 data = JSONData.More[0].Result;
		 if(oper === "Search"){
			 moreWithSearch = true;
		 }
		 oper = "More";	 	
	 }
	 else if(JSONData.hasOwnProperty('Search')){
		 oper = "Search";
		 data = JSONData.Search[0].Result;
			 
		 if(!addResult){
			 content = ""; 
		 }
		 if (content !== ""){
			 content += points; 
		 }
	 }
	 else if(JSONData.hasOwnProperty('Filtered')){
		 oper = "Filtered";
		 data = JSONData.Filtered[0].Result;
		 if(!addResult){
			 content = ""; 
		 }	 
	 }
		
	var arrHtml = data.split("</br>");
	for (i = 0; i < arrHtml.length-1; i++) { 
	/*En el caso de ser la busqueda se selecciona el texto a buscar */
		if (oper === "Search" || moreWithSearch){
			var line = "<div>" + arrHtml[i] + "</div>";
			line = line.replace (text2Search,"<span class='highlight'>" + text2Search + "</span>");
			content += line;		
		}
		else{
			content += "<div>" + arrHtml[i] + "</div>"; 
		}	
	}


	 $("#"+ idContainer).append(content);	 
	 
	 $('#'+idScrollElement).scrollTop(scrollTopPosition);
	 $('#'+idScrollElement).scrollLeft(scrollLefPosition);
  }
 /**
  * 
  * @param nlines
  * @returns
  */
 function getTail(nlines){

	 	var arrFields = ["Nlines"];

	 	var ok = validateFields(arrFields);						
		if(ok){
			 activeElement("more-button", true);
			 var url = "../LogAdminService?op=6&nlines="+nlines+"&fname="+$("#fileName").text();
			 $.post(url, function(data){		
				 var JSONData = JSON.parse(data);
				  if(JSONData.hasOwnProperty('Tail')){
					  printResult(JSONData, nlines);  
				  }
				   else{
					   printErrorResult(JSONData);  
				   }  
				  addResult=false;
			}); 
		}
 }
 
 /**
  * 
  * @param nlines
  * @returns
  */
 function getMore(nlines){

	var arrFields = ["Nlines"];
	var ok = validateFields(arrFields);						
	if(ok){
		 var url = "../LogAdminService?op=7&nlines="+nlines+"&fname="+$("#fileName").text();
		 $.post(url, function(data){		
			 var JSONData = JSON.parse(data);
			  if(JSONData.hasOwnProperty('More')){
				  printResult(JSONData, nlines);			
			  }
			   else {			   
				   printErrorResult(JSONData);  
			   }      	            
		}); 
	}
	
 }

 /**
  * @param nlines
  * @param text
  * @param date
  * @returns
  */
 function searchText(nlines, text, date){
	var param_reset = "";
	var DateTime =  getlongDateTime(date);
	
	var arrFields = ["search_txt"];
	filterOp = 0;
	var ok = validateFields(arrFields);						
	if(ok){
		 activeElement("more-button", true);
		
		 if(searchOp == 0){
			 addResult  = false;
		 }
		 else{
			 addResult  = true; 
		 }
					 
		 if (text2Search !== text || date2Search != DateTime){
			 addResult  = false;
			 text2Search = text;
			 date2Search = DateTime;
			 isFinal = true;			 			 
			 linesCount = 0;							
			 filterOp = 0;
			 searchOp = 0;				
			 diffLines = 0;
			 next_position = searchOp;
			 scrollTopPosition = 0;
			 scrollLefPosition = 0;
			 param_reset = "&reset=yes";
		 }	
		 var url = "../LogAdminService?op=8&nlines=" + nlines + "&search_txt=" + text + "&search_date=" + DateTime + param_reset;

		 if(isFinal || searchOp == 0){ 
			 $.post(url, function(data,status){		
				  var JSONData = JSON.parse(data);
							 
				  if(JSONData.hasOwnProperty('Search')){
					console.log("Print Search ");
				  	printResult(JSONData, nlines);
				  	searchOp = 0;
				  	isFinal = markNextText(text);
				  	
				  }
				   else {
					   if(JSONData.hasOwnProperty('Error')){
						 	printErrorResult(JSONData);  
					   }			
				  }			  
			});
			 
		 }
		 else if ( !isFinal && searchOp > 0){
				isFinal = markNextText(text);
		 }
		 		 	
	}
	
 }
 
 /**
  * 
  * @param nlines
  * @param startDate
  * @param endDate
  * @param level
  * @returns
  */
 function getFiltered(nlines, startDate, endDate, level){
	 var param_reset = "";
	 var startDateTime =  getlongDateTime(startDate);
	 var endDateTime =  getlongDateTime(endDate);
	 var arrFields = ["Nlines","level_select"];
	 var ok = validateFields(arrFields);						
	if(ok){	
		searchOp = 0;
		activeElement("more-button", false);
		if(filterOp == 0){
			 addResult  = false;			
		 }
		 else{
			 addResult  = true; 
		 }
		
		console.log("startDate :"+startDate + " endDate :"+endDate+ " level:"+level);
		
		 if (initDate2Filter !== startDateTime || 
			 endDate2Filter != endDateTime || 
			 level2Filter !== level){
			 
			addResult  = false;
			initDate2Filter = startDateTime;
			endDate2Filter = endDateTime;
			level2Filter = level;
				 			 
			linesCount = 0;							
			filterOp = 0;
			searchOp = 0;				
			diffLines = 0;
			next_position = searchOp;
			scrollTopPosition = 0;
			scrollLefPosition = 0;
			param_reset = "&reset=yes";
			console.log("param_reset "+param_reset);
		 }	
		
		
		filterOp = filterOp + 1;		
		var url = "../LogAdminService?op=9&nlines=" + nlines + "&start_date=" + startDateTime + "&end_date=" + endDateTime + "&level=" + level + param_reset;		 
		 $.post(url, function(data){		
			 var JSONData = JSON.parse(data);
			  if(JSONData.hasOwnProperty('Filtered')){
			  	printResult(JSONData,nlines);  
			  }
			   else {
			   	printErrorResult(JSONData);  
			  }      	            
		});  
	} 	 	
	 
 }
 
 
 /**
  * funcion que devuelve objeto fecha (Date), respecto de los datos de entrada (date) con formato (dd/mm/yyyy HH:mm:ss)
  * @param date
  * @returns
  */
 function getlongDateTime(date){
	 var result = -1;

	 var day = date.substr (0,2);
	 var month = date.substr (3,2);
	 var year = date.substr(6,4);

	 var hour = date.substr(11,2);
	 var minute = date.substr(14,2);
	 var seconds = date.substr(17,2);
	 var millisec = "000";
	 
	 var DateTime =  new Date();
	 if(day != null && typeof day != "undefined"
		 	&& month != null && typeof month != "undefined"
			&& year != null && typeof year != "undefined"){
		 DateTime.setFullYear(year, month - 1, day);
	 }		 		 		 
	 if(!isNaN(DateTime.getTime())){
		 if(hour != null && typeof hour != "undefined" && hour != ""){
			 DateTime.setHours(hour); 
		 }
		 else{
			 DateTime.setHours("00"); 
		 }
		 if(minute != null && typeof minute != "undefined" && minute != ""){
			 DateTime.setMinutes(minute); 
		 }
		 else{
			 DateTime.setMinutes("00"); 
		 }
		 if(seconds != null && typeof seconds != "undefined" && seconds != ""){
			 DateTime.setSeconds(seconds); 
		 }
		 else{
			 DateTime.setSeconds("00");  
		 }
		 DateTime.setMilliseconds(millisec);
		 
		 result = DateTime.getTime();			
	 }
	 return result;
	
 }
 
 /**
  * Función de validación
  * @param fields
  * @returns
  */
 function validateFields(fields){
	 
	 $("label").each(function( index ) {
			if (this.style.color = "red") {				
			      this.style.color = "#000000";
			      var idInput = $(this).attr('for');
			      $('#'+idInput).css({backgroundColor:'#FFFFFF'});
			    } 
		});
	 var ok = true;
	 var msg = "";
	 
	 for ( i = 0; i < fields.length; i++ ){
	
		switch(String(fields[i])){
		case "Nlines":
			if($("#Nlines").val() == "0"){								
				$('label[for=Nlines]').css({color:'red'});
				$('#Nlines').css({backgroundColor:'#fcc'});
				msg = msg + "Debe introducir un número mayor de 0 líneas\n";
				ok = false;			
			}		
			break;
		case "search_txt":
			if($("#search_txt").val() == ""){								
				$('label[for=search_txt]').css({color:'red'});
				$('#search_txt').css({backgroundColor:'#fcc'});
				msg = msg + "Debe introducir un texto para realizar la búsqueda.";
				ok = false;			
			}		
			break;		
		case "level_select":
			if($("#level_select").val() == ""){								
				$('label[for=level_select]').css({color:'red'});
				$('#level_select').css({backgroundColor:'#fcc'});
				msg = msg + "Debe introducir un nivel de log para filtrar.";
				ok = false;			
			}
			break;
		}
	 }
	 
	if(!ok){
		alert(msg);
	}	
	 
	 return ok;  	 
 }
 
 /**
  * 
  * @returns
  */
 function download(){
	 
	 var url = "../LogAdminService?op=10&fname=" + file + "&reset=yes";
	 //var progressBar = document.getElementById("progress");
	 displayProgressBar(1);
	 /*Este codigo funciona*/
	 var xhr = new XMLHttpRequest();
	 xhr.open("POST", url, true);
	 xhr.responseType = "arraybuffer";
	 xhr.onload = function () {
		 var filename = "";
	     var disposition = xhr.getResponseHeader('Content-Disposition');
	     if (disposition && disposition.indexOf('attachment') !== -1) {
	         var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
	         var matches = filenameRegex.exec(disposition);
	         if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
	     }
	         var type = xhr.getResponseHeader('Content-Type');
	         var blob = typeof File === 'function'
	             ? new File([this.response], filename, { type: type })
	             : new Blob([this.response], { type: type });
	         if (typeof window.navigator.msSaveBlob !== 'undefined') {
	             // IE workaround for "HTML7007: One or more blob URLs were revoked by closing 
	        	 //the blob for which they were created. These URLs will no longer resolve as the data backing the URL has been freed."
	             window.navigator.msSaveBlob(blob, filename);
	         } else {
	             var URL = window.URL || window.webkitURL;
	             var downloadUrl = URL.createObjectURL(blob);
	
	             if (filename) {
	                 // use HTML5 a[download] attribute to specify filename
	                 var a = document.createElement("a");
	                 // safari doesn't support this yet
	                 if (typeof a.download === 'undefined') {
	                     window.location = downloadUrl;
	                 } else {
	                     a.href = downloadUrl;
	                     a.download = filename;
	                     document.body.appendChild(a);
	                     a.click();
	                 }
	             } else {
	                 window.location = downloadUrl;
	             }
	         }	       
	         
	     // La respuesta es de otro tipo, Json por ejemplo
//         else{
//         }

	 };
//	 xhr.onprogress = function(e) {
//	     if (e.lengthComputable) {
//	         progressBar.max = e.total;
//	         progressBar.value = e.loaded;	         	               	         
//	     }
//	 };
//	 xhr.onloadstart = function(e) {
	    //progressBar.value = 0;
//		 printProgressBar();
//	 };
	 xhr.onloadend = function(e) {
		 displayProgressBar(0);
	 };
	
	xhr.send();  
	
	 	 	
	 //location.href = url;
 }
 
 /**
  * 
  * @returns
  */
 function goReturn(){	
	 location.href = 'LogsFileList.jsp?name-srv=' + server;	  
 }
 


 
 /**
  * 
  * @returns
  */
 function reset(){
	 
	linesCount = 0;
	isReset = false;
	addResult = false;
	filterOp = 0;
	searchOp = 0;
	text2Search = "";
	diffLines = 0;
	next_position = searchOp;
	scrollTopPosition = 0;
	scrollLefPosition = 0;
	 	
	 var html = "";
	 $("#" + idErrorTxtLog).html(html);
	 $("#" + idErrorTxtLog).hide();
	 $("#" + idOkTxtLog).html(html); 
	 $("#" + idOkTxtLog).hide();
	 activeElement("more-button", true);
				 
	 var url = "../LogAdminService?op=5";
	 $.post(url,function(data){	
	 if(data != null && typeof(data) != "undefined"){
		 var JSONData = JSON.parse(data);
		   if(JSONData.hasOwnProperty('Error')){
			   printErrorResult(JSONData);
			   isReset = false;
		   }
		   else{			   	  
			   $("#" + idContainer).html("");
			   var urlOpen = "../LogAdminService?op=4&fname=" + file + "&name-srv=" + server + "&reset=yes";			   		 
			   $.post(urlOpen,function(dat){	
				   if(dat != null && typeof(dat) != "undefined"){
					   isReset = true;
					   $("#" + idAdvice).show();
				   }
			   });			  
		   }
	 }   	             		   
   });
 }
 
 
 /**
  * Funcion que borra el contenido de los filtros del contenedor indicado
  * @returns
  */
 function Clean(css_class){

	 $("." + css_class).each(function() {
	    var type = this.type;	   
	    if (type == 'checkbox' || type == 'radio'){
	    	this.checked = false;   	
	    }
	    else {
	    	this.value = "";	    	
	    }   
	  });
	 
//	 $("select").each(function() {		   
//		 this.selectedIndex = 0;   			    		  	    
//	 }); 
 }
 
 function closeFile(){
	 
	 var url = "../LogAdminService?op=5";
	 $.post(url,function(data){	
		 if(data != null && typeof(data) != "undefined"){
			 var JSONData = JSON.parse(data);
			 if(JSONData.hasOwnProperty('Error')){
				 printErrorResult(JSONData); 
				 
			 }
		}
			    	             		   
	});
		
 }
 
 /**
  * 
  * @param newLines
  * @returns
  */
 function getResultLines(newLines){
	 var contSpan = 0;
	 var resultLines = "";	
	 if(parseInt(linesCount, 10) + parseInt(newLines, 10) <= parseInt(maxLines,10)){
		 resultLines +=  $("#" + idContainer).html();			
	 }
	 else{
		 diffLines = (parseInt(linesCount, 10) + parseInt(newLines, 10)) - parseInt(maxLines,10);	
		 var diff = diffLines;
		 $("#" + idContainer + " > div").each(function () { 			 
			 if(diff != 0){
				 contSpan += $(this).children("span").length;
				 diff --;				
			 }
			 else{					 
				 resultLines += "<div>" + $(this).html() + "</div>"; 			
			 }
		 });		
	 }
	 linesCount = (parseInt(linesCount, 10) + parseInt(newLines, 10))-parseInt(diffLines, 10);
	 console.log(" contSpan: "+contSpan)
	 next_position = next_position - contSpan;
	 return resultLines;
 }
 
 /**
  * 
  * @param search_text Texto a buscar
  * @returns
  */
 function markNextText(search_text){
	 var result = false;	
	 var allSpans = $("pre > div > span");
	 var elementTopPos;
	 var elementLeftPos;
	 
	 console.log("seleccion next_position : " + next_position );
	 if(allSpans.length == 0){
		 return result;
	 }
	 
	 
	 allSpans.each(function(id){
		 if(id == next_position ){
			 elementTopPos = $(this).offset().top;
			 elementLeftPos = $(this).offset().left;
			 $(this).removeClass("highlight").addClass("nextHighLight"); 
		 }
		 else if(id == next_position - 1 && next_position - 1 >= 0 ){
			$(this).removeClass("nextHighLight").addClass("highlight"); 	 
		 }
			 		
	 });
	 searchOp = searchOp + 1; 
	 next_position = next_position + 1;
	 
	 var containerTopPos = $("#"+ idContainer ).offset().top;
	 var containerLeftPos = $("#"+ idContainer ).offset().left;
	
	 var width = $('#'+idScrollElement).width();
	 var movTop = (elementTopPos - containerTopPos);
	 var movLeft = (elementLeftPos - containerLeftPos);
	 
	 $('#'+idScrollElement).scrollTop(movTop);
	 setScrollTopPosition($('#'+idScrollElement).scrollTop());
	 
	 if(elementLeftPos > (width + containerLeftPos)){
		 $('#'+idScrollElement).scrollLeft(elementLeftPos - containerLeftPos);
	 }
	 else if(elementLeftPos < (width + containerLeftPos)){
		 $('#'+idScrollElement).scrollLeft(0);
	 }
	 setScrollLeftPosition($('#'+idScrollElement).scrollLeft());
//	 console.log("Movimiento de  seleccion: scrollTopPosition : " + scrollTopPosition + " scrollLefPosition:" + scrollLefPosition);
	 if(allSpans.length == next_position){ //==
		 console.log("allSpans.length: "+allSpans.length+ " next_position="+next_position);
		 result = true;
	 }	  
	 return result;
	 
 }
 
 /**
  * Funci&oacute;n que habilita y deshabilita el elemento indicado con el id
  * @param idElement id del elemento.
  * @param switchOn boolean true,false
  * @returns
  */
 function activeElement(idElement, switchOn){
	 if(switchOn){//activar
		$("#"+idElement).removeClass("btn-log_inactive").addClass("btn-log"); 
		$("#"+idElement).prop('disabled', false);
	 }
	 else{//desactivar
		 $("#"+idElement).removeClass("btn-log").addClass("btn-log_inactive"); 
		 $("#"+idElement).prop('disabled', true);
	 }
 }
 
 
 /*******Inicializar variables globales  *****/
 
 function setLinesCount(numLines){
	 linesCount = parseInt(numLines, 10);
 }

 function setIsReset (bool){
	isReset = (bool === 'true');	
 }

 function setAddResult (bool){
	 addResult = (bool === 'true');
 }
	
 function setFilterOp(intNum){
	 filterOp = parseInt(intNum, 10);
 }
	
 function setSearchOp(intNum){
	 searchOp = parseInt(intNum, 10);
 }

 function setText2Search(txt){
	 text2Search = txt; 
 }

 function setDiffLines(intNum){
	 diffLines = parseInt(intNum, 10);
 }

 function setScrollTopPosition(num){
	 scrollTopPosition = parseFloat(num);
 }
 
 function setScrollLeftPosition(num){
	 scrollTopPosition = parseFloat(num);
 }	
	
 function setIdContainer (id){
	 idContainer = id;
 }
 
 function setIdScrollElement (id){
	 idScrollElement = id;
 }
 
 function setIdErrorTxtLog (id){
	 idErrorTxtLog = id;
 }
 
 function setIdOkTxtLog (id){
	 idOkTxtLog = id;
 }
 
 function setIdAdvice(id){
	 idAdvice = id;
 }
 
 function setIdProgrees(id){
	 idProgress = id;
 }