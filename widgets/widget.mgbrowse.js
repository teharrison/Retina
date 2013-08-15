(function () {
    widget = Retina.Widget.extend({
        about: {
                title: "Metagenome Browser Widget",
                name: "mgbrowse",
                author: "Tobias Paczian",
                requires: [ ]
        }
    });
    
    widget.setup = function () {
	return [ 
 	    Retina.add_renderer({"name": "table", "resource": "./renderers/",  "filename": "renderer.table.js" }),
  	    Retina.load_renderer("table")
	];
    };

    widget.state = { "initial": true,
		     "sort": "name",
		     "sortDir": "asc",
		     "limit": 15,
		     "offset": 0,
		     "query": {},
		     "api_url": stm.Config.mgrast_api+'/metagenome?' };
    
    widget.display = function (wparams) {
        widget = this;

	var result_table_header = wparams.header || [ "id", "name", "project_id", "project_name", "PI_lastname", "biome", "feature", "material", "env_package_type", "location", "country", "longitude", "latitude", "collection_date", "sequence_type", "seq_method", "status", "created" ];

	var result_table_filter = wparams.filter;
	if (result_table_filter == null) {
	    result_table_filter = {};
	    for (i=0;i<result_table_header.length;i++) {
		result_table_filter[i] = { "type": "text" };
	    }
	}
	widget.result_table = Retina.Renderer.create("table", {
	                            target: wparams.target,
								rows_per_page: 15,
								filter_autodetect: false,
								filter: result_table_filter,
								sort_autodetect: false,
								synchronous: false,
								navigation_callback: widget.update,
								data: { data: [], header: result_table_header } } );
	widget.result_table.render();
	if (widget.state.initial) {
	    widget.state.initial = false;
	    widget.update();
	}
    };

    widget.update = function (params) {
	if (typeof params == 'string') {
	    if (params == 'first') {
		Retina.WidgetInstances.mgbrowse[1].state.offset = 0;
	    }
	    if (params == 'previous') {
		Retina.WidgetInstances.mgbrowse[1].state.offset -= Retina.WidgetInstances.mgbrowse[1].state.limit;
		if (Retina.WidgetInstances.mgbrowse[1].state.offset < 0) {
		    Retina.WidgetInstances.mgbrowse[1].state.offset = 0;
		}
	    }
	    if (params == 'next') {
		Retina.WidgetInstances.mgbrowse[1].state.offset += widget.state.limit;
	    }
	    if (params == 'last') {
		Retina.WidgetInstances.mgbrowse[1].state.offset = Retina.WidgetInstances.mgbrowse[1].state.numrows - Retina.WidgetInstances.mgbrowse[1].state.limit;
		if (Retina.WidgetInstances.mgbrowse[1].state.offset < 0) {
		    Retina.WidgetInstances.mgbrowse[1].state.offset = 0;
		}
	    }
	} 
	if (typeof params == 'object') {
	    if (params.sort) {
	        if (params.sort == 'default') {
	            Retina.WidgetInstances.mgbrowse[1].state.sort = 'name';
    		    Retina.WidgetInstances.mgbrowse[1].state.sortDir = 'asc';
	        } else {
		        Retina.WidgetInstances.mgbrowse[1].state.sort = params.sort;
		        Retina.WidgetInstances.mgbrowse[1].state.sortDir = params.dir;
	        }
	    }
	    if (params.query) {
	        if (typeof params.query == 'object') {
		        for (i=0;i<params.query.length;i++) {
		            Retina.WidgetInstances.mgbrowse[1].state.query[params.query[i].field] = { "searchword": params.query[i].searchword, "comparison": params.query[i].comparison || "=" };
		        }
	        } else {
	            Retina.WidgetInstances.mgbrowse[1].state.query = {};
	        }
	    }
	    if (params.goto != null) {
		    Retina.WidgetInstances.mgbrowse[1].state.offset = params.goto;
	    }
	    if (params.limit) {
		    Retina.WidgetInstances.mgbrowse[1].state.limit = params.limit;
	    }
	}

	var query = "";
	for (i in Retina.WidgetInstances.mgbrowse[1].state.query) {
	    if (Retina.WidgetInstances.mgbrowse[1].state.query.hasOwnProperty(i) && Retina.WidgetInstances.mgbrowse[1].state.query[i].searchword.length) {
		    query += i + Retina.WidgetInstances.mgbrowse[1].state.query[i].comparison + Retina.WidgetInstances.mgbrowse[1].state.query[i].searchword + "&";
	    }
	}

    console.log(Retina.WidgetInstances.mgbrowse[1].state);
	var url = Retina.WidgetInstances.mgbrowse[1].state.api_url + query + "order=" + Retina.WidgetInstances.mgbrowse[1].state.sort + "&direction=" + Retina.WidgetInstances.mgbrowse[1].state.sortDir + "&match=any&verbosity=mixs" + "&limit=" + Retina.WidgetInstances.mgbrowse[1].state.limit + "&offset=" + Retina.WidgetInstances.mgbrowse[1].state.offset;
	
	jQuery.getJSON(url, function(data) {
            Retina.WidgetInstances.mgbrowse[1].result_table.settings.tdata = data.data;
	    Retina.WidgetInstances.mgbrowse[1].result_table.settings.filter_changed = false;
	    Retina.WidgetInstances.mgbrowse[1].result_table.settings.sorted = true;
            Retina.WidgetInstances.mgbrowse[1].result_table.settings.numrows = Retina.WidgetInstances.mgbrowse[1].state.numrows = data.total_count;
            Retina.WidgetInstances.mgbrowse[1].result_table.settings.offset = Retina.WidgetInstances.mgbrowse[1].state.offset;
	    Retina.WidgetInstances.mgbrowse[1].result_table.render();
	});
    };
    
})();