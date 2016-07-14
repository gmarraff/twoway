function TwoWay(hash){
    this.hash = hash;
    this.label = "data-twoway_label";

    this.setHash = function(hash){
        this.hash = hash;
    };
    this.getHash = function(){
        return this.hash;
    };
    //tested
    this.radioValue = function(label){
        return $('input[data-twoway_label="'+ label +'"]:checked').val();
    };

    //tested
    this.checkboxValue = function(obj){
        if($(obj).prop('checked'))
            return $(obj).val();
        else
            return '';
    };
    //tested
    this.inputValue = function(obj){
        return $(obj).val();
    };

    //tested
    this.fillHash = function(hash, hash_div, value, index){
        if(hash_div[index] === undefined)
            return;
        if(hash[hash_div[index]] === undefined)
            return;
        if((index + 1) == hash_div.length)
            hash[hash_div[index]] = value;
        else
            this.fillHash(hash[hash_div[index]], hash_div, value, index + 1);
    };

    //tested
    this.setValueToSpan = function(value, label){
        $('span[data-twoway_label="'+ label +'"]').each(function(){
            $(this).text(value);
        });
    };

    //tested
    this.setCheck = function(obj, value){
        if($(obj).val() == value)
            $(obj).prop('checked', true);
    };

    //is ok
    this.setGenericInput = function(obj, value){
        $(obj).val(value);
    };

    //tested
    this.setValueToInput = function(obj, value){
        switch($(obj).attr('type')){
            case 'radio':
                this.setCheck(obj, value);
                break;
            case 'checkbox':
                this.setCheck(obj, value);
                break;
            default:
                value = this.setGenericInput(obj, value);
        }
        $(obj).trigger('change');
    };

    //tested
    this.setValue = function(value, label){
        var hash_div = label.split('|');
        if(hash_div.length > 0) {
            this.fillHash(this.hash, hash_div, value, 0);
            this.setValueToSpan(value, label);
        }
    };

    //tested
    this.getValue = function(obj){
        var value;
        switch($(obj).attr('type')){
            case 'radio':
                value = this.radioValue($(obj).attr('data-twoway_label'));
                break;
            case 'checkbox':
                value = this.checkboxValue(obj);
                break;
            default:
                value = this.inputValue(obj);
        }
        return value;

    };

    //tested
    this.bind = function(obj){
        var label = $(obj).attr('data-twoway_label');
        var value = this.getValue(obj);
        this.setValue(value, label);
    };

    //tested
    this.fetchInput = function(label, val){
        var _this = this;
        $('input[data-twoway_label="' + label +'"]').each(function(index, obj){
            _this.setValueToInput(obj, val)
        });
    };

    //tested
    this.browseHash = function(hash, label){
        var _this = this;
        $.each(hash, function(key, val){
            var actual_label = label + key + '|';
            if(typeof(val) == 'object')
                _this.browseHash(val, actual_label);
            else {
                actual_label = actual_label.slice(0, -1);
                _this.fetchInput(actual_label, val);
                _this.setValueToSpan(val, actual_label);
            }
        });
    };
    //tested
    this.initializeFields = function(){
        this.browseHash(this.hash, '');
    };
}
