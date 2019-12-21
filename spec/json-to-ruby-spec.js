'use babel';

import JsonToRuby from '../lib/json-to-ruby';

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('JsonToRuby', () => {
  let workspaceElement, activationPromise;

  beforeEach(() => {
    workspaceElement = atom.views.getView(atom.workspace);
    activationPromise = atom.packages.activatePackage('json-to-ruby');
  });

  describe('when the json-to-ruby:toggle event is triggered', () => {
    it('hides and shows the modal panel', () => {
      // Before the activation event the view is not on the DOM, and no panel
      // has been created
      expect(workspaceElement.querySelector('.json-to-ruby')).not.toExist();

      // This is an activation event, triggering it will cause the package to be
      // activated.
      atom.commands.dispatch(workspaceElement, 'json-to-ruby:toggle');

      waitsForPromise(() => {
        return activationPromise;
      });

      runs(() => {
        expect(workspaceElement.querySelector('.json-to-ruby')).toExist();

        let jsonToRubyElement = workspaceElement.querySelector('.json-to-ruby');
        expect(jsonToRubyElement).toExist();

        let jsonToRubyPanel = atom.workspace.panelForItem(jsonToRubyElement);
        expect(jsonToRubyPanel.isVisible()).toBe(true);
        atom.commands.dispatch(workspaceElement, 'json-to-ruby:toggle');
        expect(jsonToRubyPanel.isVisible()).toBe(false);
      });
    });

    it('hides and shows the view', () => {
      // This test shows you an integration test testing at the view level.

      // Attaching the workspaceElement to the DOM is required to allow the
      // `toBeVisible()` matchers to work. Anything testing visibility or focus
      // requires that the workspaceElement is on the DOM. Tests that attach the
      // workspaceElement to the DOM are generally slower than those off DOM.
      jasmine.attachToDOM(workspaceElement);

      expect(workspaceElement.querySelector('.json-to-ruby')).not.toExist();

      // This is an activation event, triggering it causes the package to be
      // activated.
      atom.commands.dispatch(workspaceElement, 'json-to-ruby:toggle');

      waitsForPromise(() => {
        return activationPromise;
      });

      runs(() => {
        // Now we can test for view visibility
        let jsonToRubyElement = workspaceElement.querySelector('.json-to-ruby');
        expect(jsonToRubyElement).toBeVisible();
        atom.commands.dispatch(workspaceElement, 'json-to-ruby:toggle');
        expect(jsonToRubyElement).not.toBeVisible();
      });
    });

    // TODO: make these integration tests run : )
    it('converts a 1 dimensional JSON string to a ruby class', () => {
      let expected = "".concat("class SomeClass", "\n\t", "attr_accessor :phrase",
        "\n", "end");
      let actual = createRubyClassFromValidJSON("{\"key\": \"value\"}");
    });

    it('converts a 2 dimensional JSON string to a ruby class', () => {
      let expected = "".concat("class SomeClass", "\n\t", "attr_accessor :key1",
        "\n\t", "attr_accessor :key2", "\n", "end");
      let actual = createRubyClassFromValidJSON("{\"key1\": \"value1\", \"key2\": \"value2\"}";)
    });

    it('replaces camelcased variables with snake case'), () => {
      let expected = "".concat("class SomeClass", "\n\t", "attr_accessor :snake_cased",
        "\n", "end");
      let actual = createRubyClassFromValidJSON("{\"snakeCased\": \"value\"}");
    });

    it('replaces camelcased variables with 2 humps to snake case'), () => {
      let expected = "".concat("class SomeClass", "\n\t", "attr_accessor :snake_cased_second_hump",
        "\n", "end");
      let actual = createRubyClassFromValidJSON("{\"snakeCasedFirstHump\": \"value1\",
        \"snakeCasedSecondHump\": \"value2\"}");
    });

  });
});
