/**
 * Escape a value for safe insertion into HTML text or a quoted attribute.
 * Values read from the DB (IP, country, city, browser...) must never be
 * injected into the DOM unescaped.
 */
// Security: convert an HTML string to plain text WITHOUT executing it.
// DOMParser builds an inert document (no script execution, no image loads),
// unlike innerHTML on a live element where <img onerror> would fire.
function ahcfreeStripHtml(html) {
	if (html === null || html === undefined) return '';
	try {
		var doc = new DOMParser().parseFromString(String(html), 'text/html');
		return (doc.body && doc.body.textContent) || '';
	} catch (e) {
		return String(html).replace(/<[^>]*>/g, '');
	}
}

// Recent visitors: engaged time as a readable, color-coded tag.
// seconds = null/undefined -> not measured (visit recorded before 8.18).
function ahcfreeDurationTag(seconds, fallback) {
	if (seconds === null || seconds === undefined || seconds === '') {
		return '<span class="ahcfree-rv-dur is-none" title="Not measured (recorded before version 8.18)">' + ahcfreeEscHtml(fallback && fallback !== '-' ? fallback : '–') + '</span>';
	}
	var s = Math.max(0, parseInt(seconds, 10) || 0);
	var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
	var text = h > 0 ? h + ' hr' + (m ? ' ' + m + ' min' : '') : (m > 0 ? m + ' min' + (sec ? ' ' + sec + ' sec' : '') : (s > 0 ? sec + ' sec' : '< 5 sec'));
	var tier = s < 60 ? 'is-short' : (s < 600 ? 'is-medium' : 'is-long');
	return '<span class="ahcfree-rv-dur ' + tier + '" title="Time on site (active, visible tab)">' + text + '</span>';
}

function ahcfreeEscHtml(value) {
	return String(value === null || value === undefined ? '' : value)
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}


var colors = ['#DB6946', '#C14543', '#445060', '#395953', '#6C8C80', '#829AB5', '#BF807A', '#BF0000', '#006BB7', '#EC732C', '#BF3D27', '#A6375F',
	'#8C6D46', '#326149', '#802B35', '#8A3842', '#366D73', '#4D6173', '#4A4659', '#C9D65B', '#F45552', '#F3CC5E', '#F29B88', '#D96941',
	'#484F73', '#C9AB81', '#F5655C', '#F0C480'];

jQuery(document).ready(function () {




	if (typeof google === 'object' && typeof google.maps === 'object') {
		return;
	} else {

	}



});
//------------------------------------------------------------------------------				
function convertToNumeric(data) {
	if (data instanceof Array) {
		for (var index in data) {
			data[index] = Number(data[index]);
		}
	} else {
		data = Number(data);
	}
	return data;
}
//------------------------------------------------------------------------------
function getRandomElementFromArray(array) {
	var ranIndex = Math.floor(Math.random() * array.length);
	return array[ranIndex];
}
//------------------------------------------------------------------------------
function drawVisitsLineChart(visitsData) {
	var randomScalingFactor = function () { return Math.round(Math.random() * 100) };

	var barChartData = {
		labels: visitsData.data.dates,
		datasets: [
			{
				label: "Visitors",
				barShowStroke: false,
				fillColor: "rgba(75,178,1970,.5)",
				strokeColor: "rgba(75,178,1970,.5)",
				highlightFill: "rgba(220,220,220,0.75)",
				highlightStroke: "rgba(220,220,220,1)",
				data: visitsData.data.visitors
			},
			{
				label: "Visits",
				barShowStroke: false,
				fillColor: "rgba(234,162,40,0.5)",
				strokeColor: "rgba(234,162,40,0.5)",
				highlightFill: "rgba(151,187,205,0.75)",
				highlightStroke: "rgba(151,187,205,1)",
				data: visitsData.data.visits
			}
		]

	}
	var ctx = document.getElementById("visitorsVisitsChart").getContext("2d");
	window.myBar = new Chart(ctx).Bar(barChartData, {
		responsive: true
	});
}
//------------------------------------------------------------------------------





function isEmpty(val) {
	return (val == null || val == 0 || val == '' || val == '0');
}

//------------------------------------------------------------------------------
function countVisits(arr) {
	var count = 0;
	for (var i = 0; i < arr.length; i++) {
		count += Number(arr[i]);
	}
	return count;
}
//------------------------------------------------------------------------------

