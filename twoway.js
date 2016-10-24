function TwoWay(hash, label){
    this.coalesce = function(val, sub){
        if(val === undefined || val === null)
            return sub;
        return val;
    };
    this.DOMcoalesce = function(val, sub){
        if(val === undefined || val === null || val === '')
            return sub;
        return val;
    };
    this.hash = this.coalesce(hash, {});
    this.label = this.coalesce(label, "data-twoway_label");

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
      var bool_as = $(obj).attr('data-twoway_bool_as');
      var checked = $(obj).prop('checked');
      if(bool_as == undefined || bool_as == null)
        return (checked ? $(obj).val() : '');
      else if(bool_as == 'true')
        return checked;
      else
        return !checked;
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
        if($(obj).val() == String(value))
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
            val = _this.coalesce(val, '');
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

    //tested
    this.build = function(main_field, options){
        var _this = this;
        main_field = _this.coalesce(main_field, 'object');
        if(main_field[main_field.length - 1] == "|") main_field_path = main_field.slice(0, -1);
        options = _this.coalesce(options, {bind: false, from_zero: false});
        options['bind'] = _this.coalesce(options['bind'], false);
        options['from_zero'] = _this.coalesce(options['from_zero'], false);
        if(options['blank_value'] === undefined) options['blank_value'] = '';
        if(options['from_zero']) _this.hash = {};
        var building = _this.hash;
        $(":input[data-twoway_label*='" + main_field + "|']").each(function(index, element){
            var field = $(element).attr('data-twoway_label');
            var attributes = field.split('|');
            $.each(attributes, function(index, attribute){
                if(index == (attributes.length - 1))
                    building[attribute] = (options.bind ? _this.DOMcoalesce(_this.getValue(element), options.blank_value) : options.blank_value);
                else
                    building[attribute] = _this.coalesce(building[attribute], {});
                building = building[attribute];
            });
            building = _this.hash;
        });
        this.removeField = function(field_path){ //this method will be private
          if(field_path[field_path.length - 1] == "|") field_path = field_path.slice(0, -1);
          var dyingElement = 'this.hash';
          $.each(field_path.split('|'), function(index, field){
            dyingElement += '["' + field + '"]';
          });
          eval("delete " + dyingElement);
        }
        this.softRemove = function(field_path){
          this.removeField(field_path);
        }
        this.remove = function(field_path){
          $('[data-twoway_label*="' + field_path + '"').remove();
          this.removeField(field_path);
        }
    }
}
