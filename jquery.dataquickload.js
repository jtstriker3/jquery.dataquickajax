﻿(function ($) {
    $.fn.dataQuickAjax = function (onLoad) {
        this.each(function () {
            var that = this;
            var url = $(this).attr('data-ajax-url');
            var event = $(this).attr('data-ajax-event') || 'click';
            var trigger = $(this).attr('data-ajax-trigger');
            var deleteFilter = $(this).attr('data-ajax-delete');
            var requestType = $(this).attr('data-ajax-type') || 'get';
            var deleteConfirm = $(this).attr('data-delete-text') || "Are you sure you want to delete this?";
            var dataCountSelector = $(this).data('count-selector');
            var dataOnload = eval(onLoad || $(this).data('onLoad') || undefined);
            var filterID = $(this).data('ajax-filterid') != undefined ? '#' + $(this).data('ajax-filterid') : null;
            var filterType = $(this).data('ajax-filtertype') || null;
            var pageSize = $(this).data('ajax-pagesize') || undefined;
            var pagerID = $(this).data('ajax-pagerid') != undefined ? '#' + $(this).data('ajax-pagerid') : null;
            var append = $(this).data('ajax-append') || false;
            var customFilters = eval($(this).data('customFilters') || undefined);
            var renderTemplate = eval($(this).data('renderTemplate') || undefined);

            this.init = function () {
                $(pagerID).hide();

                if (event == "documentReady") {
                    that.quickLoad();
                } else {
                    if (requestType != 'delete') {
                        $(document).on(event, trigger, function (e) {
                            $(that).empty();
                            if (pagerID != null)
                                $(pagerID).data('page', 0);
                            that.quickLoad(e);
                        });
                    } else {
                        $(that).on(event, function () {
                            that.quickDelete();
                        });
                    }
                }

                if (pagerID != null)
                    $(pagerID).on('click', that.quickLoad);
            };

            this.quickDelete = function () {
                if (confirm(deleteConfirm)) {
                    $.ajax({ url: url, type: requestType }).done(function () {
                        $(that).parents(deleteFilter).remove();
                        $(dataCountSelector).html(" " + ($(dataCountSelector).html() - 1));
                    });
                }
            };

            this.getFilterVal = function ($element) {
                switch (filterType) {
                    case null:
                        return $element.val();

                    case "radio":
                    case "checkbox":
                        var ids = '';
                        $element.find('input:checked').each(function (i) {
                            if (i > 0)
                                ids += "~";
                            ids += $(this).val();
                        });
                        return ids;
                    default:
                        return null;
                }
            }

            this.quickLoad = function (e) {
                var html = $(that).html();
                $(that).append("<b>loading...</b>");
                var urlBuilder = url;
                var filterVal = '';
                if (filterID != null) {
                    if (filterID == "#~trigger")
                        filterVal = that.getFilterVal($(e.target));
                    else
                        filterVal = that.getFilterVal($(filterID));
                    if (filterVal.length)
                        urlBuilder += '?filter=' + filterVal;
                }
                if (pageSize != undefined) {
                    if (filterVal.length)
                        urlBuilder += '&take=' + pageSize;
                    else
                        urlBuilder += '?take=' + pageSize;

                    if (pagerID != null) {
                        var page = $(pagerID).data('page') || 0;
                        $(pagerID).data('page', page + 1);
                        urlBuilder += '&skip=' + (page * pageSize);
                    }
                }

                if (customFilters != undefined) {
                    if (urlBuilder == '')
                        urlBuilder = '?';
                    else
                        urlBuilder += '&';
                    urlBuilder += customFilters(that);
                }

                if (append) {
                    $.get(urlBuilder, function (data) {
                        that.loaded(html + data);
                    });
                }
                else {
                    $.get(urlBuilder, function (data) {
                        that.loaded(data);
                    });
                }
            };

            this.loaded = function (data) {

                if (renderTemplate) {
                    renderTemplate(data);
                }
                else
                    $(that).html(data);

                if (dataOnload != undefined)
                    dataOnload($(that), data);

                $(pagerID).fadeIn();
                $(that).find('[data-ajax-url]').dataQuickAjax(dataOnload);
                $(that).trigger({
                    type: "dataAjaxLoaded"
                });

            }

            this.trigger = function () {
                if (requestType = 'delete')
                    that.quickDelete();
                else
                    that.quickLoad();

            };

            this.init();
        });
    };
})(jQuery);

$(document).ready(function () {
    $('[data-ajax-url]').dataQuickAjax();
});