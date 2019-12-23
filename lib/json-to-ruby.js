'use babel';

import { CompositeDisposable } from 'atom';
import lodash from 'lodash';
import { test } from './test';

export default {

  activate(state) {
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'json-to-ruby:convert': () => this.convert()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  serialize() {
  },

  convert() {
    // {"hi": {"nested": "world"}, "some": "thing", "else": 3}
    const pane = atom.workspace.getActivePane();
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      try {
        let selection = editor.getSelectedText();
        let parsedSelection = JSON.parse(selection);
        let convertedRubyString = this.convertJSONToRuby(parsedSelection);
        if (convertedRubyString) {
          atom.clipboard.write(convertedRubyString);
          atom.notifications.addSuccess('JSON successfully converted to a Ruby class! The output is in your clipboard.');
          console.log("converted string is:\n\n".concat(convertedRubyString));
        } else {
          console.log("handleConvertedRubyString error");
          atom.notifications.addError('Parsing failed');
        }
      } catch (e) {
        atom.notifications.addError('Parsing failed');
        console.log(e.message);
      }
    }
  },

  convertJSONToRuby(jsonObject) {
    return this.createRubyClassDefinition(jsonObject, null);
  },

  createRubyClassDefinition(jsonObject, desiredClassName) {
    // {"hi": {"nested": "world"}, "some": "thing", "else": 3}
    try {
      if(desiredClassName === null) {
        desiredClassName = "SomeClass";
      }
      let attributesString = "";
      // let attributesString = this.createAttributesString(jsonObject);
      let output = "class ".concat(desiredClassName, "\n", attributesString, "\n", "end\n\n");
      console.log(output);
      let nestedClasses = this.createNestedClassDefinitions(jsonObject);
      return output.concat(nestedClasses, "\n");
    } catch (e) {
      console.log("createRubyClassDefinition error");
      atom.notifications.addError('Parsing failed');
      console.log(e.message);
    }
    return "jkljkljk";
  },

  createNestedClassDefinitions(jsonObject) {
    // {"hi": {"nested": "world"}}
    try {
      let output = "";
      if(this.objectHasNestedValues(jsonObject)) {
        let nextNestedJSONObject = this.getNextNestedJSONObjectKey(jsonObject);
        let nestedRubyClassDef1 = this.createRubyClassDefinition(nextNestedJSONObject.jsonObject, nextNestedJSONObject.key);
        output.concat(nestedRubyClassDef1);
        console.log(output);
        return nestedRubyClassDef1;
      } else {
        return "";
      }
    } catch (e) {
      console.log(e.message);
    }
    console.log(output);
    return output;
  },

  createAttributesString(jsonObject) {
    // console.log("creating attributes string");
    // {"hi": {"nested": "world"}, "some": "thing", "else": 3}
    try {
      const ATTR_ACCESSOR = "attr_accessor :";
      let keys = Object.keys(jsonObject);
      let attributesString = "";
      let additionalClasses = [];
      keys.forEach(key => {
        attributesString = attributesString.concat("\t", ATTR_ACCESSOR, this.camelToUnderscore(key), "\n");
      });
      return attributesString;
    } catch (e) {
      atom.notifications.addError('Parsing failed');
      console.log(e.message);
    }
    return "";
  },

  sanitizeJSONObject(jsonObject) {
    var _ = require('lodash');
    let arry = _.compact(jsonObject);
    return arry;
  },

  objectHasNestedValues(jsonObject) {
    output = false;
    try {
      let keys = Object.keys(jsonObject);
      keys.forEach(key => {
        if(jsonObject[key].constructor === Object) { // https://stackoverflow.com/questions/332422/get-the-name-of-an-objects-type
          output = true;
        }
      });
      return output;
    } catch (e) {
      console.log("objectHasNestedValues");
      console.log(e.message);
    }
  },

  objectIsNested(jsonObject) {
    if(jsonObject.constructor === Object) {
      return true;
    }
    else {
      return false
    }
  },

  getNextNestedJSONObjectKey(jsonObject) {
    let keys = Object.keys(jsonObject);
    let output = {};
    keys.forEach(key => {
      if(jsonObject[key].constructor === Object) { // https://stackoverflow.com/questions/332422/get-the-name-of-an-objects-type
        output.jsonObject = jsonObject[key];
        output.key = key;
      }
    });
    return output;
  },

  // TODO: replace this
  camelToUnderscore(key) {
    try {
      return key.replace( /([A-Z])/g, "_$1").toLowerCase();
    } catch (e) {
      atom.notifications.addError('Parsing failed');
      console.log(e.message);
    }
  }

};
