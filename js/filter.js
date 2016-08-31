var optionTitle = '';
var word_list = [ ];

$(document).ready(function() {
    // declare new graph
    s = new sigma('sigma-container');
    c = s.camera;

    // set graph settings
    s.settings({
        eventsEnabled: true,
        edgeColor: "default",
        maxEdgeSize: 0.15,
        defaultLabelSize: 12,
        labelThreshold: 9
    });

    s.bind('clickNode',function(caller) {
        var node = caller['data']['node'];

        if (node['good-word']) refreshData(node);
        else nodeNotice();
    }).refresh();

    resetGraph();

    $(".zoom-in").bind("click",function(){
        sigma.misc.animation.camera(
            s.camera, {
                ratio: s.camera.ratio / c.settings('zoomingRatio')
            }, {
                duration: s.settings('animationsTime') || 300
        });
    });

    $(".zoom-out").bind("click",function(){
        sigma.misc.animation.camera(
            s.camera, {
                ratio: s.camera.ratio * c.settings('zoomingRatio')
            }, {
                duration: s.settings('animationsTime') || 300
        });
    });

    $(".zoom-reset").bind("click",function(event){
        resetGraph();
    });

    $.ajax({
        url: "https://ctsllex.herokuapp.com/getNodes",
    }).done(function(data) {
        for (node_i = 0; node_i < data.length; node_i++) {
            var node = data[node_i];

            node['id'] = String(node['id']);
            node['label'] = String(node['label']);
            node['good-word'] = true;
            node['size'] = 1;

            s.graph.addNode(node);

            word_list.push(node['label']);
        }

        // add scaling node (in random far off location) so every other node is properly sized
        var scaling_node = {
            "id": "scaling_node",
            "label": "Scaling Node (ignore if found)",
            "x": 10000,
            "y": 10000,
            "size": 3.9,
            "attributes": { }
        };

        s.graph.addNode(scaling_node);

        updateNodeFilterCount(data.length);

        $.ajax({
            url: "https://ctsllex.herokuapp.com/getEdges",
        }).done(function(data) {
            for (edge_i = 0; edge_i < data.length; edge_i++) {
                var edge = data[edge_i];
                edge['id'] = String(edge['id']);
                edge['source'] = String(edge['source']);
                edge['target'] = String(edge['target']);

                s.graph.addEdge(edge);
            }

            s.refresh();
        });

        word_list.sort();
        $( "#search-input" ).autocomplete({
            source: word_list,
            response: function( event, ui ) {
                if (ui.content.length == 0) $('#no_results').css('display', 'block');
                else $('#no_results').css('display', 'none');
            },
            select: function(event, ui) {
                graphSearch(ui.item.label);
            },
        });

        s.refresh();

        $("#loading_gif").css({'display': 'none'});

        var checkbox_attributes = ['CTSL Selected Fingers','CTSL Flexion','CTSL Path Movement','CTSL Major Location','CTSL Turkish Iconicity (M)','CTSL Turkish Iconicity (Z)','CTSL American Iconicity (M)','CTSL American Iconicity (Z)','CTSL Parameter Based Neighborhood Density','ASL Selected Fingers','ASL Flexion ','ASL Path Movement','ASL Major Location','ASL Minor Location','ASL Sign Type','ASL Iconicity (M)','ASL Iconicity (Z)','ASL Parameter Based Neighborhood Density','ASL Sign Frequency (M)','ASL Sign Frequency (Z)','ASL Compound','ASL Initialized', 'ASL Lexical Class','ASL Fingerspelled Loan Sign'];

        for (i = 0; i < checkbox_attributes.length; i++) {
            var attribute = checkbox_attributes[i];

            if (attribute.indexOf('original_') > -1) continue;

            $('#jBox-download-grab form#checkbox_container').append("<input type='checkbox' name='checkbox-1' id='checkbox-choice-" + attribute + "' data-toggle='button' checked><label class='btn btn-primary ui-btn' for='checkbox-choice-" + attribute +"'>" + attribute + "</label>");
        }

        $('#jBox-download-grab form#checkbox_container').append("<br /><input type='radio' name='radio-choice-0' id='radio-choice-a' checked><label for='radio-choice-a'>Download All Data</label><input type='radio' name='radio-choice-0' id='radio-choice-b'><label for='radio-choice-b'>Download Filtered Data</label>");

        $('#jBox-download-grab form#checkbox_container').trigger('create');

        $('#select-btn').click(function() {
            $('#jBox-download-grab form#checkbox_container input[type="checkbox"]').checked = true;
            $('#jBox-download-grab form#checkbox_container input[type="checkbox"]').checkboxradio("refresh");
        });

        $('#unselect-btn').click(function() {
            $('#jBox-download-grab form#checkbox_container input[type="checkbox"]').attr('checked', false).checkboxradio("refresh");
        });
    });

    $('#search-input').keypress(function (e) {
        if (e.which == 13) {
            graphSearch($('#search-input').val());
            return false;
        }
    });

    continuous_filter = new jBox('Confirm',{
        attach: $('.constrain-btn.continuous'),
        width: 350,
        height: 150,
        confirmButton: "Submit",
        getTitle: 'data-jbox-title',
        content: $('#jBox-slider-grab'),
        onOpen: function() {
            optionTitle = this.source['0'].dataset['jboxTitle'];
            $('#constraint-A').val(filter_data[optionTitle].valueA);
            $('#constraint-B').val(filter_data[optionTitle].valueB);

            // specify min / max values
            if (filter_data[optionTitle].min == null)
                $('#slider-min').html("-");
            else
                $('#slider-min').html(filter_data[optionTitle].min);

            if (filter_data[optionTitle].max == null)
                $('#slider-min').html("-");
            else
                $('#slider-max').html(filter_data[optionTitle].max);

        }
    });

    categorical_filter = new jBox('Confirm',{
        attach: $('.constrain-btn.categorical'),
        width: 400,
        maxHeight: 300,
        confirmButton: "Submit",
        getTitle: 'data-jbox-title',
        content: $('#jBox-toggle-grab'),
        onOpen: function() {
            optionTitle = this.source['0'].dataset['jboxTitle'];

            // clear out button group
            $('#jBox-toggle-grab .btn-group').html('');

            for (i = 0; i < filter_data[optionTitle]['values'].length; i++) {

                // see if it should be checked
                if (filter_data[optionTitle]['allowed'].indexOf(filter_data[optionTitle]['values'][i]) > -1) is_checked = 'checked';
                else is_checked = '';

                // add string to button group
                var append_string = '<input type="checkbox" id="group' + i + '" data-toggle="button" ' + is_checked + '><label class="btn btn-primary" for="group' + i + '">' + filter_data[optionTitle]['values'][i] + '</label>';
                $('#jBox-toggle-grab .btn-group').append(append_string);
            }

            // refresh button group to trigger
            $('#jBox-toggle-grab .btn-group').trigger('create');
        }
    });

    boolean_filter = new jBox('Confirm',{
        attach: $('.constrain-btn.boolean'),
        width: 350,
        height: 175,
        confirmButton: "Submit",
        getTitle: 'data-jbox-title',
        content: $('#jBox-radio-grab'),
        onOpen: function() {
            optionTitle = this.source['0'].dataset['jboxTitle'];

            // set the boolean to the value associated with this option
            if (filter_data[optionTitle]['value'] == true) {
                $('#false_radio').addClass('ui-radio-off');
                $('#false_radio').removeClass('ui-radio-on');
                $('#true_radio').addClass('ui-radio-on');
                $('#true_radio').removeClass('ui-radio-off');
            } else if (filter_data[optionTitle]['value'] == false) {
                $('#false_radio').addClass('ui-radio-on');
                $('#false_radio').removeClass('ui-radio-off');
                $('#true_radio').addClass('ui-radio-off');
                $('#true_radio').removeClass('ui-radio-on');
            } else {
                $('#false_radio').addClass('ui-radio-off');
                $('#false_radio').removeClass('ui-radio-on');
                $('#true_radio').addClass('ui-radio-off');
                $('#true_radio').removeClass('ui-radio-on');
            }
        }
    });

    popup_about = new jBox('Modal',{
        attach: $('#about-filters'),
        width: 600,
        height: 400,
        title: 'Filtering in CTSL-LEX',
        content: $('#jBox-about-filter-grab'),
    });

    popup_download = new jBox('Modal',{
        attach: $('#download-popup'),
        width: 550,
        height: 400,
        confirmButton: 'Download',
        title: 'Download CTSL-LEX Data',
        content: $('#jBox-download-grab'),
    });

});

