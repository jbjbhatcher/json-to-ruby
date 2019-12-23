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

  // createClassDefsFromValidJSON(jsonObject) {
  //   if(!this.objectHasNestedValues(jsonObject)) {
  //     classdef = createClass() + createAttributes() + END;
  //     return classdef;
  //   } else {
  //     classdefs = []
  //     while(this.objectHasNestedValues(jsonObject)) {
  //       classdef = createClass() + createAttributes() + END
  //       classdefs.push(classdef)
  //     }
  //     return classdefs
  // },
  //
  // objectHasNestedValues(jsonObject) {
  //   let keys = Object.keys(jsonObject);
  //   keys.forEach(key => {
  //     if(jsonObject[key].constructor === Object) { // https://stackoverflow.com/questions/332422/get-the-name-of-an-objects-type
  //       return true;
  //     } else {
  //       return false;
  //     }
  //   });
  // }

  convert() {

    console.log(test());

    // {"hi": {"nested": "world"}, "some": "thing", "else": 3}
    const pane = atom.workspace.getActivePane();
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      try {
        let selection = editor.getSelectedText();
        let parsedSelection = JSON.parse(selection);
        let convertedRubyString = this.createRubyClassDefinition(parsedSelection);
        if (convertedRubyString) {
          atom.clipboard.write(convertedRubyString);
          atom.notifications.addSuccess('JSON successfully converted to a Ruby class! The output is in your clipboard.');
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

  createRubyClassDefinition(jsonObject) {
    try {
      // get all of the nested classes, and create class defs.
        // push them to this array,
        // then, create this class's attributes
      let nestedClassDefinitions = parseNestedJSONObjects(jsonObject);

      let attributesString = this.createAttributesString(jsonObject).attributesString;
      let klassString = "class SomeClass".concat("\n", attributesString, "end");
      let nestedKlassString = this.createAttributesString(jsonObject).nestedClasses;
      return klassString.concat(nestedKlassString);
    } catch (e) {
      console.log("createRubyClassFromValidJSON error");
      atom.notifications.addError('Parsing failed');
      console.log(e.message);
    }
    return "";
  },

  // utility methods
  createNestedAttrClassDefString(nestedJSONObject) {
    try {
      let convertedRubyString = this.createRubyClassFromValidJSON(nestedJSONObject);
      return "\n\n".concat(convertedRubyString);
    } catch (e) {
      atom.notifications.addError('Parsing failed');
      console.log(e.message);
    }
  },

  // NOTE: DO NOT need to handle class parsing in this portion; this...
    // should strictly get the keys and convert them to attribute accessors
  createAttributesString(jsonObject) {
    // {"hi": {"nested": "world"}, "some": "thing", "else": 3}
    try {
      const ATTR_ACCESSOR = "attr_accessor :";
      let keys = Object.keys(jsonObject);
      let attributesString = "";
      let additionalClasses = [];
      keys.forEach(key => {
        console.log("DEBUG: ");
        console.log(jsonObject[key].constructor.name);
        if(jsonObject[key].constructor === Object) { // https://stackoverflow.com/questions/332422/get-the-name-of-an-objects-type
          console.log("There has been a nested object found");
          additionalClasses.push(this.createNestedAttrClass(jsonObject[key]));
          console.log(additionalClasses);
        }
        attributesString = attributesString.concat("\t", ATTR_ACCESSOR, this.camelToUnderscore(key), "\n");
      });
      console.log(additionalClasses);
      return {"attributesString": attributesString, "nestedClasses": additionalClasses};
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
