// Filename: login.js


define([
    'module', 'jquery', 'zoo','notify', 'metisMenu', 'summernote', 'xml2json','typeahead', 'adminBasic', 'ol','datasources','mmDataTables','rowReorder','colorpicker','slider',"sortable","colReorder","managerTools"
], function(module, $,Zoo,notify, metisMenu, summernote, X2JS,typeahead,adminBasic,ol,datasources,MMDataTable,rowReorder,colorpicker,slider,sortable,colReorder,managerTools) {
    

    (function(){
	var methods = ['addClass', 'removeClass'];
	
	$.each(methods, function (index, method) {
	    var originalMethod = $.fn[method];
	    
	    $.fn[method] = function () {
		var oldClass = this.className;
		var result = originalMethod.apply(this, arguments);
		var newClass = this.className;
		this.trigger(method, [oldClass, newClass]);	    
		return result;
	    };
	});
	
    })();

    var _x2js = new X2JS({
        arrayAccessFormPaths: [
            'ProcessDescriptions.ProcessDescription.DataInputs.Input',
            'ProcessDescriptions.ProcessDescription.DataInputs.Input.ComplexData.Supported.Format',
            'ProcessDescriptions.ProcessDescription.ProcessOutputs.Output',
            'ProcessDescriptions.ProcessDescription.ProcessOutputs.Output.ComplexOutput.Supported.Format',
            'Capabilities.ServiceIdentification.Keywords'
        ],   
    });
    
    var zoo = new Zoo({
        url: module.config().url,
        delay: module.config().delay,
	language: module.config().language
    });

    var llevels=["first","second","third","forth"];
    var llevelInit=false;
    var reg0=new RegExp("documents_","");
    var reloadElement=true;
    var tableName="indicators";
    var fileName="";

    function loadElements(table,init){
	zoo.execute({
	    identifier: "np.list",
	    type: "POST",
	    dataInputs: [
		{"identifier": "table","value": table,"dataType":"string"}
	    ],
	    dataOutputs: [
		{"identifier":"Result","type":"raw"},
	    ],
	    success: function(data){
		if(!reloadElement)
		    return;
		if(init){
		    if($("#listElements").find("#document_"+localId).length){
			console.log($("#listElements").find("#document_"+localId).hasClass("selected"));
			if(!$("#listElements").find("#document_"+localId).hasClass("selected"))
			    $("#listElements").find("#document_"+localId).click();
			else{
			    for(var i=0;i<2;i++)
				$("#listElements").find("#document_"+localId).click();
			}
		    }else{
			loadAnElement(localId);
		    }
		}
		else
		    for(var i=0;i<data.length;i++){
			if(data[i]["selected"]){
			    if($("#listElements").find("#document_"+data[i]["id"]).length){
				$("#listElements").find("#document_"+data[i]["id"]).click();
			    }else{
				loadAnElement(data[i]["id"]);
			    }
			    break;
			}
		    }
	    },
	    error: function(data){
		$(".notifications").notify({
		    message: { text: data["ExceptionReport"]["Exception"]["ExceptionText"].toString() },
		    type: 'danger',
		}).show();
	    }
	});
    }

    function fileUrlSelection(data){
	$("input#file").val("");
	if(data["url"]==null){
	    $("input[name=doct]").first().prop("checked",true);
	    $("input[name=doct]").first().click();
	    $("#documents_file_link").attr("href",module.config().publicationUrl+"/documents/"+data["file"]);
	    $("#documents_file_link").html(data["file"]);
	}
	else{
	    $("input[name=doct]").last().prop("checked",true);
	    $("input[name=doct]").last().click();
	    $("#documents_file_link").attr("href","");
	    $("#documents_file_link").html("");
	}
    }

    function fillForm(data){
	$(".project-title").html(data["name"]+' <i class="fa fa-'+(data["published"]=="false"?"exclamation":"check")+'"> </i>');
	var myRootLocation=$(".theForm");
	var reg=new RegExp("documents_","");

	myRootLocation.find("textarea").each(function(){
	    if(!$(this).attr("id"))
		return;
	    if($(this).attr("id").replace(reg,"")=="description"){
		$(this).code(data[$(this).attr("id").replace(reg,"")]);
	    }
	    else
		$(this).val(data[$(this).attr("id").replace(reg,"")]).change();
	});

	myRootLocation.find("input[type=text],select").each(function(){
	    
	    if(!$(this).attr("id"))
		return;
	    if($(this).attr("type")=="text"){
		if($(this).attr("id").replace(/color/g,"")!=$(this).attr("id")){
		    if(data[$(this).attr("id").replace(reg,"")])
			$(this).val("#"+data[$(this).attr("id").replace(reg,"")]).change();
		    else
			$(this).val("#000").change();
		}
		else
		    $(this).val(data[$(this).attr("id").replace(reg,"")])
	    }else{
		$(this).find('option').prop('selected', false);
		if($.isArray(data[$(this).attr("id").replace(reg,"")])){
		    var obj=data[$(this).attr("id").replace(reg,"")];
		    var oid=$(this).attr("id").replace(reg,"");
		    if(obj.length==0)
			$(this).find('option[value="-1"]').prop("selected",true);
		    for(var i=0;i<obj.length;i++){
			$(this).find('option[value="'+obj[i]+'"]').prop("selected",true);
		    }
		}else{
		    $(this).val((data[$(this).attr("id").replace(reg,"")]!=null?data[$(this).attr("id").replace(reg,"")]:-1));
		    
		}
	    }
	});

    }

    function fillGraphForm(data){
	var myRootLocation=$("#indicators_form_pie-chart");
	var prefix="documents_graphs_";
	myRootLocation.find("input[type=text],input[type=hidden],select,textarea").each(function(){
	    if(!$(this).attr("id"))
		return;
	    var myReg=new RegExp(prefix,"g");
	    var cid=$(this).attr("id").replace(myReg,"");
	    console.log(cid);
	    if($(this).attr("type")=="text" || !$(this).attr("type") || $(this).attr("type")=="hidden"){
		if(cid.replace(/color/g,"")!=cid){
		    if(data[cid])
			$(this).val("#"+data[cid]).change();
		    else
			$(this).val("#000").change();
		}
		else
		    $(this).val(data[cid])
	    }else{
		$(this).find('option').prop('selected', false);
		if($.isArray(data[cid])){
		    var obj=data[cid];
		    var oid=cid;
		    if(obj.length==0)
			$(this).find('option[value="-1"]').prop("selected",true);
		    for(var i=0;i<obj.length;i++){
			$(this).find('option[value="'+obj[i]+'"]').prop("selected",true);
		    }
		}else{
		    $(this).val((data[cid]!=null?data[cid]:-1));
		    
		}
	    }
	});
    }

    function fillDefaultRepport(data){
	var myRootLocation=$("#indicators_form_file-text-o");
	var lines="";
	var freg=new RegExp("\\[content\\]","g");
	var regs=[
	    new RegExp("\\[x\\]","g"),
	    new RegExp("\\[name\\]","g")
	];
	var tmpl=$("#document_settings_line_template")[0].innerHTML;
	for(var i=0;i<data.length;i++){
	    lines+=tmpl.replace(regs[0],i).replace(regs[1],data[i]);
	}
	var content=$("#document_settings_container_template")[0].innerHTML.replace(freg,lines);
	$("#documents_repport_editor").html(content);
	var defaultTypes={
	    "map": 1,
	    "table": 3,
	    "diag": 4
	};
	var noOptionTypes=[
	    "1","2","5","6","7"
	];
	$("#documents_repport_editor").find("table").find("select").each(function(){
	    if(defaultTypes[$(this).parent().prev().find('input').val()]){
		$(this).val(defaultTypes[$(this).parent().prev().find('input').val()]);
		$(this).prop("disabled",true);
		$(this).parent().prev().prev().find('input').prop("disabled",true);
		$(this).parent().next().find('textarea').hide();
	    }else{
		$(this).change(function(){
		    if($.inArray($(this).val(),noOptionTypes)>=0)
			$(this).parent().next().find("textarea").hide();
		    else
			$(this).parent().next().find("textarea").show();
		});
	    }
	});
	$("#documents_repport_editor").find("table").DataTable({
	    "bPaginate": false,
	    "bFilter": false,
	    "bInfo": false,
	    "bAutoWidth": false,
	    "scrollY":  ($(window).height()/2)+"px",
	});
	$("[data-mmaction=save-doc]").click(function(){
	    saveRepport();	    
	});

    }

    function fillRepport(data){
	for(var i=0;i<data.length;i++){
	    for(var a in data[i]){
		if($("#rtable_"+a+"_"+i).attr("type")!="checkbox")
		    $("#rtable_"+a+"_"+i).val(data[i][a]);
		else
		    $("#rtable_"+a+"_"+i).prop("checked",data[i][a]);
	    }
	}
    }
    
    function saveRepport(){
	var params=[
	    {identifier: "id", value: localId, dataType: "sring"}
	];
	if(arguments.length>0)
	    params.push({name: "tid", value: $("#p_tname").val(), dataType: "sring"});
	$("#repport_display2").find("input[type=checkbox]").each(function(){
	    var tmp=($(this).attr("id")+"").split('_');
	    var params0={identifier: "tuple", value:'{"id":'+tmp[tmp.length-1]+',"display":"'+$(this).is(":checked")+'","var":"'+$("#rtable_name_"+tmp[tmp.length-1]).val()+'","type":'+$("#rtable_type_"+tmp[tmp.length-1]).val()+',"value":"'+ $("#rtable_value_"+tmp[tmp.length-1]).val()+'"}',mimeType: "application/json"};
	    var obj={
		"id":tmp[tmp.length-1],
		"display":$(this).is(":checked")+"",
		"var":$("#rtable_name_"+tmp[tmp.length-1]).val(),
		"type":$("#rtable_type_"+tmp[tmp.length-1]).val(),
		"value":$("#rtable_value_"+tmp[tmp.length-1]).val()
	    };
	    params.push({identifier: "tuple", value:JSON.stringify(obj, null, ' '),mimeType: "application/json"});
	    
	});
	if($("#repport_steps").is(":visible") && $("#repport_step").val()>0){
	    params.push({identifier: "step", value: ($("#repport_step")[0].selectedIndex-1), dataType: "sring"});
	}    
	if($('#agregation').is(":visible") && $("#agregate_step")[0].selectedIndex-1>=0) {
	    params.push({identifier: "step", value: ($("#agregate_step")[0].selectedIndex-1), dataType: "sring"});
	}    
	callService("np.saveRepportSettings",params,function(data){
	    $(".notifications").notify({
		message: { text: data },
		type: 'success',
	    }).show();
	});
    }

    function loadAnElement(id){
	localId=id;
	//console.log("loadATheme -> "+id);
	$(".fa-spin").removeClass("hide");
	zoo.execute({
	    identifier: "np.details",
	    type: "POST",
	    dataInputs: [
		{"identifier": "table","value": tableName,"dataType":"string"},
		{"identifier": "id","value": id,"dataType":"string"}
	    ],
	    dataOutputs: [
		{"identifier":"Result","type":"raw"},
	    ],
	    success: function(data){
		fillForm(data);
		fileUrlSelection(data);
		$("#indicatorForm").find(".nav").find("li").first().trigger("click");
		if(data.it_id){
		    console.log(data["_style"]);
		    //managerTools.loadStyleDisplay(data["_style"]);
		    //bindClassifier(data["_style"]);
		    fetchIndexTableAndDisplay(data["_style"],function(d){
			var lcnt0=0;
			$("#layer_property_table_table_display_wrapper").find("table tbody").find("tr").each(function(){
			    var lcnt=0;
			    var fields=["pos","display","search","var","label","value","width"]
			    if(data["_table"]["fields"])
				$(this).find("td").each(function(){
				    if($(this).find("input").length){
					if($(this).find("input").attr("type")!="checkbox")
					    $(this).find("input").val(data["_table"]["fields"][lcnt0][fields[lcnt]]);
					else
					    $(this).find("input").prop("checked",data["_table"]["fields"][lcnt0][fields[lcnt]]);
				    }
				    if(lcnt==3){
					var tmp=$(this).children().first().html();
					$(this).html(data["_table"]["fields"][lcnt0][fields[lcnt]]+tmp);
				    }
				    lcnt+=1;
				});
			    lcnt0+=1;
			});
			if(data["_repport"]["docFields"]){
			    $("#documents_afile_link").attr("href",data["_repport"]["doc"]);
			    $("#documents_afile_link").attr("href",data["_repport"]["docUrl"]).text(data["_repport"]["docUrl"]);
			    fillDefaultRepport(data["_repport"]["docFields"]);
			    if(data["_repport"]["fields"])
				fillRepport(data["_repport"]["fields"]);
			}else{
			    
			}
			if(data["_table"]["id"]){
			    $("#documents_table_title").val(data["_table"]["title"]);
			    $("#documents_table_id").val(data["_table"]["id"]);
			}else{
			    $("#documents_table_title").val("");
			    $("#documents_table_id").val(-1);
			}
			    
			fillGraphForm(data["_graph"]);
		    });
		    $("#documents_indicators_table").val(data["indicators_territories"]).change();
		    console.log(data["query"]);
		    console.log(data["query"]);
		    console.log(data["query"]!=null);
		    console.log((data["query"]?"query":"file"));
		    //$("input[name=indicator_data_type]").val((data["query"]?"query":"file")).change();
		    $("input[name=indicator_data_type]").each(function(){
			console.log((data["query"]?"query":"file"));
			console.log($(this).val()==(data["query"]?"query":"file"));
			if($(this).val()==(data["query"]?"query":"file"))
			    $(this).trigger("click");
		    });
		    var fields=["query"];
		    for(var i=0;i<fields.length;i++)
			$("#documents_data_"+fields[i]).val(data[fields[i]]);
			    console.log($("#DS_indicatorTable_indicator"));
		    if(data["file_link"] && !data["query"]){
			$("#documents_ifile_link").attr("href",data["file_url"]).text(data["file_name"]);
			fetchInfoAndDisplay(data["file_link"]);
		    }else{
			if(data["query"])
			    runSql(true);
			else{
			    $("#DS_indicatorTable_indicator").remove();
			    $("#documents_ifile_link").attr('href','#').text('');
			}
		    }

		    var lcnt=0;
		    $("#indicatorForm").find('.nav').first().find('[role=presentation]').each(function(){
			if(lcnt>1){
			    $(this).removeClass("disabled");
			    $(this).prop("disabled",false);
			}
			lcnt+=1;
		    });

		}else{
		    console.log($("#DS_indicatorTable_indicator"));
		    $("#DS_indicatorTable_indicator").remove();
		    $("#documents_ifile_link").attr('href','#').text('');
		    var lcnt=0;
		    console.log($("#indicatorForm").find('.nav').first());
		    console.log($("#indicatorForm").find('.nav').first().find('[role=presentation]'));
		    $("#indicatorForm").find('.nav').first().find('[role=presentation]').each(function(){
			if(lcnt>1){
			    $(this).prop("disabled",true);
			    $(this).addClass("disabled");
			}
			lcnt+=1;
		    });
		}
		$(".fa-spin").addClass("hide");
	    },
	    error: function(data){
		$(".notifications").notify({
		    message: { text: data["ExceptionReport"]["Exception"]["ExceptionText"].toString() },
		    type: 'danger',
		}).show();
	    }
	});
    }

    function createJsonFromForm(form){
	var params={};
	form.find('textarea').each(function(){
	    if(!$(this).attr("id"))
		return;
	    var cid=$(this).attr('id').replace(reg0,"");
	    if(cid=="description")
		params[cid]=$(this).code();
	    else
		params[cid]=$(this).val();
	});
	form.find('input[type="text"]').each(function(){
	    if(!$(this).attr("id") || $(this).attr("id")=="indicators_keywords")
		return;
	    if($(this).attr("id").replace(/color/g,"")!=$(this).attr("id"))
		params[$(this).attr('id').replace(reg0,"")]=$(this).val().replace(/#/,"");
	    else
		params[$(this).attr('id').replace(reg0,"")]=$(this).val();
	});
	form.find('select').each(function(){
	    if(!$(this).attr("id"))
		return;
	    if($(this).find("option:selected").length>1){
		params[$(this).attr('id').replace(reg0,"")]=[];
		var oid=$(this).attr('id').replace(reg0,"");
		$(this).find("option:selected").each(function(){
		    params[oid].push($(this).val());
		});
	    }else
		params[$(this).attr('id').replace(reg0,"")]=$(this).val();
	});
	return params;
    }

    function bindSave(){
	$(".theForm").find("button").click(function(){
	    $('#documents_filename').val($('#file').val());$('#fileUpload').submit();
	});
    }

    var lid="listElements";
    function saveAnElement(){
	var id=localId;
	$(".fa-spin").removeClass("hide");
	var obj=createJsonFromForm($(".theForm"));
	obj["id"]=id;
	localId=id;
	obj["filename"]=$('input#file').val();
	localInit=true;
	zoo.execute({
	    identifier: "np.updateElement",
	    type: "POST",
	    dataInputs: [
		{"identifier": "table","value": tableName,"dataType":"string"},
		{"identifier": "keywords", value: $("#indicators_keywords").val(),dataType: "string"},
		{"identifier": "indicators_groups_in", value: "i_id",dataType: "string"},
		{"identifier": "indicators_groups_out", value: "g_id",dataType: "string"},
		{"identifier": "indicators_themes_in", value: "i_id",dataType: "string"},
		{"identifier": "indicators_themes_out", value: "t_id",dataType: "string"},
		{"identifier": "tuple","value": JSON.stringify(obj, null, ' '),"mimeType":"application/json"}
	    ],
	    dataOutputs: [
		{"identifier":"Result","type":"raw"},
	    ],
	    success: function(data){
		fillForm(data);
		$(".fa-spin").addClass("hide");
		$(".notifications").notify({
		    message: { text: data },
		    type: 'success',
		}).show();
		reloadElement=true;
		$("#"+lid).dataTable().fnDraw();
	    },
	    error: function(data){
		$(".notifications").notify({
		    message: { text: data["ExceptionReport"]["Exception"]["ExceptionText"].toString() },
		    type: 'danger',
		}).show();
	    }
	});
    }

    function addAnElement(){
	$(".fa-spin").removeClass("hide");
	zoo.execute({
	    identifier: "np.insertElement",
	    type: "POST",
	    dataInputs: [
		{"identifier": "table","value": tableName,"dataType":"string"},
		{"identifier": "name","value": $("#adder").find('input[name="dname"]').val(),"dataType":"string"}
	    ],
	    dataOutputs: [
		{"identifier":"Result","type":"raw"},
	    ],
	    success: function(data){
		fillForm(data);
		$(".fa-spin").addClass("hide");
		$(".notifications").notify({
		    message: { text: data },
		    type: 'success',
		}).show();
		localInit=false;
		reloadElement=true;
		$("#"+lid).dataTable().fnDraw();
	    },
	    error: function(data){
		$(".notifications").notify({
		    message: { text: data["ExceptionReport"]["Exception"]["ExceptionText"].toString() },
		    type: 'danger',
		}).show();
	    }
	});
    }

    function deleteAnElement(id){
	$(".fa-spin").removeClass("hide");
	zoo.execute({
	    identifier: "np.deleteElement",
	    type: "POST",
	    dataInputs: [
		{"identifier": "table","value": tableName,"dataType":"string"},
		{"identifier": "atable","value": "documents_themes","dataType":"string"},
		{"identifier": "akey","value": "d_id","dataType":"string"},
		{"identifier": "atable","value": "documents_groups","dataType":"string"},
		{"identifier": "akey","value": "d_id","dataType":"string"},
		{"identifier": "id","value": id,"dataType":"string"}
	    ],
	    dataOutputs: [
		{"identifier":"Result","type":"raw"},
	    ],
	    success: function(data){
		$(".fa-spin").addClass("hide");
		$(".notifications").notify({
		    message: { text: data },
		    type: 'success',
		}).show();
		localInit=false;
		reloadElement=true;
		$("#"+lid).dataTable().fnDraw();
	    },
	    error: function(data){
		$(".notifications").notify({
		    message: { text: data["ExceptionReport"]["Exception"]["ExceptionText"].toString() },
		    type: 'danger',
		}).show();
	    }
	});
    }

    var localInit=false;
    var localItem=-1;

    function startDataTable(rfields,fields){
	var cnt=0;
	var CRowSelected=[];
	var CFeaturesSelected=[];
	var CFeatures=[];
	var lid="listElements";

	$('#listElements').DataTable( {
	    language: {
                url: module.config().translationUrl
            },
	    data: [],
	    "dom": 'Zlfrtip',
            "colResize": true,
	    autoWidth: false,
	    "scrollY":  ($(window).height()/2)+"px",
	    "scrollCollapse": true,
	    "scrollX": true,
	    //"sScrollX": "100%",
	    //"sScrollXInner": "100%",
	    "bAutoWidth": false,
	    "bProcessing": true,
	    "bServerSide": true,
	    fixedHeader: true,
	    //searching: true,
	    responsive: true,
	    deferRender: true,
	    crollCollapse:    true,
	    ordering: "id",
	    rowId: 'fid',
	    "sAjaxSource": "users",
	    select: {
		info: false,
	    },
	    "lengthMenu": [[5, 10, 25, 50, 1000], [5, 10, 25, 50, "All"]],
	    columns: fields,
	    "rowCallback": function( row, data ) {
		$(row).removeClass('selected');
		if ( $.inArray(data.DT_RowId, CRowSelected) !== -1 ) {
		    $('#'+lid).DataTable().row($(row)).select();
		}else{
		    $('#'+lid).DataTable().row($(row)).deselect();
		}
	    },
	    "fnServerData": function ( sSource, aoData, fnCallback, oSettings ) {
		var llimit=[];
		for(j in {"iDisplayStart":0,"iDisplayLength":0,"iSortCol_0":0,"sSortDir_0":0,"sSearch":0})
		    for(i in aoData)
			if(aoData[i].name==j){
			    if(llimit.length==4 && aoData[i].value!="")
				llimit.push(aoData[i].value);
			    if(llimit.length<4)
				llimit.push(aoData[i].value);
			}
		
		var closestproperties=rfields;
		var page=llimit[0]+1;
		if(page!=1){
		    page=(llimit[0]/llimit[1])+1;
		}
		
		var opts=zoo.getRequest({
		    identifier: "datastores.postgis.getTableContent",
		    dataInputs: [
			{"identifier":"dataStore","value":module.config().db,"dataType":"string"},
			{"identifier":"table","value":"mm.indicators","dataType":"string"},
			{"identifier":"offset","value":llimit[0],"dataType":"int"},
			{"identifier":"limit","value":llimit[1],"dataType":"int"},
			{"identifier":"page","value":page,"dataType":"int"},
			{"identifier":"sortorder","value":llimit[3],"dataType":"string"},
			{"identifier":"search","value":llimit[llimit.length-1],"dataType":"string"},
			{"identifier":"sortname","value":(closestproperties.split(",")[llimit[2]]),"dataType":"string"},
			{"identifier":"fields","value":closestproperties.replace(/,msGeometry/g,""),"dataType":"string"}
		    ],
		    dataOutputs: [
			{"identifier":"Result","mimeType":"application/json","type":"raw"}
		    ],
		    type: 'POST',
		    storeExecuteResponse: false
		});
		
		opts["success"]=function(rdata) {
		    features=rdata;
		    featureCount=rdata["total"];
		    var data=[];
		    CFeatures=[];
		    for(var i in features.rows){
			var lparams={
			    "fid": "document_"+features.rows[i].id			    
			}
			var tmp=rfields.split(',');
			for(var kk=0;kk<tmp.length;kk++)
			    lparams[tmp[kk]]=features.rows[i].cell[kk];
			data.push(lparams);
			CFeatures.push(data[data.length-1]);
		    }

		    var opts={
			"sEcho": cnt++, 
			"iDraw": cnt++, 
			"iTotalRecords": featureCount, 
			"iTotalDisplayRecords": featureCount, 
			"aaData": (featureCount>0?data:[])
		    };
		    fnCallback(opts);

		    for(d in data){
			if ( $.inArray(data[d].fid+"", CRowSelected) !== -1 ) {
			    $('#'+lid).DataTable().row($("#"+data[d].fid)).select();
			}else{
			    $('#'+lid).DataTable().row($("#"+data[d].fid)).deselect();
			}
		    }

		    
		    if(featureCount==0){
			$('#'+lid+'Table').DataTable().clear();
		    }
		    
		    var existing=$('#'+lid+'_info').children('span.select-info');
		    if(existing.length)
			existing.remove();
		    $('#'+lid+'_info').append($('<span class="select-info"/>').append(
			$('<span class="select-item"/>').append('dd rows selected'.replace(/dd/g,CRowSelected.length))
		    ));
		    
		    loadElements(tableName,localInit);

		};
		opts["error"]=function(){
		    notify('Execute failed:' +data.ExceptionReport.Exception.ExceptionText, 'danger');
		};
		oSettings.jqXHR = $.ajax( opts );
	    }
	});

	var ltype="document";
	//var myRootElement=$('#'+lid).parent().find(".btn-group").first().parent();
	$('#'+lid+' tbody').on('click', 'tr', function () {
	    if(!this.id)
		return;
	    var id = this.id+"";
	    var reg0=new RegExp(ltype+'s_',"g");
	    var index = $.inArray(id, CRowSelected);
	    if ( index == -1 ) {
		if(CRowSelected.length>0){
		    $('#'+lid).DataTable().row($("#"+CRowSelected[0])).deselect();
		    CRowSelected.pop(CRowSelected[0]);
		    CFeaturesSelected.pop(CFeaturesSelected[0]);
		}
		/*if(CFeaturesSelected.length==0)
		    myRootElement.find(".require-select").removeClass("disabled");*/
		    
		CRowSelected.push( id );

		$('#'+lid).DataTable().row("#"+id).select();

		for(var i=0;i<CFeatures.length;i++){
		    if(CFeatures[i]["fid"]==id)
		       CFeaturesSelected.push( CFeatures[i] );
		}

		reg=new RegExp(ltype+"_","g");
		localId=id.replace(reg,"");
		reloadElement=false;
		loadAnElement(localId);

	    } else {
		$("."+lid+"BaseEditForm").removeClass("in");
		CRowSelected.pop(index);
		CFeaturesSelected.pop(index);
		$('#'+lid).DataTable().row("#"+id).deselect();
	    }
	    var existing=$('#'+lid+'_info').children('span.select-info');
	    if(existing.length)
		existing.remove();
	    $('#'+lid+'_info').append($('<span class="select-info"/>').append(
		$('<span class="select-item"/>').append((CFeaturesSelected.length!=CRowSelected.length?'dd rows selected (ee total selected)'.replace(/dd/g,CRowSelected.length).replace(/ee/g,CFeaturesSelected.length):'dd rows selected'.replace(/dd/g,CRowSelected.length)))
	    ));
	});
    }

    function runSql(execute,dbname,sql){
	zoo.execute({
	    identifier: (execute?"np.createTempFile":"np.testQuery"),
	    type: "POST",
	    dataInputs: [
		{"identifier":(execute?"map":"dbname"),"value":(dbname?dbname:$("#documents_indicators_database").val()),"dataType":"string"},
		{"identifier":(execute?"sql":"query"),"value":(sql?sql:$("#documents_data_query").val()),"dataType":"integer"}
	    ],
	    dataOutputs: [
		{"identifier":"Result","type":"raw"},
	    ],
	    success: function(data){
		if(execute)
		    fetchInfoAndDisplay(data);
		else
		    $(".notifications").notify({
			message: { text: data },
			type: 'success',
		    }).show();
	    },
	    error: function(data){
		$(".notifications").notify({
		    message: { text: data["ExceptionReport"]["Exception"]["ExceptionText"].toString() },
		    type: 'danger',
		}).show();
	    }
	});	
    }

    var fetchInfoAndDisplay=function(data){
	fileName=data;
	var ldata=data;
	zoo.execute({
	    identifier: "vector-tools.mmVectorInfo2Map",
	    type: "POST",
	    dataInputs: [
		{"identifier":"dataSource","value":ldata,"dataType":"string"},
		{"identifier":"force","value":"1","dataType":"integer"}
	    ],
	    dataOutputs: [
		{"identifier":"Result","type":"raw"},
	    ],
	    success: function(data){
		console.log(data);
		if(data.datasource){
		    var val="";
		    $("select[name=ifile_page]").html('');
		    if($.isArray(data.datasource.layer)){
			for(var i=0;i<data.datasource.layer.length;i++){
			    if(i==0)
			       val=data.datasource.layer[i].name;
			    $("select[name=ifile_page]").append("<option>"+data.datasource.layer[i].name+"</option>");
			}
			$("select[name=ifile_page]").change(function(){
			    var lval=$(this).val();
			    getVectorInfo(ldata,$(this).val(),function(data){
				var reg=new RegExp("\\[datasource\\]","g");
				var reg1=new RegExp("\\[font\\]","g");
				font="fa fa-table";
				console.log("FONT !! "+font);
				console.log($("#DS_indicatorTable_indicator"));
				if($("#DS_indicatorTable_indicator").length)
				    $("#DS_indicatorTable_indicator").remove();
				$("[data-mmaction=join]").first().parent().append($($("#dataSource_template")[0].innerHTML.replace(reg1,font).replace(reg,val)).attr("id","DS_indicatorTable_indicator"));
				managerTools.displayVector(data,ldata,"indicatorTable","indicator",lval,
							   function(){
							       $("#DS_indicatorTable_indicator").find(".panel").addClass("panel-warning").removeClass("panel-default");
							       $("[data-mmaction=join]").addClass("disabled");
							   },
							   function(){
							       $("#DS_indicatorTable_indicator").find(".panel").removeClass("panel-warning").addClass("panel-default");
							       $("[data-mmaction=join]").removeClass("disabled");
							   }); 
			    });			    
			});
			$("select[name=ifile_page]").find('option').first().prop("selected",true).change();
		    }else{
			val=data.datasource.layer.name;
			$("select[name=ifile_page]").append("<option>"+val+"</option>");
		    }
		    getVectorInfo(ldata,val,function(data){
			var reg=new RegExp("\\[datasource\\]","g");
			var reg1=new RegExp("\\[font\\]","g");
			font="fa fa-table";
			console.log("FONT !! "+font);
			console.log($("#DS_indicatorTable_indicator"));
			if($("#DS_indicatorTable_indicator").length)
			    $("#DS_indicatorTable_indicator").remove();
			$("[data-mmaction=join]").first().parent().append($($("#dataSource_template")[0].innerHTML.replace(reg1,font).replace(reg,val)).attr("id","DS_indicatorTable_indicator"));
			managerTools.displayVector(data,ldata,"indicatorTable","indicator",val,
						function(){
						    $("#DS_indicatorTable_indicator").find(".panel").addClass("panel-warning").removeClass("panel-default");
						    $("[data-mmaction=join]").addClass("disabled");
						},
						function(){
						    $("#DS_indicatorTable_indicator").find(".panel").removeClass("panel-warning").addClass("panel-default");
						    $("[data-mmaction=join]").removeClass("disabled");
						}); 
		    });
		}
	    },
	    error: function(data){
		$(".notifications").notify({
		    message: { text: data["ExceptionReport"]["Exception"]["ExceptionText"].toString() },
		    type: 'danger',
		}).show();
	    }
	});
    }

    function getLastFile(func){
	zoo.execute({
	    identifier: "np.getLastFile",
	    type: "POST",
	    dataInputs: [ ],
	    dataOutputs: [
		{"identifier":"Result","type":"raw"},
	    ],
	    success: function(data){
		func(data);
	    },
	    error: function(data){
		$(".notifications").notify({
		    message: { text: data["ExceptionReport"]["Exception"]["ExceptionText"].toString() },
		    type: 'danger',
		}).show();
	    }
	});	
    }


    function getIndicatorInfo(func){
	zoo.execute({
	    identifier: "np.refreshIndex",
	    type: "POST",
	    dataInputs: [
		{"identifier":"id","value":localId,"dataType":"integer"}
	    ],
	    dataOutputs: [
		{"identifier":"Result","type":"raw"},
	    ],
	    success: function(data){
		console.log(data);
		func(data);
	    },
	    error: function(data){
		$(".notifications").notify({
		    message: { text: data["ExceptionReport"]["Exception"]["ExceptionText"].toString() },
		    type: 'danger',
		}).show();
	    }
	});	
    }

    function getVectorInfo(dataSource,layer,func){
	zoo.execute({
	    identifier: "vector-tools.mmExtractVectorInfo",
	    type: "POST",
	    dataInputs: [
		{"identifier":"dataSource","value":dataSource,"dataType":"string"},
		{"identifier":"layer","value":layer,"dataType":"integer"}
	    ],
	    dataOutputs: [
		{"identifier":"Result","type":"raw"},
	    ],
	    success: function(data){
		console.log(data);
		func(data);
	    },
	    error: function(data){
		$(".notifications").notify({
		    message: { text: data["ExceptionReport"]["Exception"]["ExceptionText"].toString() },
		    type: 'danger',
		}).show();
	    }
	});	
    }

    function fetchFields(datasource,func){
	zoo.execute({
	    identifier: "np.getMapRequest0",
	    type: "POST",
	    dataInputs: [
		{"identifier":"t_id","value":datasource,"dataType":"string"}
	    ],
	    dataOutputs: [
		{"identifier":"Result","type":"raw"},
	    ],
	    success: function(data){
		console.log(data);
		//var obj=_x2js.xml_str2json( data );
		console.log(data.schema.complexType.complexContent.extension.sequence.element);
		if($.isArray(data.schema.complexType.complexContent.extension.sequence.element)){
		    $("#documents_indicators_field").html("");
		    for(var i=0;i<data.schema.complexType.complexContent.extension.sequence.element.length;i++){
			var cname=data.schema.complexType.complexContent.extension.sequence.element[i]._name;
			if(cname!="msGeometry")
			    $("#documents_indicators_field").append('<option>'+cname+'</option>');
		    }
		}
		if(func)
		    func(data);
	    },
	    error: function(data){
		$(".notifications").notify({
		    message: { text: data["ExceptionReport"]["Exception"]["ExceptionText"].toString() },
		    type: 'danger',
		}).show();
	    }
	});	
    }

    var llcnt=0;

    function insertElem(params,func){
	zoo.execute({
	    identifier: "np."+(test?"updateElem":"insertElem"),
	    type: "POST",
	    dataInputs: params,
	    dataOutputs: [
		{"identifier":"Result","type":"raw"},
	    ],
	    success: function(data){
		console.log(data);
		func(data);
	    },
	    error: function(data){
		$(".notifications").notify({
		    message: { text: data["ExceptionReport"]["Exception"]["ExceptionText"].toString() },
		    type: 'danger',
		}).show();
	    }
	});		
    }

    function callService(service,params,func,outputs){
	var dataOutputs=[
	    {"identifier":"Result","type":"raw"},
	];
	if(outputs)
	    dataOutputs=outputs;
	zoo.execute({
	    identifier: service,
	    type: "POST",
	    dataInputs: params,
	    dataOutputs: dataOutputs,
	    success: function(data){
		func(data);
	    },
	    error: function(data){
		$(".notifications").notify({
		    message: { text: data["ExceptionReport"]["Exception"]["ExceptionText"].toString() },
		    type: 'danger',
		}).show();
	    }
	});		
    }

    function fetchIndicatorInfo(lfunc){
	getIndicatorInfo(function(data){

	    $(".class-switcher").off('change');
	    $(".class-switcher").change(function(){
		console.log(".class-switcher CHANGE ! "+llcnt);
		llcnt+=1;
		var myRootLocation=$(this).parent().parent().parent();
		var index=0;
		var hasElement=true;
		var closure=$(this);
		myRootLocation.find('.no-us').show();
		myRootLocation.find('.class-switcher').each(function(){
		    if(closure[0]==$(this)[0]){
			hasElement=false;
		    }
		    else
			if(hasElement)
			    index+=1;
		});
		$(this).find('option').each(function(){
		    if(!$(this).is(':selected'))
			myRootLocation.find('.no-'+$(this).attr('value')).show();
		});
		$(this).find('option:selected').each(function(){
		    myRootLocation.find('.no-'+$(this).attr('value')).hide();
		});
		if(index>0)
		    myRootLocation.find(".require-tl").show();
		if(data.type!=3)
		    myRootLocation.find(".require-raster").hide();
		myRootLocation.find(".require-add-step").hide();
	    });

	    managerTools.displayVector(data,module.config().db,"indicatorTable","dataTable","indexes.view_idx"+localId,
				       function(){
					   $("#DS_indicatorTable_dataTable").find(".panel").addClass("panel-warning").removeClass("panel-default");
				       },
				       function(){
					   $("#DS_indicatorTable_dataTable").find(".panel").removeClass("panel-warning").addClass("panel-default");
				       }); 

	    //$(".class-switcher").trigger("change");
	    if(lfunc)
		lfunc(data);
	});
    }
    
    function fetchIndexTableAndDisplay(ldata,func){
	managerTools.getTableDesc(module.config().msUrl,module.config().dataPath+"/PostGIS/"+module.config().db+"ds_ows.map","indexes.view_idx"+localId,ldata,function(obj,rdata,idata){
	    managerTools.loadTableDefinition(obj,idata,function(elem){
		console.log('toto');
		var prefix="";
		if(arguments.length>1)
		    prefix="agregate_";	
		
		///var params=produceParams(prefix);
		var params=[
		    {identifier: "table", value: "d_table",dataType: "string"},
		    {identifier: "name", value: $("#documents_table_title").val(),dataType: "string"},
		    {identifier: "i_id", value: localId,dataType: "string"}	
		];
		if($("#agregation").is(":visible")){
		    test=false;
		    params.push({
			identifier: "tid",
			value: $("#p_tname").val(),
			dataType: "string"
		    });
		}
		test=$("#documents_"+prefix+"table_id")[0] && $("#documents_"+prefix+"table_id").val()!='-1' && $("#documents_"+prefix+"table_id").val()!='';
		if(test){
		    params.push({
			identifier: "id",
			value: localId,
			dataType: "string"
		    });
		}
		if($("#documents_table_steps").is(":visible") && $("#table_step").val()>0)
		    params.push({"identifier":"step","value":($("#documents_table_step")[0].selectedIndex-1),dataType: "string"});
		
		
		$("#mm_layer_property_table_display").find("tbody").find("tr").each(function(){
		    var params0={
			"pos":"",
			"display":"",
			"search":"",
			"var":"",
			"label":"",
			"value":"",
			"width":""
		    };
		    var cnt=0;
		    $(this).find("td").find("input").each(function(){
			if($(this).attr('type')=="checkbox"){
			    var lcnt1=0;
			    for(var k in params0){
				if(lcnt1==cnt)
				    params0[k]=$(this).prop('checked')+"";
				lcnt1+=1;
			    }
			}else{
			    var lcnt1=0;
			    for(var k in params0){
				if(lcnt1==cnt)
				    params0[k]=$(this).val();
				lcnt1+=1;
			    }
			}
			cnt+=1;
		    });
		    params.push({
			identifier:"tuple",
			value:JSON.stringify(params0),
			mimeType: "application/json"
		    });
		});
		params.push({
		    "identifier": "map",
		    "value": $("#save-map").val(),
		    "dataType": "string"
		});
		params.push({
		    "identifier": "layer",
		    "value": ldata.name,
		    "dataType": "string"
		});
		callService("np.saveIndexTable",params,function(data){
		    $(".notifications").notify({
			message: { text: data },
			type: 'success',
		    }).show();
		});
		
	    });
	    console.log("getTableDesc end");
	    console.log($(".mmFields"));
	    $(".mmFields,.mmField").html("");
	    console.log(rdata);
	    for(var i=0;i<rdata.fields.length;i++){
		if(rdata.fields[i]!="msGeometry")
		    $(".mmFields,.mmField").append('<option>'+rdata.fields[i]+'</option>');
		console.log($(".mmFields"));
	    }
	    /*$("#indicators_form_table").find("button").first().click(function(){
	      });*/
	    
	    if(func)
		func(rdata);
	    managerTools.loadStyleDisplay(ldata,[
		{"identifier": "map","value": "Index"+localId,"dataType":"string"},
		{"identifier": "prefix","value": "indexes","dataType":"string"},
		{"identifier": "name","value": "Index"+localId,"dataType":"string"},
		{"identifier": "orig","value": module.config().db,"dataType":"string"},
		{"identifier": "id","value": localId,"dataType":"int"},
		{"identifier": "formula","value": $('#mm_layer_property_style_display').find("textarea[name=formula]").val(),"dataType":"int"},
	    ]);
	    bindClassifier(ldata);

	});
	var reg=new RegExp("\\[datasource\\]","g");
	var reg1=new RegExp("\\[font\\]","g");
	font="fa fa-table";
	
	if($("#DS_indicatorTable_dataTable").length)
	    $("#DS_indicatorTable_dataTable").remove();
	$("#indicators_form_table").append($($("#dataSource_template")[0].innerHTML.replace(reg1,font).replace(reg,"indexes.view_idx"+localId)).attr("id","DS_indicatorTable_dataTable"));
	fetchIndicatorInfo();
    }

    function bindClassifier(ldata){
	$("#mm_layer_property_style_display").find("button.mmClassifier").off("click");
	$("#mm_layer_property_style_display").find("button.mmClassifier").click(function(e){
	    var params=[
		{"identifier": "prefix","value": "indexes","dataType":"string"},
		{"identifier": "name","value": "Index"+localId,"dataType":"string"},
		{"identifier": "orig","value": module.config().db,"dataType":"string"},
		{"identifier": "id","value": localId,"dataType":"int"},
		{"identifier": "formula","value": $('#mm_layer_property_style_display').find("textarea[name=formula]").val(),"dataType":"int"},
	    ];
	    try{
		managerTools.classifyMap(this,"Index"+localId,ldata,params,function(data){
		    console.log(data);
		});
	    }catch(e){
		console.log(e);
	    }
	    return false;
	});
    }    

    function refreshLayerStyle(){
	var params=[
	    {"identifier":"prefix","value":"indexes","dataType":"string"},
	    {"identifier":"name","value":"Index"+localId,"dataType":"string"},
	    {"identifier":"orig","value":module.config().db,"dataType":"string"},
	    {"identifier":"id","value":localId,"dataType":"string"}
	];
	console.log(params);

	managerTools.callCreateLegend(null,"indexes.view_idx"+localId,null,params,function(data){
	    console.log(data);
	    try{
		fetchIndexTableAndDisplay(data);
		//fetchIndicatorInfo(data);
	    }catch(e){
		console.log(e);
	    }
	    console.log(data);
	});
    }

    var initialize=function(){
	
	adminBasic.initialize(zoo);
	managerTools.initialize(zoo);
	window.setTimeout(function () { 
	    $("textarea#documents_description").summernote();
	},10);

	$('[data-toggle="tooltip"]').tooltip({container: 'body'});
	startDataTable("id,name",[
	    {
		"data": "id",
		"name": "id",
		"sWidth": "10%"
	    },
	    {
		"data": "name",
		"name": "name",
		"sWidth": "80%"
	    },
	]);
	bindSave();

	$("#adder").find("button").click(function(){
	    addAnElement();
	    $("#adder").removeClass("in");
	});
	$("#deleter").find("button").click(function(){
	    deleteAnElement(localId);
	    $("#deleter").removeClass("in");
	});

	$(".tab-pane").css({"max-height":($(window).height()-($(".navbar").height()*3.5))+"px","overflow-y":"auto","overflow-x":"hidden"});
	$("#page-wrapper").find("[role=presentation]").first().children().first().click();
	
	$("[data-mmaction=testSql]").click(function(){
	    runSql();
	});
	$("[data-mmaction=runSql]").click(function(){
	    runSql(true);
	});

	$("#indicators_form_pie-chart").find("button").last().click(function(){
	    var prefix="";
	    /*if(arguments.length>1)
		prefix="agregate_";	*/
	    var params=[
		{identifier: "table", value: "graphs",dataType: "string"},
		{identifier: "name", value: $("#documents_graphs_title").val(),dataType: "string"},
		{identifier: "type", value: $("#documents_graphs_type").val(),dataType: "string"},
		{identifier: "lx", value: $("#documents_"+prefix+"graphs_lx").val(),dataType: "string"},
		{identifier: "vx", value: $("#documents_"+prefix+"graphs_vx").val(),dataType: "string"},
		{identifier: "ly", value: $("#documents_"+prefix+"graphs_ly").val(),dataType: "string"},
		{identifier: "vy", value: $("#documents_"+prefix+"graphs_vy").val(),dataType: "string"},
		{identifier: "tooltip", value: $("#documents_graphs_tooltip").val(),dataType: "string"},
		{identifier: "formula", value: $("#documents_graphs_formula").val(),dataType: "string"},
		{identifier: "it_id", value: "(SELECT id from "+module.config().dbschema+".indicators_territories where i_id="+localId+($("#agregation").is(":visible")?" and t_id="+$("#p_tname").val():" and (not(agregation) or agregation is null)")+")",dataType: "string"}	
	    ];
	    if($("#agregation").is(":visible")){
		test=false;
		params.push({
		    identifier: "tid",
		    value: $("#p_tname").val(),
		    dataType: "string"
		});
	    }
	    test=$("#documents_"+prefix+"graphs_id")[0] && $("#documents_"+prefix+"graphs_id").val()!='-1' && $("#"+prefix+"graphs_id").val()!='';
	    if(test){
		params.push({
		    identifier: "id",
		    value: $("#documents_"+prefix+"graphs_id").val(),
		    dataType: "string"
		});
	    }
	    if($("#documents_graphs_steps").is(":visible") && $("#graphs_step").val()>0)
		params.push({"identifier":"step","value":($("#documents_graphs_step")[0].selectedIndex-1),dataType: "string"});


	    insertElem(params,function(data){
		console.log(data);
		$(".notifications").notify({
		    message: { text: data },
		    type: 'success',
		}).show();
	    });
	});

	$("[data-mmaction=join]").click(function(){
	    var table=$("#DS_table_indicatorTable_indicator").DataTable();
	    var params=[];
	    console.log(table.columns());
	    console.log(table.columns().name);
	    var res=[];
	    var elemChecked=0;
	    var hasElem=false;
	    $("input[name=indicator_data_type]").each(function(){
		if($(this).is(":checked")){
		    hasElem=true;
		    return;
		}
		if(!hasElem)
		    elemChecked+=1;
	    });
	    console.log(elemChecked);
	    if(elemChecked==2){
		params.push({
		    identifier: "dbname",
		    value: $("input[name=documents_database]").val(),
		    dataType: "string"
		});
		params.push({
		    identifier: "query",
		    value: $("#documents_data_query").val(),
		    dataType: "string"
		});		
	    }
	    if(elemChecked==1){
		params.push({
		    identifier: "dbname",
		    value: module.config().db,
		    dataType: "string"
		});
		params.push({
		    identifier: "query",
		    value: "SELECT * FROM "+$("#pg_table").val(),
		    dataType: "string"
		});		
	    }
	    for(var i=0;i<table.columns()[0].length;i++){
		res.push($(table.column( i ).header()).html());
		if(i==0)
		    params.push({
			identifier: "field",
			value: $(table.column( i ).header()).html(),
			dataType: "string"
		    });
		params.push({
		    identifier: "rcol",
		    value: $(table.column( i ).header()).html(),
		    dataType: "string"
		});
		var title = table.column( i ).header();
		console.log( 'Column title clicked on: '+$(title).html() );
		console.log(table.columns()[0][i]);
	    }
	    params.push({
		identifier: "territory",
		value: $("#documents_indicators_table").val(),
		dataType: "string"
	    });
	    params.push({
		identifier: "field",
		value: $("#documents_indicators_field").val(),
		dataType: "string"
	    });
	    params.push({
		identifier: "filename",
		value: fileName,
		dataType: "string"
	    });
	    params.push({
		identifier: "type",
		value: (elemChecked==2?"sql":(elemChecked==1?"table":"file")),
		dataType: "string"
	    });
	    params.push({"identifier": "sql","value":"SELECT "+res.join(',')+' FROM "'+$("#documents_ifile_page").val()+'"',dataType:"string"});
	    params.push({"identifier": "layer","value":$("#documents_ifile_page").val(),dataType:"string"});
	    params.push({"identifier": "id","value":localId,dataType:"string"});
	    console.log(res);
	    console.log(params);
	    zoo.execute({
		identifier: "np.createIndex",
		type: "POST",
		dataInputs: params,
		dataOutputs: [
		    {"identifier":"Result","type":"raw"},
		],
		success: function(data){
		    $(".notifications").notify({
			message: { text: data },
			type: 'success',
		    }).show();

		    /*fetchIndexTableAndDisplay(data,function(data){
			refreshLayerStyle();
		    });*/
		    fetchIndicatorInfo(function(data){
			refreshLayerStyle();
			//fetchIndicatorInfo(data);
		    });
		},
		error: function(data){
		    $(".notifications").notify({
			message: { text: data["ExceptionReport"]["Exception"]["ExceptionText"].toString() },
			type: 'danger',
		    }).show();
		}
	    });	
	});

	$("#pg_schema").change(function(){
	    adminBasic.loadTablesList($("input[name=data_table_dbname]").val(),$(this).val(),$("#pg_table"));
	});
	$("#pg_table").change(function(){
	    runSql(true,$("input[name=data_table_dbname]").val(),"SELECT * FROM "+$(this).val());
	});

	$("#documents_indicators_table").change(function(){
	    if($(this).val()!=-1)
		fetchFields($(this).val());
	});

	$("[data-mmaction=import-doc]").click(function(){
	    $("#auploader").off("load");
	    $("#auploader").on("load",function(){
		callService("np.saveRepportFile0",[{"identifier":"id","value":localId,"dataType":"integer"}],function(d){
		    console.log(d);
		    $(".notifications").notify({
			message: { text: d["ExecuteResponse"]["ProcessOutputs"]["Output"][0]["Data"]["ComplexData"]["__text"] },
			type: 'success',
		    }).show();
		    var localData=JSON.parse(d["ExecuteResponse"]["ProcessOutputs"]["Output"][1]["Data"]["ComplexData"]["__cdata"]);
		    fillDefaultRepport(localData);
		},[
		    {"identifier": "Message"},
		    {"identifier": "Result"}
		]);
	    });
	    $("#afileUpload").submit();
	});

	$("[data-mmaction=import]").click(function(){
	    $("#iuploader").off("load");
	    $("#iuploader").on("load",function(){
		console.log(arguments);
		getLastFile(fetchInfoAndDisplay);
	    });
	    $("#ifileUpload").submit();
	});

	$("[data-mmaction=publish]").click(function(){
	    callService("np.publishFullIndex",[
		{identifier:"id",value:localId,dataType:"string"}
	    ],function(data){
	    	$(".notifications").notify({
		    message: { text: data },
		    type: 'success',
		}).show();
		$("#name_title").removeClass("fa-exclamation").addClass('fa-check');
	    });
	});

	console.log($("#page-wrapper").find("[role=presentation]").first());
	console.log("Start Indicators");

	$("#mm_layer_property_style_display").find(".cpicker").each(function(){
	    $(this).colorpicker({format: "hex",input: $(this).find("input[type=text]")});
	});

    };

    // Return public methods
    return {
        initialize: initialize,
	saveAnElement: saveAnElement
    };



});