function resetGraph() {
    sigma.misc.animation.camera(
        s.camera, {
            x: -235, 
            y: -232, 
            ratio: 0.25
        }, {
            duration: s.settings('animationsTime') || 300
    });
}

// function run when user presses submit on a constrain popup
function confirm() {
    if (filter_data[optionTitle]['type'] == 'boolean') {
        // check if user selected either option
        // if they did, store this value
        if ($('#true_radio').hasClass('ui-radio-on')) {
            filter_data[optionTitle]['value'] = true;
        } else if ($('#false_radio').hasClass('ui-radio-on')) {
            filter_data[optionTitle]['value'] = false;
        } else {
            filter_data[optionTitle]['value'] = null;
        }

    } else if (filter_data[optionTitle]['type'] == 'categorical') {
        // check if user selected any options
        // if they did, store these values in the array
        var check_boxes = $('#jBox-toggle-grab .btn-group').children();
        filter_data[optionTitle]['allowed'] = [ ];

        for (i = 0; i < check_boxes.length; i++) {
            if (check_boxes[i].children[0].className.indexOf('ui-checkbox-on') > -1) {
                filter_data[optionTitle]['allowed'].push(filter_data[optionTitle]['values'][i]);
            }
        }

    } else if (filter_data[optionTitle]['type'] == 'continuous') {
        var valA = $('#constraint-A').val();
        var valB = $('#constraint-B').val();
        if (valA == "") valA = null;
        if (valB == "") valB = null;

        if (($.isNumeric(valA) || valA == null) && ($.isNumeric(valB) || valB == null)) {
            if (($.isNumeric(valA) && $.isNumeric(valB) && valA < valB) ||
               (valA == null || valB == null))  {
                filter_data[optionTitle].valueA = valA;
                filter_data[optionTitle].valueB = valB;
            }
        } else {
            alert("Invalid constraints, please try again");
        }
    }

    updateNodes();
    updateEdges();

    s.refresh();
}