jQuery(document).ready(function () {

	//------------------------------------------
	//if(visitsData.success && typeof visitsData.data != 'undefined'){
	//var duration = jQuery('#hits-duration').val();
	//drawVisitsLineChart( mystart_date, myend_date, '1 day', visitors_data, visits_data, duration );
	//}
	//------------------------------------------

	//------------------------------------------

	//------------------------------------------
	jQuery.fn.dataTable.ext.errMode = 'none';
	/* Optimized Traffic by Title - DataTable Implementation */
	if (jQuery('#traffic_by_title').length) {
		trafficByTitleTableOptimized();
	}

	function trafficByTitleTableOptimized() {
		jQuery('#traffic_by_title').DataTable({
			"pageLength": 10,
			"searching": true,
			"ordering": false,
			"bLengthChange": false,
			"bFilter": true,
			"bInfo": false,
			"bAutoWidth": false,
			"bJQueryUI": true,
			"processing": true,
			"serverSide": true,
			ajax: ahc_ajax.ajax_url + '?action=traffic_by_title',
			dataSrc: 'data',
			// 8.18: the row expands inline (no popup); per-page statistics are a Pro feature.
			createdRow: function (row) {
				jQuery(row).addClass('ahcfree-tt-row').attr({ tabindex: '0', 'aria-expanded': 'false' });
			},
			columns: [
				{
					data: 'rank',
					defaultContent: '',
					render: function (data, type) {
						if (type !== 'display') return data;
						var r = parseInt(data, 10) || 0;
						return '<span class="ahcfree-tt-rank' + (r > 0 && r <= 3 ? ' is-top r' + r : '') + '">' + (r || '-') + '</span>';
					}
				},
				{ data: 'til_page_title', defaultContent: '' },
				{
					data: 'til_hits',
					defaultContent: '0',
					render: function (data, type) {
						if (type !== 'display') return data;
						return '<span class="ahcfree-tt-num">' + (parseInt(data, 10) || 0).toLocaleString() + '</span>';
					}
				},
				{
					data: 'percent',
					defaultContent: '0%',
					render: function (data, type) {
						if (type !== 'display') return data;
						var v = parseFloat(String(data)) || 0;
						var w = Math.max(0, Math.min(100, v));
						return '<span class="ahcfree-tt-share"><span class="ahcfree-tt-bar"><span style="width:' + w + '%"></span></span>' +
							'<span class="ahcfree-tt-pct">' + v.toFixed(1) + '%</span></span>';
					}
				},
				{
					data: null,
					defaultContent: '',
					render: function (data, type) {
						if (type !== 'display') return '';
						return '<span class="ahcfree-tt-btn"><span class="dashicons dashicons-chart-area" aria-hidden="true"></span>Stats' +
							'<span class="dashicons dashicons-arrow-down-alt2 ahcfree-tt-chevron" aria-hidden="true"></span></span>';
					}
				}
			],
			language: {
				searchPlaceholder: "Search titles...",
				processing: "<span class='loader'>&nbsp;</span>",
				"zeroRecords": "No page views recorded yet.",
				paginate: {
					next: '<i class="dashicons dashicons-arrow-right-alt2"></i>',
					previous: '<i class="dashicons dashicons-arrow-left-alt2"></i>'
				}
			},
			"fnDrawCallback": function (oSettings) {
				if (oSettings._iDisplayLength > oSettings.fnRecordsDisplay()) {
					jQuery(oSettings.nTableWrapper).find('.dataTables_paginate').hide();
				}
			},
			dom: 'Bfrtip',
			buttons: [{
				extend: 'excelHtml5',
				title: "",
				action: function (e, dt, node, config) {
					var processing = jQuery("#traffic_by_title").parents(".panelcontent").find(".dataTables_processing");
					processing.show();

					jQuery.ajax({
						url: ahc_ajax.ajax_url + '?action=traffic_by_title&page=all',
						data: dt.ajax.params(),
						success: function (res, status, xhr) {
							try {
								// If server returns false, use current table data
								if (res === false || res === 'false' || !res) {
									var currentData = dt.rows().data().toArray();
									if (currentData && currentData.length > 0) {
										exportCurrentTableData(currentData);
									} else {
										alert('No data available for export.');
									}
									return;
								}

								var xlsRows;

								// Try to parse JSON
								if (typeof res === 'string') {
									xlsRows = JSON.parse(res);
								} else if (typeof res === 'object' && res.data) {
									xlsRows = res.data;
								} else if (Array.isArray(res)) {
									xlsRows = res;
								} else {
									xlsRows = res;
								}

								// Check if data is valid
								if (!xlsRows || !Array.isArray(xlsRows) || xlsRows.length === 0) {
									var currentData = dt.rows().data().toArray();
									if (currentData && currentData.length > 0) {
										exportCurrentTableData(currentData);
									} else {
										alert('No data available for export.');
									}
									return;
								}

								exportServerData(xlsRows);

							} catch (error) {
								// Fallback: export current table data
								try {
									var currentData = dt.rows().data().toArray();
									if (currentData && currentData.length > 0) {
										exportCurrentTableData(currentData);
									} else {
										alert('Export failed and no table data available.');
									}
								} catch (fallbackError) {
									alert('Export failed. Please try again.');
								}
							} finally {
								processing.hide();
							}
						},
						error: function (xhr, status, error) {
							processing.hide();

							// Fallback: export current table data
							try {
								var currentData = dt.rows().data().toArray();
								if (currentData && currentData.length > 0) {
									exportCurrentTableData(currentData);
								} else {
									alert('Export failed and no table data available.');
								}
							} catch (fallbackError) {
								alert('Export failed. Please try again.');
							}
						}
					});

					// Function to export server data
					function exportServerData(xlsRows) {
						var xlsHeader = ["Rank", "Title", "Hits", "Percentage"];
						var createXLSLFormatObj = [xlsHeader];

						jQuery.each(xlsRows, function (index, value) {
							var cleanTitle = value.til_page_title || value.title || '';

							// Remove HTML tags from title
							if (cleanTitle && typeof cleanTitle === 'string') {
								cleanTitle = ahcfreeStripHtml(cleanTitle);
							}

							var innerRowData = [
								value.rank || index + 1,
								cleanTitle,
								value.til_hits || value.hits || 0,
								value.percent || value.percentage || '0%'
							];
							createXLSLFormatObj.push(innerRowData);
						});

						createExcelFile(createXLSLFormatObj);
					}

					// Function to export current table data (fallback)
					function exportCurrentTableData(tableData) {
						var xlsHeader = ["Rank", "Title", "Hits", "Percentage"];
						var createXLSLFormatObj = [xlsHeader];

						jQuery.each(tableData, function (index, rowData) {
							var cleanTitle = rowData.til_page_title || rowData.title || '';

							// Remove HTML tags from title
							if (cleanTitle && typeof cleanTitle === 'string') {
								cleanTitle = ahcfreeStripHtml(cleanTitle);
							}

							var innerRowData = [
								rowData.rank || index + 1,
								cleanTitle,
								rowData.til_hits || rowData.hits || 0,
								rowData.percent || rowData.percentage || '0%'
							];
							createXLSLFormatObj.push(innerRowData);
						});

						createExcelFile(createXLSLFormatObj);
					}

					// Function to create Excel file
					function createExcelFile(data) {
						var wb = XLSX.utils.book_new();
						var ws = XLSX.utils.aoa_to_sheet(data);
						XLSX.utils.book_append_sheet(wb, ws, "Traffic by Title");
						XLSX.writeFile(wb, "traffic_by_title.xlsx");
					}
				}
			}]
		});

		// 8.18: a row expands inline (DataTables child row) instead of opening a
		// popup. Per-page statistics are a Pro feature: the free version shows an
		// illustrative, blurred sample (never this page's real data) + upgrade link.
		function ahcfreeLockedPageStats() {
			var bars = [38, 52, 45, 61, 57, 74, 66, 80, 71, 88, 76, 92, 84, 97];
			var chart = bars.map(function (h) { return '<i style="height:' + h + '%"></i>'; }).join('');
			var kpis = [['Visitors', '1,284'], ['Avg. time', '2m 41s'], ['Bounce rate', '38%'], ['Top source', 'Google']];
			var cards = kpis.map(function (k) { return '<div><span class="k">' + k[0] + '</span><span class="v">' + k[1] + '</span></div>'; }).join('');
			return '<div class="ahcfree-tt-locked">' +
				'<div class="ahcfree-tt-sample" aria-hidden="true">' +
					'<div class="ahcfree-tt-sample-kpis">' + cards + '</div>' +
					'<div class="ahcfree-tt-sample-chart">' + chart + '</div>' +
				'</div>' +
				'<div class="ahcfree-rv-journey-lock">' +
					'<span class="ahcfree-rv-journey-icon"><span class="dashicons dashicons-lock" aria-hidden="true"></span></span>' +
					'<div><b>See how this page performs</b><br>' +
					'<span>Daily views, visitors, time on page, bounce rate and traffic sources for every page are available in the Pro version.</span></div>' +
					'<a class="ahcfree-rv-journey-btn" target="_blank" rel="noopener" href="https://www.wp-buy.com/product/visitors-traffic-real-time-statistics-pro/?attribute_license=Single%20License%2029$&page_stats=true">Unlock with Pro</a>' +
				'</div>' +
			'</div>';
		}

		jQuery('#traffic_by_title')
			.off('.ahcfreePageStats')
			.on('keydown.ahcfreePageStats', 'tbody > tr.ahcfree-tt-row', function (e) {
				if (e.target === this && (e.key === 'Enter' || e.key === ' ')) {
					e.preventDefault();
					jQuery(this).trigger('click');
				}
			})
			.on('click.ahcfreePageStats', 'tbody > tr.ahcfree-tt-row', function (e) {
				// The page link keeps working; selecting text does not toggle.
				if (jQuery(e.target).closest('a').length) return;
				if (window.getSelection && String(window.getSelection()).length) return;
				var tr = jQuery(this);
				var dtRow = jQuery('#traffic_by_title').DataTable().row(tr);
				if (!dtRow.data()) return;
				if (dtRow.child.isShown()) {
					dtRow.child.hide();
					tr.removeClass('ahcfree-tt-open').attr('aria-expanded', 'false');
				} else {
					dtRow.child(ahcfreeLockedPageStats(), 'ahcfree-tt-child').show();
					tr.addClass('ahcfree-tt-open').attr('aria-expanded', 'true');
				}
			});
	}

	// Simple CSS for the stats button
	jQuery(document).ready(function ($) {
		// Add CSS for the stats button
		var buttonStyles = `
        <style>
            .ahc-stats-cell {
                text-align: center;
            }
            .ahc-stats-button {
                background: none;
                border: none;
                cursor: pointer;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 2px;
                padding: 4px;
                border-radius: 4px;
                transition: background-color 0.2s;
                color: #2271b1;
                text-decoration: none;
            }
            .ahc-stats-button:hover {
                background-color: #f0f6ff;
            }
            .ahc-stats-button .ahc-icon:before {
                content: "\\f185";
                color: #1DAE22;
                font-family: dashicons;
                font-size: 16px;
            }
            .ahc-stats-button .stat-number {
                font-size: 13px;
                font-weight: 500;
            }
        </style>
    `;

		$('head').append(buttonStyles);
	});
	if (jQuery('#traffic_sources_table').length && jQuery('#traffic_sources_table tbody tr').length > 0) {
		jQuery('#traffic_sources_table').DataTable({
			"pageLength": 10,
			"searching": false,
			"ordering": true,
			"bLengthChange": false,
			"bFilter": true,
			"bInfo": false,
			"bJQueryUI": true,
			"order": [[0, "asc"]],
			language: {
				"zeroRecords": "No traffic sources data available.",
				paginate: {
					next: '<i class="dashicons dashicons-arrow-right-alt2"></i>',
					previous: '<i class="dashicons dashicons-arrow-left-alt2"></i>'
				}
			},
			"fnDrawCallback": function (oSettings) {
				if (oSettings._iDisplayLength > oSettings.fnRecordsDisplay()) {
					jQuery(oSettings.nTableWrapper).find('.dataTables_paginate').hide();
				}
			},
			columnDefs: [
				{
					targets: [1, 3],
					orderable: false
				}
			],
			dom: 'Bfrtip',
			buttons: [{
				extend: 'excelHtml5',
				title: "Traffic Sources Report",
				filename: "Traffic_Sources_Report",
				exportOptions: {
					columns: [0, 1, 2, 3, 4],
					format: {
						body: function (data, row, col, node) {
							// Strip HTML tags and clean text
							let cleanText = ahcfreeStripHtml(data);

							// Clean up whitespace
							cleanText = cleanText.replace(/\s+/g, ' ').trim();

							return cleanText;
						}
					}
				}
			}]
		});
	}
	if (jQuery('#lasest_search_words').length) {
		latestSearchTable();
	}
	function latestSearchTable() {
		jQuery('#lasest_search_words').DataTable({
			"pageLength": 10,
			"searching": false,
			"ordering": false,
			"bLengthChange": false,
			"bFilter": true,
			"bInfo": false,
			"bJQueryUI": true,
			"processing": true,
			"serverSide": true,
			ajax: ahc_ajax.ajax_url + '?action=latest_search_words&fdt=' + jQuery("#from_dt").val() + "&tdt=" + jQuery("#to_dt").val(),
			dataSrc: 'data',
			columnDefs: [{
				targets: 1,
				className: 'hide'
			}],
			columns: [
				{ data: 'img' },
				{ data: 'csb' },
				{ data: 'keyword' },
				{ data: 'dt' },
			],
			language: {
				processing: "<span class='loader'>&nbsp;</span>",
				"zeroRecords": "No data available.",
				paginate: {
					next: '<i class="dashicons dashicons-arrow-right-alt2"></i>',
					previous: '<i class="dashicons dashicons-arrow-left-alt2"></i>'
				}
			},
			"fnDrawCallback": function (oSettings) {
				if (oSettings._iDisplayLength > oSettings.fnRecordsDisplay()) {
					jQuery(oSettings.nTableWrapper).find('.dataTables_paginate').hide();
				}
			},
			dom: 'Bfrtip',
			buttons: [{
				extend: 'excelHtml5',
				title: "",
				action: function (e, dt, node, config) {
					jQuery("#lasest_search_words").parents(".panelcontent").find(".dataTables_processing").show();
					jQuery.ajax({
						url: ahc_ajax.ajax_url + '?action=latest_search_words&page=all&fdt=' + jQuery("#from_dt").val() + "&tdt=" + jQuery("#to_dt").val(),
						data: dt.ajax.params(),
						success: function (res, status, xhr) {
							//console.log(res);

							var createXLSLFormatObj = [];

							/* XLS Head Columns */
							var xlsHeader = ["Country/SE/Browser", "Keyword", "Date"];

							/* XLS Rows Data */
							var xlsRows = JSON.parse(res);

							createXLSLFormatObj.push(xlsHeader);
							jQuery.each(xlsRows, function (index, value) {
								var innerRowData = [];
								jQuery.each(value, function (ind, val) {
									innerRowData.push(val);
								});
								createXLSLFormatObj.push(innerRowData);
							});
							jQuery("#lasest_search_words").parents(".panelcontent").find(".dataTables_processing").hide();
							/* File Name */
							var filename = "latest_search_words.xlsx";

							/* Sheet Name */
							var ws_name = "sheet1";

							if (typeof console !== 'undefined') console.log(new Date());
							var wb = XLSX.utils.book_new(),
								ws = XLSX.utils.aoa_to_sheet(createXLSLFormatObj);

							/* Add worksheet to workbook */
							XLSX.utils.book_append_sheet(wb, ws, ws_name);

							/* Write workbook and Download */
							if (typeof console !== 'undefined') console.log(new Date());
							XLSX.writeFile(wb, filename);
							if (typeof console !== 'undefined') console.log(new Date());

						}
					})
				},
				exportOptions: {
					columns: [1, 2, 3]
				},
			}],

		});

	}

	if (jQuery('#top_refering_sites').find("tr").length > 1) {
		jQuery('#top_refering_sites').DataTable({
			"pageLength": 10,
			"searching": false,
			"ordering": false,
			"bLengthChange": false,
			"bFilter": true,
			"bInfo": false,
			"bAutoWidth": false,
			language: {
				paginate: {
					next: '<i class="dashicons dashicons-arrow-right-alt2"></i>',
					previous: '<i class="dashicons dashicons-arrow-left-alt2"></i>'
				}
			},
			"fnDrawCallback": function (oSettings) {
				if (oSettings._iDisplayLength > oSettings.fnRecordsDisplay()) {
					jQuery(oSettings.nTableWrapper).find('.dataTables_paginate').hide();
				}
			},
			dom: 'Bfrtip',
			buttons: [{
				extend: 'excelHtml5',
				title: "Top Referring Sites"
			}]
		});
	}
	if(jQuery('#recent_visit_by_ip').length) {
		recentVisitorsOptimized();
	}
	
	function recentVisitorsOptimized() {
		// Wait a bit for DOM to be fully ready (like pro version)
		setTimeout(function() {
			initializeTable();
		}, 100);
	}
	
	function initializeTable() {
		// Check if table element exists
		if (jQuery('#recent_visit_by_ip').length === 0) {
			return;
		}
	
		// Function to get form values (send exact date range)
		function getFormValues() {
			var fromDate = jQuery("#r_from_dt").val() || '';
			var toDate = jQuery("#r_to_dt").val() || '';
			var ip = jQuery("#ip_addr").val() || '';
			
			return { 
				from_date: fromDate,
				to_date: toDate, 
				ip: ip 
			};
		}
	
		// Initialize DataTable (exact same structure as pro version)
		var table = jQuery('#recent_visit_by_ip').DataTable({
			"pageLength": 10,
			"searching": false,
			"ordering": false,
			"bLengthChange": false,
			"bFilter": false,
			"bInfo": false,
			"bAutoWidth": false,
			"bJQueryUI": true,
			"processing": true,
			"serverSide": true,
			"lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]],
			ajax: {
				url: ahc_ajax.ajax_url + '?action=recent_visitor_by_ip',
				type: 'GET',
				data: function(d) {
					var formValues = getFormValues();
					
					// Add the exact date range values
					d.from_date = formValues.from_date;
					d.to_date = formValues.to_date;
					d.ip = formValues.ip;
					
					return d;
				},
				dataSrc: 'data',
				error: function(xhr, error, thrown) {
					// Silent error handling
				}
			},
			// 8.18: the whole row is clickable and expands inline (no popup).
			createdRow: function (row) {
				jQuery(row).addClass('ahcfree-rv-row').attr({ tabindex: '0', 'aria-expanded': 'false' });
			},
			columns: [
				{ data: 'hit_ip_address' },
				{ data: 'ctr_name' },
				{ data: 'time' },
				{
					// Readable, color-tagged engaged time ("2 min 5 sec").
					data: 'duration',
					defaultContent: '-',
					render: function (data, type, row) {
						if (type !== 'display') {
							return data;
						}
						return ahcfreeDurationTag(row.duration_seconds, data);
					}
				},
				{
					data: 'day_hits',
					className: 'ahcfree-rv-views-cell',
					render: function (data, type) {
						var n = parseInt(String(data).replace(/<[^>]*>/g, ''), 10) || 1;
						if (type !== 'display') {
							return n;
						}
						return '<span class="ahcfree-rv-views" title="Pages viewed">' + n + '</span>' +
							'<span class="dashicons dashicons-arrow-down-alt2 ahcfree-rv-chevron" aria-hidden="true"></span>';
					}
				}
			],
			language: {
				processing: "<span class='loader'>&nbsp;</span>",
				"zeroRecords": "No visitors recorded yet.",
				paginate: {
					next: '<i class="dashicons dashicons-arrow-right-alt2"></i>',
					previous: '<i class="dashicons dashicons-arrow-left-alt2"></i>'
				}
			},
			"fnDrawCallback": function (oSettings) {
				if (oSettings._iDisplayLength > oSettings.fnRecordsDisplay()) {
					jQuery(oSettings.nTableWrapper).find('.dataTables_paginate').hide();
				}
			},
			dom: 'Bfrtip',
			buttons: [{
				extend: 'excelHtml5',
				title: "",
				action: function (e, dt, node, config) {
					jQuery("#recent_visit_by_ip").parents(".panelcontent").find(".dataTables_processing").show();
					
					// Get current search parameters
					var formValues = getFormValues();
					
					// Make AJAX call for export with all data
					jQuery.ajax({
						url: ahc_ajax.ajax_url + '?action=recent_visitor_by_ip&page=all',
						type: 'GET',
						data: {
							from_date: formValues.from_date,
							to_date: formValues.to_date,
							ip: formValues.ip
						},
						success: function (res) {
							try {
								var response = typeof res === 'string' ? JSON.parse(res) : res;
								processExportData(response || []);
							} catch (error) {
								alert('Export failed. Please try again.');
								jQuery("#recent_visit_by_ip").parents(".panelcontent").find(".dataTables_processing").hide();
							}
						},
						error: function(xhr, status, error) {
							alert('Export failed. Please try again.');
							jQuery("#recent_visit_by_ip").parents(".panelcontent").find(".dataTables_processing").hide();
						}
					});
					
					function processExportData(data) {
						try {
							var columnsToExport = ["hit_ip_address", "ctr_name", "time", "duration", "day_hits"];
							var columnHeaders = ["IP Address", "Location", "Time", "Duration", "Pages"];
	
							var values = data.map(function (item) {
								return columnsToExport.map(function (column) {
									if (column === 'day_hits') {
										if (typeof item[column] === 'string' && item[column].includes('<button')) {
											var match = item[column].match(/>(\d+)</);
											return match ? match[1] : '0';
										}
										return item[column] || '0';
									}
									if (column === 'ctr_name') {
										if (typeof item[column] === 'string') {
											return item[column].replace(/<[^>]*>/g, '');
										}
										return item[column] || '';
									}
									if (column === 'duration') {
										if (typeof item[column] === 'string' && item[column].includes(':')) {
											return item[column];
										}
										if (typeof item[column] === 'number' || !isNaN(item[column])) {
											var totalSeconds = parseInt(item[column]) || 0;
											var hours = Math.floor(totalSeconds / 3600);
											var minutes = Math.floor((totalSeconds % 3600) / 60);
											var seconds = totalSeconds % 60;
											return String(hours).padStart(2, '0') + ':' + 
												   String(minutes).padStart(2, '0') + ':' + 
												   String(seconds).padStart(2, '0');
										}
										return item[column] || '00:00:01';
									}
									return item[column] || '';
								});
							});
	
							var workbook = XLSX.utils.book_new();
							var worksheet = XLSX.utils.aoa_to_sheet([columnHeaders].concat(values));
							
							worksheet['!cols'] = [
								{wch: 15}, // IP Address
								{wch: 30}, // Location
								{wch: 20}, // Time
								{wch: 12}, // Duration
								{wch: 10}  // Day Hits
							];
							
							XLSX.utils.book_append_sheet(workbook, worksheet, 'Recent Visitors');
							XLSX.writeFile(workbook, 'recent_visitors_by_ip.xlsx');
	
						} catch (error) {
							alert('Export failed. Please check console for details.');
						} finally {
							jQuery("#recent_visit_by_ip").parents(".panelcontent").find(".dataTables_processing").hide();
						}
					}
				}
			}]
		});
	
		// Function to reset form values (like pro version)
		function resetFormValues() {
			// Clear all form fields
			jQuery("#r_from_dt").val('');
			jQuery("#r_to_dt").val('');
			jQuery("#ip_addr").val('');
			
			// Clear datepicker if exists
			try {
				if (jQuery.fn.datepicker) {
					jQuery("#r_from_dt, #r_to_dt").datepicker('setDate', null);
				}
			} catch(e) {
				// Ignore datepicker errors
			}
		}
	
		// Use event delegation for form submission (like pro version)
		jQuery(document).on('submit', '.search_frm', function(e) {
			e.preventDefault();
			
			// Reload the DataTable with new parameters
			table.ajax.reload(null, false);
			
			return false;
		});
	
		// Handle submit button click directly (like pro version)
		jQuery(document).on('click', 'input[type="submit"]', function(e) {
			// Only handle buttons in forms related to our table
			if (jQuery(this).closest('.panel').find('#recent_visit_by_ip').length === 0) {
				return; // Not our button
			}
			
			e.preventDefault();
			
			// Reload the DataTable directly
			table.ajax.reload(null, false);
			
			return false;
		});
	
		// Handle clear button (like pro version)
		jQuery(document).on('click', '.clear_form', function(e) {
			// Only handle clear buttons related to our table
			if (jQuery(this).closest('.panel').find('#recent_visit_by_ip').length === 0) {
				return; // Not our button
			}
			
			e.preventDefault();
			
			resetFormValues();
			
			// Reload table with cleared filters
			table.ajax.reload(null, false);
			
			// Close the search panel
			jQuery('.search-panel').removeClass('open');
		});
	
		// Handle search panel toggle (like pro version)
		jQuery('#recent_visit_by_ip').closest('.panel').find('.search_data a').on('click', function(e) {
			e.preventDefault();
			var searchPanel = jQuery(this).closest('.panel').find('.search-panel');
			searchPanel.toggleClass('open');
		});
	
		// 8.18: a row expands inline (DataTables child row) instead of opening a
		// popup. The page-by-page journey is a Pro feature, so the free version
		// shows an illustrative, blurred sample (never this visitor's real data)
		// with an upgrade link.
		function ahcfreeLockedJourney() {
			var sample = [
				['Home', '/'],
				['Pricing', '/pricing/'],
				['Features', '/features/'],
				['Documentation', '/docs/getting-started/'],
				['Contact Us', '/contact/']
			];
			var steps = sample.map(function (p, i) {
				return '<li><span class="n">' + (i + 1) + '</span><span class="t">' + p[0] + '</span><span class="p">' + p[1] + '</span></li>';
			}).join('');
			return '<div class="ahcfree-rv-journey">' +
				'<ol class="ahcfree-rv-journey-sample" aria-hidden="true">' + steps + '</ol>' +
				'<div class="ahcfree-rv-journey-lock">' +
					'<span class="ahcfree-rv-journey-icon"><span class="dashicons dashicons-lock" aria-hidden="true"></span></span>' +
					'<div><b>See every page this visitor viewed</b><br>' +
					'<span>Page-by-page journey with time on each page is available in the Pro version.</span></div>' +
					'<a class="ahcfree-rv-journey-btn" target="_blank" rel="noopener" href="https://www.wp-buy.com/product/visitors-traffic-real-time-statistics-pro/?attribute_license=Single%20License%2029$&journey=true">Unlock with Pro</a>' +
				'</div>' +
			'</div>';
		}

		jQuery('#recent_visit_by_ip')
			.off('.ahcfreeJourney')
			.on('keydown.ahcfreeJourney', 'tbody > tr.ahcfree-rv-row', function (e) {
				if (e.target === this && (e.key === 'Enter' || e.key === ' ')) {
					e.preventDefault();
					jQuery(this).trigger('click');
				}
			})
			.on('click.ahcfreeJourney', 'tbody > tr.ahcfree-rv-row', function (e) {
				// Links (referrer icon) keep working; selecting text (copying an IP) does not toggle.
				if (jQuery(e.target).closest('a').length) return;
				if (window.getSelection && String(window.getSelection()).length) return;
				var tr = jQuery(this);
				var dtRow = table.row(tr);
				if (!dtRow.data()) return;
				if (dtRow.child.isShown()) {
					dtRow.child.hide();
					tr.removeClass('ahcfree-rv-open').attr('aria-expanded', 'false');
				} else {
					dtRow.child(ahcfreeLockedJourney(), 'ahcfree-rv-child').show();
					tr.addClass('ahcfree-rv-open').attr('aria-expanded', 'true');
				}
			});
	}
	if (jQuery('#visit_time_graph_table').length) {
		visitTimeGraphTable();
	}

	function visitTimeGraphTable() {
		// Get current hour to calculate the starting page
		const currentHour = new Date().getHours();
		const pageLength = 10;
		const startingPage = Math.floor(currentHour / pageLength);

		const table = jQuery('#visit_time_graph_table').DataTable({
			"pageLength": pageLength,
			"searching": false,
			"ordering": false,
			"bLengthChange": false,
			"bFilter": true,
			"bInfo": false,
			"bAutoWidth": false,
			"bJQueryUI": true,
			"processing": true,
			"serverSide": true,
			"displayStart": startingPage * pageLength, // Start at the page containing current hour
			ajax: {
				url: ahc_ajax.ajax_url + '?action=visits_time_graph&fdt=' + jQuery("#vfrom_dt").val() + "&tdt=" + jQuery("#vto_dt").val(),
				data: function (d) {
					// Add current hour info to the request
					d.current_hour = currentHour;
					return d;
				}
			},
			dataSrc: 'data',
			columns: [
				{ data: 'time' },
				{ data: 'graph' },
				{ data: 'vtm_visitors' },
				{ data: 'vtm_visits' }
			],
			language: {
				processing: "<span class='loader'>&nbsp;</span>",
				"zeroRecords": "No data available.",
				paginate: {
					next: '<i class="dashicons dashicons-arrow-right-alt2"></i>',
					previous: '<i class="dashicons dashicons-arrow-left-alt2"></i>'
				}
			},
			"fnDrawCallback": function (oSettings) {
				if (oSettings._iDisplayLength > oSettings.fnRecordsDisplay()) {
					jQuery(oSettings.nTableWrapper).find('.dataTables_paginate').hide();
				}

				// Highlight current hour row after EVERY page draw/change
				highlightCurrentHourRow();
			},
			"fnInitComplete": function (oSettings) {
				setTimeout(function () {
					highlightCurrentHourRow();
				}, 500);
			},
			dom: 'Bfrtip',
			buttons: [{
				extend: 'excelHtml5',
				title: "",
				action: function (e, dt, node, config) {
					jQuery("#visit_time_graph_table").parents(".panelcontent").find(".dataTables_processing").show();
					jQuery.ajax({
						url: ahc_ajax.ajax_url + '?action=visits_time_graph&page=all&fdt=' + jQuery("#vfrom_dt").val() + "&tdt=" + jQuery("#vto_dt").val(),
						data: dt.ajax.params(),
						success: function (res, status, xhr) {
							var createXLSLFormatObj = [];

							/* XLS Head Columns */
							var xlsHeader = ["Time", "Visitors", "Visits", "Graph"];

							/* XLS Rows Data */
							var xlsRows = JSON.parse(res);

							createXLSLFormatObj.push(xlsHeader);
							jQuery.each(xlsRows, function (index, value) {
								var innerRowData = [];
								jQuery.each(value, function (ind, val) {
									innerRowData.push(val);
								});
								createXLSLFormatObj.push(innerRowData);
							});
							jQuery("#visit_time_graph_table").parents(".panelcontent").find(".dataTables_processing").hide();
							/* File Name */
							var filename = "visits_time_graph.xlsx";

							/* Sheet Name */
							var ws_name = "sheet1";

							if (typeof console !== 'undefined') console.log(new Date());
							var wb = XLSX.utils.book_new(),
								ws = XLSX.utils.aoa_to_sheet(createXLSLFormatObj);

							/* Add worksheet to workbook */
							XLSX.utils.book_append_sheet(wb, ws, ws_name);

							/* Write workbook and Download */
							if (typeof console !== 'undefined') console.log(new Date());
							XLSX.writeFile(wb, filename);
							if (typeof console !== 'undefined') console.log(new Date());
						}
					})
				},
			}]
		});

		return table;
	}

	// Function to highlight current hour row with yellow background and left border
	// More efficient highlighting function
	function highlightCurrentHourRow() {
		const currentHour = new Date().getHours();
		const currentTimeString = (currentHour < 10 ? '0' + currentHour : currentHour) + ':00 - ' + (currentHour < 10 ? '0' + currentHour : currentHour) + ':59';

		// Remove previous highlighting first (more efficient than checking each row)
		jQuery('#visit_time_graph_table tbody tr').removeClass('current-hour-highlight');

		// Find and highlight current hour row
		jQuery('#visit_time_graph_table tbody tr').each(function () {
			const timeCell = jQuery(this).find('td:first-child').text().trim();
			if (timeCell === currentTimeString) {
				jQuery(this).addClass('current-hour-highlight');
				return false; // Break the loop once found
			}
		});
	}
	if (jQuery('#today_traffic_index_by_country').length) {
		trafficByIndexCountryTable();
	}
	function trafficByIndexCountryTable() {
		jQuery('#today_traffic_index_by_country').DataTable({
			"pageLength": 10,
			"searching": false,
			"ordering": false,
			"bLengthChange": false,
			"bFilter": true,
			"bInfo": false,
			"bAutoWidth": false,
			"bJQueryUI": true,
			"processing": true,
			"serverSide": true,
			ajax: ahc_ajax.ajax_url + '?action=today_traffic_index&fdt=' + jQuery("#t_from_dt").val() + "&tdt=" + jQuery("#t_to_dt").val(),
			dataSrc: 'data',
			columns: [
				{ data: 'no' },
				{ data: 'country' },
				{ data: 'ctr_name' },
				{ data: 'total' },
			],
			language: {
				processing: "<span class='loader'>&nbsp;</span>",
				"zeroRecords": "No data available.",
				paginate: {
					next: '<i class="dashicons dashicons-arrow-right-alt2"></i>',
					previous: '<i class="dashicons dashicons-arrow-left-alt2"></i>'
				}
			},
			"fnDrawCallback": function (oSettings) {
				if (oSettings._iDisplayLength > oSettings.fnRecordsDisplay()) {
					jQuery(oSettings.nTableWrapper).find('.dataTables_paginate').hide();
				}
			},
			dom: 'Bfrtip',
			buttons: [{
				extend: 'excelHtml5',
				title: "",
				action: function (e, dt, node, config) {
					jQuery("#today_traffic_index_by_country").parents(".panelcontent").find(".dataTables_processing").show();
					jQuery.ajax({
						url: ahc_ajax.ajax_url + '?action=today_traffic_index&page=all&fdt=' + jQuery("#t_from_dt").val() + "&tdt=" + jQuery("#t_to_dt").val(),
						data: dt.ajax.params(),
						success: function (res, status, xhr) {
							//console.log(res);

							var createXLSLFormatObj = [];

							/* XLS Head Columns */
							var xlsHeader = ["No", "Country", "Total"];

							/* XLS Rows Data */
							var xlsRows = JSON.parse(res);

							createXLSLFormatObj.push(xlsHeader);
							jQuery.each(xlsRows, function (index, value) {
								var innerRowData = [];
								jQuery.each(value, function (ind, val) {
									innerRowData.push(val);
								});
								createXLSLFormatObj.push(innerRowData);
							});
							jQuery("#today_traffic_index_by_country").parents(".panelcontent").find(".dataTables_processing").hide();

							/* File Name */
							var filename = "today_traffic_index.xlsx";

							/* Sheet Name */
							var ws_name = "sheet1";

							if (typeof console !== 'undefined') console.log(new Date());
							var wb = XLSX.utils.book_new(),
								ws = XLSX.utils.aoa_to_sheet(createXLSLFormatObj);

							/* Add worksheet to workbook */
							XLSX.utils.book_append_sheet(wb, ws, ws_name);

							/* Write workbook and Download */
							if (typeof console !== 'undefined') console.log(new Date());
							XLSX.writeFile(wb, filename);
							if (typeof console !== 'undefined') console.log(new Date());

						}
					})
				},
				exportOptions: {
					columns: [0, 2, 3]
				},
			}]
		});

	}
	if (jQuery('#summary_statistics').find("tr").length > 1) {
		jQuery('#summary_statistics').DataTable({
			"pageLength": 100,
			"searching": false,
			"ordering": false,
			"bPaginate": false,
			"bLengthChange": false,
			"bFilter": true,
			"bInfo": false,
			"bAutoWidth": false,
			"fnDrawCallback": function (oSettings) {
				if (oSettings._iDisplayLength > oSettings.fnRecordsDisplay()) {
					jQuery(oSettings.nTableWrapper).find('.dataTables_paginate').hide();
				}
			},
			dom: 'Bfrtip',
			buttons: [{
				extend: 'excelHtml5',
				title: ""
			}]
		});

	}
	if (jQuery('#search_engine').find("tr").length > 1) {
		jQuery('#search_engine').DataTable({
			"pageLength": 100,
			"searching": false,
			"ordering": false,
			"bPaginate": false,
			"bLengthChange": false,
			"bFilter": true,
			"bInfo": false,
			"bAutoWidth": false,
			"fnDrawCallback": function (oSettings) {
				if (oSettings._iDisplayLength > oSettings.fnRecordsDisplay()) {
					jQuery(oSettings.nTableWrapper).find('.dataTables_paginate').hide();
				}
			},
			dom: 'Bfrtip',
			buttons: [{
				extend: 'excelHtml5',
				title: ""
			}]
		});

	}

	jQuery(".export_data a").click(function (e) {
		e.preventDefault();
		jQuery(this).parents(".panel").find(".dt-buttons").find(".dt-button").trigger("click");

	})

	var dateFormat = "mm-dd-yy";
	if (jQuery("#from_dt").length && jQuery("#to_dt").length) {
		var from = jQuery("#from_dt").datepicker({
			defaultDate: 0,
			dateFormat: "mm-dd-yy",
			numberOfMonths: 1
		});


		var to = jQuery("#to_dt").datepicker({
			defaultDate: 0,
			dateFormat: "mm-dd-yy",
			numberOfMonths: 1
		});
	}


	if (jQuery("#summary_from_dt").length && jQuery("#summary_to_dt").length) {
		var from = jQuery("#summary_from_dt").datepicker({
			defaultDate: 0,
			dateFormat: "yy-mm-dd",
			numberOfMonths: 1
		});


		var to = jQuery("#summary_to_dt").datepicker({
			defaultDate: 0,
			dateFormat: "yy-mm-dd",
			numberOfMonths: 1
		});
	}


	jQuery("#to_dt").on("change", function () {
		from.datepicker("option", "maxDate", getDate(this));
	});

	jQuery("#from_dt").on("change", function () {
		to.datepicker("option", "minDate", getDate(this));
	});

	if (jQuery("#t_from_dt").length && jQuery("#t_to_dt").length) {
		var t_from_dt = jQuery("#t_from_dt").datepicker({
			defaultDate: 0,
			dateFormat: "mm-dd-yy",
			numberOfMonths: 1
		});


		var t_to_dt = jQuery("#t_to_dt").datepicker({
			defaultDate: 0,
			dateFormat: "mm-dd-yy",
			numberOfMonths: 1
		});
	}

	jQuery("#t_to_dt").on("change", function () {
		t_from_dt.datepicker("option", "maxDate", getDate(this));
	});

	jQuery("#t_from_dt").on("change", function () {
		t_to_dt.datepicker("option", "minDate", getDate(this));
	});

	if (jQuery("#vfrom_dt").length && jQuery("#vto_dt").length) {
		var vfrom = jQuery("#vfrom_dt").datepicker({
			defaultDate: 0,
			dateFormat: "mm-dd-yy",
			numberOfMonths: 1
		});

		var vto = jQuery("#vto_dt").datepicker({
			defaultDate: 0,
			dateFormat: "mm-dd-yy",
			numberOfMonths: 1
		});
	}

	jQuery("#vto_dt").on("change", function () {
		vfrom.datepicker("option", "maxDate", getDate(this));
	});

	jQuery("#vfrom_dt").on("change", function () {
		vto.datepicker("option", "minDate", getDate(this));
	});

	if (jQuery("#r_from_dt").length && jQuery("#r_to_dt").length) {
		var vfrom = jQuery("#r_from_dt").datepicker({
			defaultDate: 0,
			dateFormat: "mm-dd-yy",
			numberOfMonths: 1
		});

		var vto = jQuery("#r_to_dt").datepicker({
			defaultDate: 0,
			dateFormat: "mm-dd-yy",
			numberOfMonths: 1
		});
	}

	jQuery("#r_to_dt").on("change", function () {
		vfrom.datepicker("option", "maxDate", getDate(this));
	});

	jQuery("#r_from_dt").on("change", function () {
		vto.datepicker("option", "minDate", getDate(this));
	});


	function getDate(element) {
		var date;
		try {
			date = jQuery.datepicker.parseDate(dateFormat, element.value);
		} catch (error) {
			date = null;
		}
		return date;
	}
	jQuery(".search-panel .search_frm").submit(function (e) {
		e.preventDefault();
		var tableID = jQuery(this).parents(".panel").find(".panelcontent").find("table").attr("id");


		if (tableID == "recent_visit_by_ip") {
			jQuery('#' + tableID).DataTable().destroy();
			recentVisitorsOptimized();
			return false;
		}
		else if (tableID == "today_traffic_index_by_country") {
			jQuery('#' + tableID).DataTable().destroy();
			trafficByIndexCountryTable();
			return false;
		}
		else if (tableID == "lasest_search_words") {
			jQuery('#' + tableID).DataTable().destroy();
			latestSearchTable();
			return false;
		}
		else if (tableID == "visit_time_graph_table") {
			jQuery('#' + tableID).DataTable().destroy();
			visitTimeGraphTable();
			return false;
		}
		else
			return true;


	});
	jQuery(".clear_form").click(function (e) {
		jQuery(this).parents("form").find(".ahc_clear").val("");
		jQuery(this).parents("form").submit();
	});

	jQuery(".search_data a").click(function (e) {
		e.preventDefault();
		if (jQuery(this).parents(".panel").find(".search-panel").length)
			jQuery(this).parents(".panel").find(".search-panel").slideToggle();
		if (jQuery(this).parents(".panel").find(".dataTables_filter").length)
			jQuery(this).parents(".panel").find(".dataTables_filter").slideToggle();
	});
});
