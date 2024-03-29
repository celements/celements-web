/*
* Really easy field validation with Prototype
* http://tetlaw.id.au/view/javascript/really-easy-field-validation
* Andrew Tetlaw
* Version 1.5.4.1 (2007-01-05)
*
* Copyright (c) 2007 Andrew Tetlaw
* Permission is hereby granted, free of charge, to any person
* obtaining a copy of this software and associated documentation
* files (the "Software"), to deal in the Software without
* restriction, including without limitation the rights to use, copy,
* modify, merge, publish, distribute, sublicense, and/or sell copies
* of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
* MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS
* BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
* ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
* CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
*
*/
(function (window, undefined) {
  window.Validator = Class.create();
  
  window.Validator.prototype = {
    initialize : function(className, error, test, options) {
      if(typeof test == 'function'){
        this.options = $H(options);
        this._test = test;
      } else {
        this.options = $H(test);
        this._test = function(){return true;};
      }
      this.error = error || 'Validation failed.';
      this.className = className;
    },
    test : function(v, elm) {
      return (this._test(v,elm) && this.options.all(function(p){
        return Validator.methods[p.key] ? Validator.methods[p.key](v,elm,p.value) : true;
      }));
    }
  };
  window.Validator.methods = {
    pattern : function(v,elm,opt) {return Validation.get('IsEmpty').test(v) || opt.test(v);},
    minLength : function(v,elm,opt) {return v.length >= opt;},
    maxLength : function(v,elm,opt) {return v.length <= opt;},
    min : function(v,elm,opt) {return v >= parseFloat(opt);},
    max : function(v,elm,opt) {return v <= parseFloat(opt);},
    notOneOf : function(v,elm,opt) {return $A(opt).all(function(value) {
      return v != value;
    });},
    oneOf : function(v,elm,opt) {return $A(opt).any(function(value) {
      return v == value;
    });},
    is : function(v,elm,opt) {return v == opt;},
    isNot : function(v,elm,opt) {return v != opt;},
    equalToField : function(v,elm,opt) {return v == $F(opt);},
    notEqualToField : function(v,elm,opt) {return v != $F(opt);},
    include : function(v,elm,opt) {return $A(opt).all(function(value) {
      return Validation.get(value).test(v,elm);
    });},
    validDocName : function (v) {
      return !Validation.get('IsEmpty').test(v) && !/\W/.test(v.replace(/-/g, ''));
    }
  };
  
  window.Validation = Class.create();
  
  window.Validation.prototype = {
    initialize : function(form, options){
      const _me = this;
      this.options = Object.extend({
        onSubmit : true,
        stopOnFirst : false,
        immediate : false,
        focusOnError : true,
        useTitles : false,
        onFormValidate : function(result, form) {},
        onElementValidate : function(result, elm) {}
      }, options || {});
      this.form = $(form);
      if(this.options.onSubmit) {
        Event.observe(this.form,'submit',this.onSubmit.bind(this),false);
        Event.observe(this.form,'celForm:prepareSubmit',this.onSubmit.bind(this),false);
      }
      if(this.options.immediate) {
        Form.getElements(this.form).each(function(input) { // Thanks Mike!
          Event.observe(input, 'blur',  _me.validateFieldHandler.bind(_me));
          Event.observe(input, 'celValidation:revalidateField', _me.validateFieldHandler.bind(_me));
          Event.observe(input, 'celForm:valueChanged', _me.validateFieldHandler.bind(_me));
        });
      }
      let submitButtons = _me.form.select('.celSubmitFormWithValidation');
      if ((submitButtons.size() == 0) && $(_me.form.id + '_SubmitLink')) {
        submitButtons = [$(_me.form.id + '_SubmitLink')];
        console.warn('deprecated usage of submit link outside of form-tag: ',
            submitButtons);
      }
      submitButtons.each(function(buttonElem) {
        buttonElem.observe('click', _me.clickOnSubmitLinkHandler.bind(_me));
      });
    },
    validateFieldHandler : function(ev) {
      const _me = this;
      const useTitles = _me.options.useTitles;
      const callback = _me.options.onElementValidate;
      this.form.fire('celValidation:prepareElementValidation', Event.element(ev));
      Validation.validate(Event.element(ev),{
        useTitle : useTitles, onElementValidate : callback
      });
    },
    onSubmit :  function(ev){
      this.form.fire('celValidation:prepareFormValidation', this.form);
      if(!this.validate()) {
        Event.stop(ev);
        this.form.fire('celValidation:validationFailedSubmitCancel', this.form);
      } else {
        const valSubEv = this.form.fire('celValidation:submitFormAfterValidation', {
          form: this.form,
          submitEvent : ev
        });
        if (valSubEv.stopped) {
          ev.stop();
        }
      }
    },
    validate : function() {
      let result = false;
      const useTitles = this.options.useTitles;
      const callback = this.options.onElementValidate;
      if(this.options.stopOnFirst) {
        result = Form.getElements(this.form).all(function(elm) { return Validation.validate(elm,{useTitle : useTitles, onElementValidate : callback}); });
      } else {
        result = Form.getElements(this.form).collect(function(elm) { return Validation.validate(elm,{useTitle : useTitles, onElementValidate : callback}); }).all();
      }
      if(!result && this.options.focusOnError) {
        Form.getElements(this.form).findAll(function(elm){
          return $(elm).hasClassName('validation-failed');
        }).first().focus();
      }
      this.options.onFormValidate(result, this.form);
      return result;
    },
    reset : function() {
      Form.getElements(this.form).each(Validation.reset);
    },
    clickOnSubmitLinkHandler : function(event) {
      event.preventDefault();
      event.stopPropagation();
      if (this.form.requestSubmit) {
        this.form.requestSubmit(); // triggers onSubmit
      } else if (!this.form.fire('celForm:prepareSubmit').stopped) {
        this.form.submit();
      }
    }
  };
  
  Object.extend(window.Validation, {
    validate : function(elm, options){
      options = Object.extend({
        useTitle : false,
        onElementValidate : function(result, elm) {}
      }, options || {});
      elm = $(elm);
      const cn = elm.classNames();
      return result = cn.all(function(value) {
        const test = Validation.test(value,elm,options.useTitle);
        options.onElementValidate(test, elm);
        return test;
      });
    },
    test : function(name, elm, useTitle) {
      const v = Validation.get(name);
      const prop = '__advice'+name.camelize();
      try {
      if(Validation.isVisible(elm) && !v.test($F(elm), elm)) {
        if(!elm[prop]) {
          let advice = Validation.getAdvice(name, elm);
          if(advice == null) {
            const errorMsg = useTitle ? ((elm && elm.title) ? elm.title : v.error) : v.error;
            advice = '<div class="validation-advice" id="advice-' + name + '-' + Validation.getElmID(elm) +'" style="display:none">' + errorMsg + '</div>';
            switch (elm.type.toLowerCase()) {
              case 'checkbox':
              case 'radio':
                const p = elm.parentNode;
                if(p) {
                  new Insertion.Bottom(p, advice);
                } else {
                  new Insertion.After(elm, advice);
                }
                break;
              default:
                new Insertion.After(elm, advice);
              }
            advice = Validation.getAdvice(name, elm);
          }
          if(typeof Effect == 'undefined') {
            advice.style.display = 'block';
          } else {
            new Effect.Appear(advice, {duration : 1 });
          }
        }
        elm[prop] = true;
        elm.removeClassName('validation-passed');
        elm.addClassName('validation-failed');
        const elmWrapper = elm.up('.validation-field-wrapper');
        if (elmWrapper) {
          elmWrapper.removeClassName('validation-passed');
          elmWrapper.addClassName('validation-failed');
        }
        return false;
      } else {
        const advice = Validation.getAdvice(name, elm);
        if(advice != null) advice.hide();
        elm[prop] = '';
        elm.removeClassName('validation-failed');
        elm.addClassName('validation-passed');
        const elmWrapper = elm.up('.validation-field-wrapper');
        if (elmWrapper) {
          elmWrapper.removeClassName('validation-failed');
          elmWrapper.addClassName('validation-passed');
        }
        return true;
      }
      } catch(e) {
        console.warn("Exception in test ", e);
        throw(e);
      }
    },
    isVisible : function(elm) {
      while(elm.tagName != 'BODY') {
        if(!$(elm).visible()) return false;
        elm = elm.parentNode;
      }
      return true;
    },
    getAdvice : function(name, elm) {
      return $('advice-' + name + '-' + Validation.getElmID(elm)) || $('advice-' + Validation.getElmID(elm));
    },
    getElmID : function(elm) {
      return elm.id ? elm.id : elm.name;
    },
    reset : function(elm) {
      elm = $(elm);
      const cn = elm.classNames();
      cn.each(function(value) {
        const prop = '__advice'+value.camelize();
        if(elm[prop]) {
          const advice = Validation.getAdvice(value, elm);
          advice.hide();
          elm[prop] = '';
        }
        elm.removeClassName('validation-failed');
        elm.removeClassName('validation-passed');
        const elmWrapper = elm.up('.validation-field-wrapper');
        if (elmWrapper) {
          elmWrapper.removeClassName('validation-failed');
          elmWrapper.removeClassName('validation-passed');
        }
      });
    },
    add : function(className, error, test, options) {
      const  nv = {};
      nv[className] = new Validator(className, error, test, options);
      Object.extend(Validation.methods, nv);
    },
    addAllThese : function(validators) {
      const nv = {};
      $A(validators).each(function(value) {
          if (value[1] == null) {
            if (Validation.messages.get(value[0])) {
              value[1] = Validation.messages.get(value[0]);
            } else {
              value[1] = Validation.messages.get('_unknown_');
            }
          }
          nv[value[0]] = new Validator(value[0], value[1], value[2], (value.length > 3 ? value[3] : {}));
        });
      Object.extend(Validation.methods, nv);
    },
    get : function(name) {
      return  Validation.methods[name] ? Validation.methods[name] : Validation.methods['_LikeNoIDIEverSaw_'];
    },
    methods : {
      '_LikeNoIDIEverSaw_' : new Validator('_LikeNoIDIEverSaw_', '', {})
    }
  });
  
  Validation.add('IsEmpty', '', function(v) {
    return ((v == null) || (v.length == 0)); // || /^\s+$/.test(v));
    });
  
  Validation.messages = new Hash( {
    '_unknown_' : 'unkown error'
  });
  
  Validation.defaultFunctions = [
    ['required', null, function(v) {
          return !Validation.get('IsEmpty').test(v);
        }],
    ['validate-number', null, function(v) {
          return Validation.get('IsEmpty').test(v) || (!isNaN(v) && !/^\s+$/.test(v));
        }],
    ['validate-digits', null, function(v) {
          return Validation.get('IsEmpty').test(v) ||  !/[^\d]/.test(v);
        }],
    ['validate-alpha', null, function (v) {
          return Validation.get('IsEmpty').test(v) ||  /^[a-zA-Z]+$/.test(v);
        }],
    ['validate-alphanum', null, function(v) {
          return Validation.get('IsEmpty').test(v) ||  !/\W/.test(v);
        }],
    ['validate-date', null, function(v) {
          const test = new Date(v);
          return Validation.get('IsEmpty').test(v) || !isNaN(test);
        }],
    ['validate-email', null, function (v) {
          return Validation.get('IsEmpty').test(v) || /\w{1,}[@][\w\-]{1,}([.]([\w\-]{1,}))+$/.test(v);
        }],
    ['validate-url', null, function (v) {
          return Validation.get('IsEmpty').test(v) || /^(http|https|ftp):\/\/(([A-Z0-9][A-Z0-9_-]*)(\.[A-Z0-9][A-Z0-9_-]*)+)(:(\d+))?\/?/i.test(v);
        }],
    ['validate-date-au', null, function(v) {
          if(Validation.get('IsEmpty').test(v)) return true;
          const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
          if(!regex.test(v)) return false;
          const d = new Date(v.replace(regex, '$2/$1/$3'));
          return ( parseInt(RegExp.$2, 10) == (1+d.getMonth()) ) &&
                (parseInt(RegExp.$1, 10) == d.getDate()) &&
                (parseInt(RegExp.$3, 10) == d.getFullYear() );
        }],
    ['validate-date-de', null, function(v) {
          if(Validation.get('IsEmpty').test(v)) return true;
          const regex = /^(\d{2})[\.\/](\d{2})[\.\/](\d{4})$/;
          if(!regex.test(v)) return false;
          const d = new Date(0);
          d.setDate(RegExp.$1);
          d.setMonth(parseInt(RegExp.$2) - 1);
          const yyyy = parseInt(RegExp.$3);
          if(yyyy < 999) { yyyy += 1900; }
          d.setYear(yyyy);
          return ( parseInt(RegExp.$2, 10) == (1+d.getMonth()) ) &&
                (parseInt(RegExp.$1, 10) == d.getDate()) &&
                (parseInt(RegExp.$3, 10) == d.getFullYear() );
        }],
    ['validate-currency-dollar', null, function(v) {
          // [$]1[##][,###]+[.##]
          // [$]1###+[.##]
          // [$]0.##
          // [$].##
          return Validation.get('IsEmpty').test(v) ||  /^\$?\-?([1-9]{1}[0-9]{0,2}(\,[0-9]{3})*(\.[0-9]{0,2})?|[1-9]{1}\d*(\.[0-9]{0,2})?|0(\.[0-9]{0,2})?|(\.[0-9]{1,2})?)$/.test(v);
        }],
    ['validate-selection', null, function(v, elm){
          return elm.options ? elm.selectedIndex > 0 : !Validation.get('IsEmpty').test(v);
        }],
    ['validate-one-required', null, function (v, elm) {
          const p = elm.up('.validation-one-required-field-wrapper') || elm.parentNode;
          const options = p.getElementsByTagName('INPUT');
          return $A(options).any(function(elm) {
            return $F(elm);
          });
        }],
    ['validate-multiple-required', null, function (v, elm) {
        const nr = elm.className.replace(/^.*multipleIs(\d+)( .*|)$/g, '$1');
        const p = elm.up('.validation-one-required-field-wrapper') || elm.parentNode;
        const options = p.getElementsByTagName('INPUT');
        return nr == $A(options).findAll(function(elm) {
          return $F(elm);
        }).length;
      }],
    ['validate-minimum-required', null, function (v, elm) {
        const nr = elm.className.replace(/^.*minimumIs(\d+)( .*|)$/g, '$1');
        const p = elm.up('.validation-one-required-field-wrapper') || elm.parentNode;
        const options = p.getElementsByTagName('INPUT');
        return nr <= $A(options).findAll(function(elm) {
          return $F(elm);
        }).length;
      }],
    ['validate-email-equal', 'email', Validator.methods.equalToField ],
    ['validate-docname', null, Validator.methods.validDocName ]
  ];
  
  new Ajax.Request(getCelHost(), {
    method : 'post',
    parameters : {
      xpage : 'celements_ajax',
      ajax_mode : 'ValidationMessages'
    },
    onSuccess : function(transport) {
      if (transport.responseText.isJSON()) {
        Validation.messages = Validation.messages.merge(transport.responseText.evalJSON());
        Validation.addAllThese(Validation.defaultFunctions);
        if ((typeof console != 'undefined') && (typeof console.debug != 'undefined')) {
          console.debug('validation.js: finished adding default functions.');
        }
      } else if ((typeof console != 'undefined') && (typeof console.error != 'undefined')) {
        console.error('noJSON!!! ', transport.responseText);
      }
    }
  });
  
  Validation.addValidationToForm = function(form) {
    let valid = null;
    if (form.tagName.toLowerCase() == 'form') {
      valid = new Validation(form, {
        immediate : true,
        useTitles : true,
        stopOnFirst : false
      });
    }
    return valid;
  };
  
  Validation.addValidationToFormListener = function(event) {
    const elem = event.findElement();
    if (elem.tagName.toLowerCase() == 'form') {
      Validation.addValidationToForm(elem);
    } else {
      elem.select('form.celAddValidationToForm').each(Validation.addValidationToForm);
    }
  };
  
  document.addEventListener('DOMContentLoaded', function() {
    $(document.body).observe('celValidation:addValidation',
        Validation.addValidationToFormListener);
    $(document.body).fire('celValidation:addValidation');
  });
})(window);