function updateNodes() {
    var node_count = 0;
    s.graph.nodes().forEach(function(n) {
        for (option in filter_data) {
            // skip scaling node
            if (n['id'] == 'scaling_node') break;

            // if the option is a boolean
            if (filter_data[option]['type'] == 'boolean') {
                var node_value = n['attributes'][option];
                var value = filter_data[option]['value'];

                if (value == null || value == node_value) {
                    n['good-word'] = true;
                    n['color'] = n['original_color'];
                    n['size']  = 1;
                } else {
                    n['good-word'] = false;
                    n['color'] = '#D8D8D8';
                    n['size'] = 0.5;
                    break;
                }

            // if option is a categorical option
            } else if (filter_data[option]['type'] == 'categorical') {
                var node_value = n['attributes'][option];
                var value_array = filter_data[option]['allowed'];

                

                if (value_array.length == 0) {
                    n['good-word'] = true;
                    n['color'] = n['original_color'];
                    n['size']  = 1;
                
                } else if (option == 'CTSL Selected Fingers' || option == 'ASL Selected Fingers') {
                    if (node_value != 'thumb') {
                        fingers = node_value.replace('i', 'index').replace('m', 'middle').replace('r', 'ring').replace('p', 'pinky').match(/((pinky)|(ring)|(middle)|(index))/g);
                    } else {
                        fingers = ['thumb'];
                    }

                    // removes 'thumb' from value_array if more than one finger present value_array                    
                    if (value_array.indexOf('thumb') > -1 && value_array.length > 1) {
                        value_array = value_array.slice(0, value_array.length - 1);
                    }

                    if (fingers && array_intersection(fingers, value_array).length == fingers.length && array_intersection(fingers, value_array).length == value_array.length) {
                        n['good-word'] = true;
                        n['color'] = n['original_color'];
                        n['size']  = 1;    
                    } else {
                        n['good-word'] = false;
                        n['color'] = '#D8D8D8';
                        n['size'] = 0.5;
                        break;
                    }

                } else if (value_array.indexOf(String(node_value)) > -1) {
                    n['good-word'] = true;
                    n['color'] = n['original_color'];
                    n['size']  = 1;

                } else {
                    n['good-word'] = false;
                    n['color'] = '#D8D8D8';
                    n['size'] = 0.5;
                    break;
                }

            // if option is a continuous option
            } else if (filter_data[option]['type'] == 'continuous') {
                var node_value = n['attributes'][option];
                var valA = filter_data[option].valueA;
                var valB = filter_data[option].valueB;

                if ((valA == null || node_value >= valA) &&
                    (valB == null || node_value <= valB)) {
                    n['good-word'] = true;
                    n['color'] = n['original_color'];
                    n['size']  = 1;
                } else {
                    n['good-word'] = false;
                    n['color'] = '#D8D8D8';
                    n['size'] = 0.5;
                    break;
                }
            }


        }
        if (n['good-word']) node_count++;
    });

    updateNodeFilterCount(node_count);
}

