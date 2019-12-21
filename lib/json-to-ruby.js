'use babel';

import JsonToRubyView from './json-to-ruby-view';
import { CompositeDisposable } from 'atom';

export default {

  jsonToRubyView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.jsonToRubyView = new JsonToRubyView(state.jsonToRubyViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.jsonToRubyView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'json-to-ruby:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.jsonToRubyView.destroy();
  },

  serialize() {
    return {
      jsonToRubyViewState: this.jsonToRubyView.serialize()
    };
  },

  toggle() {
    // {"phrase": "hi mom!"}
    console.log('Parsing highlighted JSON!\n');
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      try {
        let selection = editor.getSelectedText();
        let parsedSelection = JSON.parse(selection);
        let convertedRubyString = this.createRubyClassFromValidJSON(parsedSelection);
        console.log(convertedRubyString);
      } catch (e) {
        console.log(e.message);
      }
    }
  },

  createAttributesString(jsonObject) {
    // {"phrase": "hi mom!"}
    try {
      const ATTR_ACCESSOR = "attr_accessor :";
      let keys = Object.keys(jsonObject);
      let attributesString = "";
      keys.forEach(key => {
        attributesString = attributesString.concat("\t", ATTR_ACCESSOR, key, "\n");
      });
      return attributesString;
    } catch (e) {
      console.log(e.message);
    }
    return "";
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
  },

};
