/* global key, glotdict_version */
'use strict';

var glotdict_version = "1.0.0";

jQuery(document).ready(function () {
  /**
   * Get the language saved in GlotDict
   * 
   * @returns string
   */
  function gd_get_lang() {
	var lang = localStorage.getItem('gd_language');
	if (lang === '' || lang === null) {
	  return false;
	}
	return lang;
  }
  
  /**
   * Add the term in the page with the HTML code compatible with GlotPress
   * 
   * @param String word
   * @param String element
   * @param String item
   * @returns void
   */
  function gd_add_term_json(word, element, item) {
	if (item !== '') {
	  var rgxp = new RegExp('\\b(' + word + ')\\b(?![^<>()\"]*>|[^<]*<\/span>)', 'gi');
	  var print = JSON.stringify(item);
	  if (!item.length) {
		print = '[' + print + ']';
	  }
	  var repl = '<span class="glossary-word-glotdict" data-translations=\'' + print + '\'>$1</span>';
	  jQuery(element).html(jQuery(element).html().replace(rgxp, repl));
	}
  }

  /**
   * Add links for Translation global status and Language projects archive
   * @returns void
   */
  function gd_add_project_links() {
	if (jQuery('.gp-content .breadcrumb li:last-child a').length > 0) {
	  var lang = jQuery('.gp-content .breadcrumb li:last-child a').attr('href').split('/');
	  lang = lang[lang.length - 2];
	  jQuery('.gp-content').prepend('<a style="float:right" href="https://translate.wordpress.org/locale/' + lang + '/default">' + jQuery('.gp-content .breadcrumb li:last-child a').text() + ' Projects to Translate</a>');
	  jQuery('.gp-content h2').prepend('<a class="glossary-link" style="float:right;padding-left:5px;margin-left:5px;border-left: 1px solid black;" href="https://translate.wordpress.org/stats">Translation Global Status</a>');
	}
  }

  /**
   * Add the button to scroll to the row of the language choosen
   * @returns void
   */
  function gd_add_button() {
	if (jQuery('title').text().substring(0, 27) === 'Translation status overview') {
	  jQuery('.gp-content').prepend('<button style="float:right" class="gd_scroll">Scroll to ' + gd_get_lang() + '</button>');
	  jQuery('.gd_scroll').on('click', function () {
		var row = jQuery("#stats-table tr th a:contains('" + gd_get_lang() + "')");
		row.html('<b>&nbsp;&nbsp;&nbsp;' + row.text() + '</b>');
		jQuery('html, body').animate({scrollTop: row.offset().top - 50});
	  });
	}
  }

  /**
   * Get the today with the format dd/mm/yyyy used for the update daily check
   * 
   * @returns String
   */
  function gd_today() {
	var today = new Date();
	return today.getDate() + '/' + (today.getMonth() + 1) + '/' + today.getFullYear();
  }

  /**
   * Get the the list of locales cached
   * 
   * @returns Array
   */
  function gd_list_locales_cached() {
        var locales = JSON.parse(JSON.parse(localStorage.getItem('gd_locales')));
        if (typeof locales === 'undefined') {
	  gd_locales();
          locales = JSON.parse(JSON.parse(localStorage.getItem('gd_locales')));
        }
	return locales;
  }

  /**
   * Get the the glossary cached
   * 
   * @returns Array
   */
  function gd_glossary_file_cached() {
	return JSON.parse(JSON.parse(localStorage.getItem('gd_glossary_file')));
  }

  /**
   * Get the glossary file saved 
   * 
   * @param String lang
   * @returns Array
   */
  function gd_glossary_cached(lang) {
	if (typeof lang === 'undefined') {
	  return;
	}
	//TODO check code if locales date is different from the online available
	var glossary_date_cache = localStorage.getItem('gd_glossary_date');
	var locales_cache = gd_list_locales_cached();
	if (glossary_date_cache === null || glossary_date_cache !== locales_cache[lang].time) {
	  jQuery.ajax({
		url: 'https://codeat.co/glotdict/dictionaries/' + glotdict_version + '/' + lang + '.json',
		dataType: 'text',
		async: false
	  }).done(function (data) {
		localStorage.setItem('gd_glossary_file', JSON.stringify(data));
		var glossary_date = gd_list_locales_cached();
		localStorage.setItem('gd_glossary_date', glossary_date[gd_get_lang()].time);
	  }).fail(function (xhr, ajaxOptions, thrownError) {
		console.error(thrownError);
		console.error('GlotDict: error on loading ' + gd_get_lang() + '.json');
	  });
	}
	return gd_glossary_file_cached();
  }

  /**
   * Get the list of locales avalaible
   * 
   * @returns Array
   */
  function gd_locales() {
	var locales = ['ast', 'bg_BG', 'de_DE', 'en_AU', 'en_CA', 'es_ES', 'fi', 'fr_FR', 'he_IL', 'hi_IN', 'it_IT', 'ja', 'lt_LT', 'nl_NL', 'pt_BR', 'ro_RO', 'sv_SE', 'th', 'tr_TR'];
	var locales_date_cache = localStorage.getItem('gd_locales_date');
	if (locales_date_cache === null || locales_date_cache !== gd_today()) {
	  jQuery.ajax({
		url: 'https://codeat.co/glotdict/dictionaries/' + glotdict_version + '.json',
		dataType: 'text'
	  }).done(function (data) {
		localStorage.setItem('gd_locales', JSON.stringify(data));
		localStorage.setItem('gd_locales_date', gd_today());
	  }).fail(function (xhr, ajaxOptions, thrownError) {
		console.error(thrownError);
		console.error('GlotDict Syntax: error on loading the Glossary Syntax');
	  });
	}
	var locales_cache = gd_glossary_cached();
	if (typeof locales_cache !== 'undefined') {
	  locales = Object.keys(locales_cache).map(function (key) {
		return key;
	  });
	}
	return locales;
  }

  /**
   * Print the locales selector
   * 
   * @returns void
   */
  function gd_locales_selector() {
	var lang = gd_get_lang();
	jQuery('.filters-toolbar:last div:first').append('<span class="separator">•</span><label for="gd-language-picker">Pick the glossary: </label><select id="gd-language-picker" class="glotdict_language"></select>');
	jQuery('.glotdict_language').append(jQuery('<option></option>'));
	var gd_locales_array = gd_locales();
	jQuery.each(gd_locales_array, function (key, value) {
	  var new_option = jQuery('<option></option>').attr('value', value).text(value);
	  if (lang === value) {
		new_option.attr('selected', true);
	  }
	  jQuery('.glotdict_language').append(new_option);
	});
	if (lang === '') {
	  jQuery('.filters-toolbar:last div:first').append('<h3 style="background-color:#ddd;padding:4px;width:130px;display:inline;margin-left:4px;">&larr; Set the glossary!</span>');
	  return;
	}
	jQuery('.glossary-word').contents().unwrap();
  }

  /**
   * Create the tooltip for every terms added
   * 
   * @returns void
   */
  function gd_terms_tooltip() {
	var lang = gd_get_lang();
	if (lang === false) {
	  console.error('GlotDict: missing lang!');
	  return false;
	}
	var data = gd_glossary_cached(lang);
	// Loop all the editor string views
	jQuery('.editor .original').each(function () {
	  var editor_in_loop = this;
	  jQuery.each(data, function (i, item) {
		if (i !== '&') {
		  gd_add_term_json(i, editor_in_loop, item);
		}
	  });
	});
	jQuery('.editor .original .glossary-word-glotdict').css({'cursor': 'help', 'border-bottom': '1px dashed'});
	// Generate the HTML code for the tooltips
	jQuery('.editor').tooltip({
	  items: '.editor .original .glossary-word-glotdict',
	  content: function () {
		var content = jQuery('<ul>');
		jQuery.each(jQuery(this).data('translations'), function (i, e) {
		  var def = jQuery('<li>');
		  def.append(jQuery('<span>', {text: e.pos}).addClass('pos'));
		  def.append(jQuery('<span>', {text: e.translation}).addClass('translation'));
		  def.append(jQuery('<span>', {text: e.comment}).addClass('comment'));
		  content.append(def);
		});
		return content;
	  }
	});
  }

  /**
   * Add the hotkeys in GlotPress
   * 
   * @returns void
   */
  function gd_hotkeys() {
//	if (jQuery('.gp-content .breadcrumb li:last-child a').length !== 0) {
//	  return false;
//	}
	key.filter = function (event) {
	  var tagName = (event.target || event.srcElement).tagName;
	  key.setScope(/^(SELECT)$/.test(tagName) ? 'input' : 'other');
	  return true;
	};
	key('ctrl+enter', function () {
	  if (jQuery('.editor:visible').length > 0) {
		jQuery('.editor:visible .actions button.ok').trigger('click');
	  } else {
		alert('No opened string to add!');
	  }
	  return false;
	});
	key('ctrl+shift+z', function () {
	  if (jQuery('.editor:visible').length > 0) {
		jQuery('.editor:visible .actions a.close').trigger('click');
	  }
	  return false;
	});
	key('ctrl+shift+a', function () {
	  if (jQuery('.editor:visible .meta button.approve').length > 0) {
		jQuery('.editor:visible .meta button.approve').trigger('click');
	  } else {
		alert('No opened string to approve!');
	  }
	  return false;
	});
	key('ctrl+shift+b', function () {
	  if (jQuery('.editor:visible .copy').length > 0) {
		jQuery('.editor:visible .copy').trigger('click');
	  }
	  return false;
	});
	key('ctrl+shift+r', function () {
	  if (jQuery('.editor:visible .meta button.reject').length > 0) {
		jQuery('.editor:visible .meta button.reject').trigger('click');
	  } else {
		alert('No opened string to reject!');
	  }
	  return false;
	});
	key('ctrl+shift+f', function () {
	  jQuery('textarea.foreign-text:visible:first').val(function (index, text) {
		// Replace space-colon or nbsp-colon with just colon, then replace colons with nbsp-colon
		var s = text.replace(/( :|&nbsp;:)/g, ':').replace(/:/g, '&nbsp;:');
		// Fix http and https from the above replace
		s = s.replace(/http&nbsp;:/g, 'http:').replace(/https&nbsp;:/g, 'https:');
		// Replace space-question or nbsp-question with just question, then replace question with nbsp-question
		s = s.replace(/( \?|&nbsp;\?)/g, '?').replace(/\?/g, '&nbsp;?');
		// Replace space-exclamation or nbsp-exclamation with just exclamation, then replace exclamation with nbsp-exclamation
		s = s.replace(/( !|&nbsp;!)/g, '!').replace(/!/g, '&nbsp;!');
		// Replace space-%-space with nbsp-%-space
		s = s.replace(/( % )/g, '&nbsp;% ');
		// Replace space-dot-space or space-dot with just dot-space, same for comma
		s = s.replace(/( \. | \.)/g, '. ').replace(/( , | ,)/g, ', ');
		// Replace space-closebracket-space or space-closebracket with just closebracket-space, same for squarebracket
		s = s.replace(/( \) | \))/g, ') ').replace(/( ] | ])/g, '] ');
		// Replace space-openbracket-space or openbracket-space with just space-openbracket, same for squarebracket
		s = s.replace(/( \( |\( )/g, ' (').replace(/( \[ |\[ )/g, ' [');
		return s;
	  });
	  return false;
	});
	key('pageup', function () {
	  if (jQuery('.editor:visible').length > 0) {
		jQuery('.editor').next().trigger('click');
	  }
	  return false;
	});
	key('pagedown', function () {
	  if (jQuery('.editor:visible').length > 0) {
		jQuery('.editor').prev().trigger('click');
	  }
	  return false;
	});
  }
  
  // Remvoe the social button in the bottom
  jQuery('#wporg-footer ul:last-child').remove();
  gd_add_project_links();
  gd_add_button();

  if (jQuery('.filters-toolbar:last div:first').length > 0) {
	//Fix for PTE align
	if (jQuery('#bulk-actions-toolbar').length > 0) {
	  jQuery('#upper-filters-toolbar').css('clear', 'both');
	}
	gd_locales_selector();
	gd_terms_tooltip();
	gd_hotkeys();
  }

  jQuery('.glotdict_language').change(function () {
	localStorage.setItem('gd_language', jQuery('.glotdict_language option:selected').text());
	localStorage.setItem('gd_glossary_date', '');
	location.reload();
  });
});