function updateEdges() {
    s.graph.edges().forEach(function(e) {
        if (s.graph.nodes(e['source'])['good-word'] && s.graph.nodes(e['target'])['good-word']) {
            e['color'] = s.graph.nodes(e['source'])['color']
        } else {
            e['color'] = '#D8D8D8';
        }
    });
}

function removeFilters() {
    for (option in filter_data) {
        if (filter_data[option]['type'] == 'boolean') {
            filter_data[option]['value'] = null;

        } else if (filter_data[option]['type'] == 'categorical') {
            filter_data[option]['allowed'] = [ ];

        } else if (filter_data[option]['type'] == 'continuous') {
            filter_data[option]['valueA'] = null;
            filter_data[option]['valueB'] = null;
        }
    }

    updateNodes();
    updateEdges();

    s.refresh();
}

function graphSearch(value) {
    s.graph.nodes().forEach(function(n) {
        if (n['label'] == value && n['good-word'])  refreshData(n);
        else if (n['label'] == value) nodeNotice();
    });
}

function refreshData(node) {
    // clear contents
    $('#data-container p').not('#about-data').remove();
    $('#data-container iframe').remove();
    $('#data-container br').remove();
    $('#about-data').css('display', 'block');

    popup_about_2 = new jBox('Modal',{
        attach: $('#about-data'),
        width: 550,
        height: 400,
        title: "What The Data Means",
        content: $('#jBox-about-data-grab'),
    });

    // get video IDs
    ctsl_video_ID = node['attributes']['CTSL Video Link'];
    asl_video_ID  = node['attributes']['ASL Video Link'];

    // english and turkish gloss
    $('#data-container').append('<br /><p>English Gloss: ' + node['attributes']['English Gloss'] + '</p><p>Turkish Gloss: ' + node['attributes']['Turkish Gloss'] + '</p>');

    // CTSL information header
    $('#data-container').append('<br /><p style="margin-bottom:-10px;"><span style="font-size:15px;"><b>CTSL Information</b></span></p>');

    // show CTSL video
    if (ctsl_video_ID != '#') {
        var videoLink = "https://www.youtube.com/embed/" + ctsl_video_ID + "?showinfo=0&rel=0&loop=1&modestbranding=1&controls=0";
        $('#data-container').append('<iframe id="ctsl_vid" width="100%" src="' + videoLink + '" style="margin-top:15px;" frameborder="0"></iframe>');
    }

    // CTSL Phonology
    $('#data-container').append('<br /><p><b>Phonology</b></p>');
    var attribute_list = ['CTSL Selected Fingers','CTSL Flexion','CTSL Path Movement','CTSL Major Location'];
    for (i = 0; i < attribute_list.length; i++) {
        if (node['attributes'][attribute_list[i]] != undefined) {
            if (attribute_list[i] == 'CTSL Selected Fingers') {
                $('#data-container').append('<p>' + attribute_list[i] + ': ' + convertSelectedFingers(node['attributes'][attribute_list[i]]) + '</p>');
            } else {
                $('#data-container').append('<p>' + attribute_list[i] + ': ' + node['attributes'][attribute_list[i]] + '</p>');
            }
        }
    }

    // CTSL Iconicity
    $('#data-container').append('<br /><p><b>Iconicity</b></p>');
    var attribute_list = ['CTSL Turkish Iconicity (M)','CTSL Turkish Iconicity (Z)','CTSL American Iconicity (M)','CTSL American Iconicity (Z)'];
    for (i = 0; i < attribute_list.length; i++) {
        if (node['attributes'][attribute_list[i]] != undefined) {
            $('#data-container').append('<p>' + attribute_list[i] + ': ' + node['attributes'][attribute_list[i]] + '</p>');
        }
    }

    // CTSL Neighborhood Density
    $('#data-container').append('<br /><p><b>Neighborhood Density</b></p>');
    var attribute_list = ['CTSL Parameter Based Neighborhood Density'];
    for (i = 0; i < attribute_list.length; i++) {
        if (node['attributes'][attribute_list[i]] != undefined) {
            $('#data-container').append('<p>' + attribute_list[i] + ': ' + node['attributes'][attribute_list[i]] + '</p>');
        }
    }



    // ASL information header
    $('#data-container').append('<br /><p style="margin-bottom:-10px; margin-top:15px;"><span style="font-size:15px;"><b>ASL Information</b></span></p>');

    // show ASL video
    if (asl_video_ID != '#') {
        var videoLink = "https://www.youtube.com/embed/" + asl_video_ID + "?showinfo=0&rel=0&loop=1&modestbranding=1&controls=0";
        $('#data-container').append('<iframe id="ctsl_vid" width="100%" src="' + videoLink + '" style="margin-top:15px;" frameborder="0"></iframe>');
    }

    // ASL Phonology
    $('#data-container').append('<br /><p><b>Phonology</b></p>');
    var attribute_list = ['ASL Selected Fingers','ASL Flexion','ASL Path Movement','ASL Major Location','ASL Minor Location','ASL Sign Type'];
    for (i = 0; i < attribute_list.length; i++) {
        if (node['attributes'][attribute_list[i]] != undefined) {
            if (attribute_list[i] == 'ASL Selected Fingers') {
                $('#data-container').append('<p>' + attribute_list[i] + ': ' + convertSelectedFingers(node['attributes'][attribute_list[i]]) + '</p>');
            } else {
                $('#data-container').append('<p>' + attribute_list[i] + ': ' + node['attributes'][attribute_list[i]] + '</p>');
            }
        }
    }

    // ASL Iconicity
    $('#data-container').append('<br /><p><b>Iconicity</b></p>');
    var attribute_list = ['ASL Iconicity (M)', 'ASL Iconicity (Z)'];
    for (i = 0; i < attribute_list.length; i++) {
        if (node['attributes'][attribute_list[i]] != undefined) {
            $('#data-container').append('<p>' + attribute_list[i] + ': ' + node['attributes'][attribute_list[i]] + '</p>');
        }
    }

    // ASL Neighborhood Density
    $('#data-container').append('<br /><p><b>Neighborhood Density</b></p>');
    var attribute_list = ['ASL Parameter Based Neighborhood Density'];
    for (i = 0; i < attribute_list.length; i++) {
        if (node['attributes'][attribute_list[i]] != undefined) {
            $('#data-container').append('<p>' + attribute_list[i] + ': ' + node['attributes'][attribute_list[i]] + '</p>');
        }
    }

    // ASL Frequency
    $('#data-container').append('<br /><p><b>Frequency</b></p>');
    var attribute_list = ['ASL Sign Frequency (M)','ASL Sign Frequency (Z)'];
    for (i = 0; i < attribute_list.length; i++) {
        if (node['attributes'][attribute_list[i]] != undefined) {
            $('#data-container').append('<p>' + attribute_list[i] + ': ' + node['attributes'][attribute_list[i]] + '</p>');
        }
    }

    // ASL Lexical Properties
    $('#data-container').append('<br /><p><b>Lexical Properties</b></p>');
    var attribute_list = ['ASL Compound', 'ASL Initialized', 'ASL Lexical Class', 'ASL Fingerspelled Loan Sign'];
    for (i = 0; i < attribute_list.length; i++) {
        if (node['attributes'][attribute_list[i]] != undefined) {
            if (attribute_list[i] == 'ASL Lexical Class') {
                $('#data-container').append('<p>' + attribute_list[i] + ': ' + node['attributes'][attribute_list[i]] + '</p>');
            } else {
                $('#data-container').append('<p>' + attribute_list[i] + ': ' + (node['attributes'][attribute_list[i]] == "0" ? "FALSE" : "TRUE") + '</p>');
            }
        }
    }

    // zooms in on the node being viewed
    sigma.misc.animation.camera(
        s.camera, {
            x: node['read_cam0:x'],
            y: node['read_cam0:y'],
            ratio: 0.13,
        }, {
            duration: s.settings('animationsTime') || 300
    });

    // display the "sign-data" tab
    $('.tabs li').removeClass('selected');
    $('#filter-container, #about-container').css('display','none');
    $('#data-tab').addClass('selected');
    $('#data-container').css('display','block');
}

