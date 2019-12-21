'use babel';

import { CompositeDisposable } from 'atom';

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
    // {"hi": "world"}
    const pane = atom.workspace.getActivePane();
    console.log('Parsing highlighted JSON!\n');
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      try {
        let selection = editor.getSelectedText();
        let parsedSelection = JSON.parse(selection);
        let convertedRubyString = this.createRubyClassFromValidJSON(parsedSelection);
        if (convertedRubyString) {
          atom.clipboard.write(convertedRubyString);
          atom.notifications.addSuccess('JSON successfully converted to a Ruby class! The output is in your clipboard.');
        } else {
          atom.notifications.addError('Parsing failed');
        }
      } catch (e) {
        console.log(e.message);
      }
    }
  },

  createAttributesString(jsonObject) {
    try {
      const ATTR_ACCESSOR = "attr_accessor :";
      let keys = Object.keys(jsonObject);
      let attributesString = "";
      keys.forEach(key => {
        attributesString = attributesString.concat("\t", ATTR_ACCESSOR, this.camelToUnderscore(key), "\n");
      });
      return attributesString;
    } catch (e) {
      console.log(e.message);
    }
    return "";
  },

  camelToUnderscore(key) {
    return key.replace( /([A-Z])/g, "_$1").toLowerCase();
  },

  createRubyClassFromValidJSON(jsonObject) {
    try {
      let attributesString = this.createAttributesString(jsonObject);
      let klassString = "class SomeClass".concat("\n", attributesString, "end");
      return klassString;
    } catch (e) {
      console.log(e.message);
    }
    return "";
  }

};
