function gd_add_column() {
  if (jQuery('#translations thead tr th').length < 6) {
    jQuery('#translations thead tr').append('<th></th>');
  }
  jQuery('#translations tr.preview').each(function() {
    if (jQuery(this).find('td').length < 5) {
      gd_add_column_buttons(this);
    }
  });
}

function gl_auto_hide_after_status() {
   var check_if = setTimeout(function() {
     if(jQuery('.editor:visible').length > 0) {
           $gp.editor.hide();
           clearTimeout(check_if);
     }
   }, 800);
}

jQuery('#translations').on('click', '.gd-approve', function() {
  $gp.editor.show(jQuery(this));
  $gp.editor.set_status(jQuery(this), 'current');
  jQuery(this).parent().parent().removeClass('status-waiting').addClass('status-current');
  gl_auto_hide_after_status()
  return false;
});
jQuery('#translations').on('click', '.gd-reject', function() {
  $gp.editor.show(jQuery(this));
  $gp.editor.set_status(jQuery(this), 'rejected');
  gl_auto_hide_after_status()
  return false;
});
jQuery('#translations').on('click', '.gd-fuzzy', function() {
  $gp.editor.show(jQuery(this));
  $gp.editor.set_status(jQuery(this), 'fuzzy');
  gl_auto_hide_after_status()
  return false;
});

function gd_add_column_buttons(element) {
  var approve = '';
  var reject = '';
  var fuzzy = '';
  var approve_nonce = '';
  var approve_title = '';
  var reject_nonce = '';
  var reject_title = '';
  var fuzzy_nonce = '';
  var fuzzy_title = '';
  var id = jQuery(element).attr('row');

  if (jQuery('#editor-' + id + ' .meta button.approve').length !== 0) {
    approve_nonce = jQuery('#editor-' + id + ' .meta button.approve').attr('data-nonce');
    approve_title = jQuery('#editor-' + id + ' .meta button.approve').attr('title');
    approve = '<button class="approve gd-approve" tabindex="-1" data-nonce="' + approve_nonce + '" title="' + approve_title + '"><strong>+</strong> Approve</button>';
  }
  if (jQuery('#editor-' + id + ' .meta button.reject').length !== 0) {
    reject_nonce = jQuery('#editor-' + id + ' .meta button.reject').attr('data-nonce');
    reject_title = jQuery('#editor-' + id + ' .meta button.reject').attr('title');
    reject = '<button class="reject gd-reject" tabindex="-1" data-nonce="' + reject_nonce + '" title="' + reject_title + '"><strong>−</strong> Reject</button>';
  }
  if (jQuery('#editor-' + id + ' .meta button.fuzzy').length !== 0) {
    fuzzy_nonce = jQuery('#editor-' + id + ' .meta button.fuzzy').attr('data-nonce');
    fuzzy_title = jQuery('#editor-' + id + ' .meta button.fuzzy').attr('title');
    fuzzy = '<button class="fuzzy gd-fuzzy" tabindex="-1" data-nonce="' + fuzzy_nonce + '" title="' + fuzzy_title + '"><strong>~</strong> Fuzzy</button>';
  }
  var buttons = approve + reject + fuzzy;

  if (jQuery(element).hasClass('untranslated')) {
    buttons = '';
  }
  jQuery(element).append('<td>' + buttons + '</td>');
}