function nodeNotice() {
    new jBox('Notice',{
        content: "Word Disabled Due to Filter",
        autoClose: 1500,
        attributes: {
            x: 'right',
            y: 'top'
        },
        position: {
            x: 70,
            y: 7,
        }
    });
}

function downloadFile() {

    downloader_name = $('#entry_1648166315').val();
    downloader_affiliation = $('#entry_1482297859').val();
    downloader_email = $('#entry_333829021').val();

    if (downloader_name.length > 0 && downloader_affiliation.length > 0 && downloader_email.match(/.*\@.*\./g) != null) {

        download_attr = [ ];

        var options = $('#jBox-download-grab form#checkbox_container .ui-checkbox');

        for (i = 0; i < options.length; i++) {
            var checkbox = options[i];

            if ($($(checkbox).children()[1]).prop('checked')) {
                download_attr.push(options[i].innerText.substring(0, options[i].innerText.length - 1));
            }
        }

        if ($('#radio-choice-a:checked').val() == undefined) setFilteredDownloadLink();
        else setAllDownloadLink();

        // simulate clicking the submit buttons for the google form (sending download information to form)
        // and simulate download button with link
        $('#download_link2')[0].click();
        $('#ss-submit').click();
        
    } else {
        $('#google_form_error').css('display', 'inline');
        setTimeout(function() {
            $('#google_form_error').css('display', 'none');
        }, 2000);
    } 
}

