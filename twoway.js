var TwoWay = (function(){
    var hash;
    var label;
    var coalesce = function (val, sub){
        if (val === undefined || val === null)
            return sub;
        return val;
    };
    var DOMcoalesce = function(val, sub) {
        if (val === undefined || val === null || val === '')
            return sub;
        return val;
    };
    var TwoWay = function(_hash, _label){
        hash = coalesce(_hash, {});
        label = coalesce(_label, "data-twoway_label");
    };

    var radioValue = function (obj) {
        if (typeof(obj) != 'object')
            obj = $('input[data-twoway_label="' + obj + '"]:checked');
        var options = coalesce($(obj).attr('data-twoway_options'), '');
        var value = $(obj).val();
        if (options.search('convert_boolean') != -1)
            value = (value == 'true');
        return value;
    };
    var checkboxValue = function (obj) {
        var bool_as = $(obj).attr('data-twoway_bool_as');
        var checked = $(obj).prop('checked');
        if (bool_as == undefined || bool_as == null)
            return (checked ? $(obj).val() : '');
        else if (bool_as == 'true')
            return checked;
        else
            return !checked;
    };
    var multipleValues = function (label, delimiter, typology) {
        var values = [];
        typology = coalesce(typology, '');
        $(':input[data-twoway_label="' + label + '"]' + typology).each(function (index, value) {
            var value = (typology === '' ? checkboxValue(this) : radioValue(this));
            var options = coalesce($(this).attr('data-twoway_options'), '');
            var include_blank = options.search('reject_blank') == -1;
            if (value !== '' || (value === '' && include_blank)) {
                values.push(value);
            }
        });
        if (delimiter !== 'array') values = values.join(delimiter);
        return values;
    };
    var inputValue = function (obj) {
        return $(obj).val();
    };
    var fillHash = function (hash, hash_div, value, index) {
        if (hash_div[index] === undefined)
            return;
        if (hash[hash_div[index]] === undefined)
            return;
        if ((index + 1) == hash_div.length)
            hash[hash_div[index]] = value;
        else
            fillHash(hash[hash_div[index]], hash_div, value, index + 1);
    };
    var setValueToSpan = function (value, label) {
        $('span[data-twoway_label="' + label + '"]').each(function () {
            $(this).text(value);
        });
    };
    var TwTrigger = function(obj){ //function because i'm planning to trigger more events
        $(obj).trigger('change');
    };
    var setRadio = function(obj, value){
        if ($(obj).val() == String(value)) {
            $(obj).prop('checked', true);
            TwTrigger(obj);
        }
    };
    var setCheck = function (obj, value) {
        if ($(obj).val() == String(value))
            $(obj).prop('checked', true);
        TwTrigger(obj);
    };
    var setGenericInput = function (obj, value) {
        $(obj).val(String(value));
        TwTrigger(obj);
    };
    var setValueToInput = function (obj, value) {
        switch ($(obj).attr('type')) {
            case 'radio':
                setRadio(obj, value);
                break;
            case 'checkbox':
                setCheck(obj, value);
                break;
            default:
                value = setGenericInput(obj, value);
        }
    };
    var setValue = function (value, label) {
        var hash_div = label.split('|');
        if (hash_div.length > 0) {
            fillHash(hash, hash_div, value, 0);
            setValueToSpan(value, label);
        }
    };
    var getValue = function (obj) {
        var value;
        var label = $(obj).attr('data-twoway_label');
        var delimiter = $(obj).attr('data-twoway_multiple');
        switch ($(obj).attr('type')) {
            case 'radio':
                if (delimiter === null || delimiter == undefined)
                    value = radioValue(label);
                else
                    value = multipleValues(label, delimiter, ':checked');
                break;
            case 'checkbox':
                if (delimiter === null || delimiter === undefined)
                    value = checkboxValue(obj);
                else
                    value = multipleValues(label, delimiter);
                break;
            default:
                value = inputValue(obj);
        }
        return value;
    };
    var fetchInput = function (label, val) {
        $('input[data-twoway_label="' + label + '"]').each(function (index, obj) {
            setValueToInput(obj, val)
        });
    };
    var browseHash = function (hash, label) {
        $.each(hash, function (key, val) {
            var actual_label = label + key + '|';
            val = coalesce(val, '');
            if (typeof(val) == 'object')
                browseHash(val, actual_label);
            else {
                actual_label = actual_label.slice(0, -1);
                fetchInput(actual_label, val);
                setValueToSpan(val, actual_label);
            }
        });
    };
    var removeField = function (field_path) { //this method will be private
        if (field_path[field_path.length - 1] == "|") field_path = field_path.slice(0, -1);
        var dyingElement = 'hash';
        $.each(field_path.split('|'), function (index, field) {
            dyingElement += '["' + field + '"]';
        });
        eval("delete " + dyingElement);
    };

    //PUBLIC
    TwoWay.prototype.setHash = function (newHash) {
        hash = coalesce(newHash, {});
    };
    TwoWay.prototype.getHash = function () {
        return hash;
    };
    TwoWay.prototype.getPart = function(label){
        label = coalesce(label, '').split('|');
        var part = hash;
        $.each(label, function(index, field){
            part = part[field];
        });
        return part;
    };
    TwoWay.prototype.serializePart = function(label){
        var array = [];
        $.each(this.getPart(label), function(index, el){
            array.push(el);
        });
        return array;
    };
    TwoWay.prototype.initializeFields = function () {
        browseHash(hash, '');
    };
    TwoWay.prototype.bind = function (obj) {
        var label = $(obj).attr('data-twoway_label');
        var value = getValue(obj);
        setValue(value, label);
    };
    TwoWay.prototype.build = function (main_field, options) {
        main_field = coalesce(main_field, 'object');
        if (main_field[main_field.length - 1] == "|") main_field = main_field.slice(0, -1);
        options = coalesce(options, {bind: false, from_zero: false});
        options['bind'] = coalesce(options['bind'], false);
        options['from_zero'] = coalesce(options['from_zero'], false);
        if (options['blank_value'] === undefined) options['blank_value'] = ''; //default value can be null
        if (options['from_zero']) hash = {};
        var building = hash;
        $(":input[data-twoway_label*='" + main_field + "|']").each(function (index, element) {
            var field = $(element).attr('data-twoway_label');
            var attributes = field.split('|');
            $.each(attributes, function (index, attribute) {
                if (index == (attributes.length - 1))
                    building[attribute] = (options.bind ? DOMcoalesce(getValue(element), options.blank_value) : options.blank_value);
                else
                    building[attribute] = coalesce(building[attribute], {});
                building = building[attribute];
            });
            building = hash;
        });
    };
    TwoWay.prototype.softRemove = function (field_path) {
        removeField(field_path);
    };
    TwoWay.prototype.remove = function (field_path) {
        $('[data-twoway_label*="' + field_path + '"').remove();
        removeField(field_path);
    };
    return TwoWay;
})();