function setFilteredDownloadLink() {

    var link = 'data:application/octet-stream,';
    var valid_nodes = [ ];
    var shift_col_char = '%2C';
    var shift_row_char = '%0A';

    link += 'English Gloss' + shift_col_char + 'Turkish Gloss' + shift_col_char;

    for (i = 0; i < download_attr.length; i++) {
        link += download_attr[i].replace(",","-");

        if (i != download_attr.length - 1) link += shift_col_char;
        else link += shift_row_char;
    }

    // get non-filtered out signs
    s.graph.nodes().forEach(function(n) {
        if (n['good-word']) valid_nodes.push(n);
    });

    // add data to download_link
    for (i = 0; i < valid_nodes.length; i++) {
        link += valid_nodes[i]['attributes']['English Gloss'] + shift_col_char + valid_nodes[i]['attributes']['Turkish Gloss'] + shift_col_char;
        for (j = 0; j < download_attr.length; j++) {

            link += valid_nodes[i]['attributes'][download_attr[j]];

            if (j != download_attr.length - 1) link += shift_col_char;
        }

        link += shift_row_char;
    }

    $('#download_link2').attr('href',link);
}

function setAllDownloadLink() {

    var link = 'data:application/octet-stream,';
    var valid_nodes = [ ];
    var shift_col_char = '%2C';
    var shift_row_char = '%0A';

    link += 'English Gloss' + shift_col_char + 'Turkish Gloss' + shift_col_char;

    // make headerline (with attribute titles)
    for (i = 0; i < download_attr.length; i++) {
        link += download_attr[i].replace(",","-");

        if (i != download_attr.length - 1) link += shift_col_char;
        else link += shift_row_char;
    }

    // get non-filtered out signs
    s.graph.nodes().forEach(function(n) {
        valid_nodes.push(n);
    });

    // add data to download_link
    for (i = 0; i < valid_nodes.length - 1; i++) {
        link += valid_nodes[i]['attributes']['English Gloss'] + shift_col_char + valid_nodes[i]['attributes']['Turkish Gloss'] + shift_col_char;
        for (j = 0; j < download_attr.length; j++) {

            link += valid_nodes[i]['attributes'][download_attr[j]];

            if (j != download_attr.length - 1) link += shift_col_char;
        }

        link += shift_row_char;
    }

    $('#download_link2').attr('href',link);
}

function updateNodeFilterCount(node_count) {
    // setting node count
    $('#active_nodes_p span').html(node_count);

    // set active filters
    $('#active_filters_list').html('');
    for (filter in filter_data) {
        data = filter_data[filter];
        if ((data.type == 'continuous' && (data.valueA != null || data.valueB != null)) || (data.type == 'boolean' && data.value != null) || (data.type == 'categorical' && data.allowed.length != 0)) {
            $('#active_filters_list').append('<li>' + filter + '</li>');
        }
    }
    if ($('#active_filters_list').html() != "") {
        $('.active_filters').css({'display': 'initial'});
    } else {
        // don't display active filters
        $('.active_filters').css({'display': 'none'});
    }
}

function showActiveFilters() {
    $('#active_filters_list').toggle();

    if ($('#active_filters_list').is(":visible")) {
        $('#active_filters_arrow').css('-webkit-transform', 'rotate(0)');
        $('#active_filters_arrow').css('-ms-transform', 'rotate(0)');
        $('#active_filters_arrow').css('transform', 'rotate(0)');
    } else {
        $('#active_filters_arrow').css('-webkit-transform', 'rotate(-90deg)');
        $('#active_filters_arrow').css('-ms-transform', 'rotate(-90deg)');
        $('#active_filters_arrow').css('transform', 'rotate(-90deg)');
    }
}

function convertSelectedFingers(string) {
    if (string == "thumb") return string;

    s1 = string.replace('i', 'index, ').replace('m', 'middle, ').replace('r', 'ring, ').replace('p', 'pinky, ');
    return s1.substr(0,s1.length - 2);
}

function checkSelectedFingers(array, value) {
    console.log(array, ' - ', value);
    return false;
}

function array_intersection(a, b) {
    if (a == null || b == null) return [ ];

    var a = a.sort(), b = b.sort();
    var ai = 0, bi = 0;
    var result = new Array();

    while( ai < a.length && bi < b.length ){
        if      (a[ai] < b[bi] ){ ai++; }
        else if (a[ai] > b[bi] ){ bi++; }
        else /* they're equal */ {
            result.push(a[ai]);
            ai++;
            bi++;
        }
    }

    return result;
}
